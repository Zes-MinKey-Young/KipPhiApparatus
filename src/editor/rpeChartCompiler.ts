
/**
 * 全生命周期只会编译一次，想多次就再构造一个
 */
class RPEChartCompiler {
    sequenceMap: Map<EventNodeSequence<any>, EventNodeSequence<any>> = new Map();
    interpolationStep: TimeT = [0, 1, 16];
    constructor(public chart: Chart) {}

    compileChart(): ChartDataRPE {
        console.time("compileChart")
        const chart = this.chart;
        const judgeLineGroups = chart.judgeLineGroups.map(group => group.name);
        const judgeLineList = chart.judgeLines.map(line => this.compileJudgeLine(line));
        const BPMList = chart.timeCalculator.dump();
        const META: MetaData = {
            RPEVersion: 1,
            background: 'illustration.png',
            charter: chart.charter,
            composer: chart.composer,
            illustration: chart.illustrator,
            id: Math.random().toString().slice(2, 10),
            level: chart.level,
            name: chart.name,
            offset: chart.offset,
            song: chart.name
        };

        for (const uiName of ["bar", "combo", "combonumber", "level", "name", "pause", "score"] satisfies UIName[]) {
            const target: JudgeLine | null = chart[`${uiName}Attach` satisfies keyof Chart];
            if (!target) {
                continue;
            }
            const lineData = judgeLineList[target.id];
            // RPEJSON里面一条线只能绑一个UI，KPAJSON可以绑多个
            // 所以如果绑了多个，自动给它们创建子线
            if (lineData.attachUI) {
                judgeLineList.push({
                    Group: 0,
                    Name: "Auto created for " + uiName,
                    Texture: "line.png",
                    attachUI: uiName,
                    notes: [],
                    bpmfactor: 1.0,
                    eventLayers: [],
                    father: target.id,
                    isCover: lineData.isCover,
                    numOfNotes: 0
                } satisfies Partial<JudgeLineDataRPE> as JudgeLineDataRPE)
            } else {
                lineData.attachUI = uiName;
            }
        }


        console.timeEnd("compileChart");
        return {
            BPMList,
            META,
            judgeLineList,
            judgeLineGroup: judgeLineGroups,
            multiLineString: '',
            multiScale: 1.0,
            chartTime: chart.rpeChartingTime * 60,
            kpaChartTime: chart.chartingTime,
        };
    }

    compileJudgeLine(judgeLine: JudgeLine): JudgeLineDataRPE {
        const chart = this.chart;
        const notes = this.compileNNLists([...judgeLine.nnLists.values()], [...judgeLine.hnLists.values()]);
        
        return {
            notes: notes,
            Group: chart.judgeLineGroups.indexOf(judgeLine.group),
            Name: judgeLine.name,
            Texture: judgeLine.texture,
            bpmfactor: 1.0,
            eventLayers: judgeLine.eventLayers.map((layer): EventLayerDataRPE => ({
                moveXEvents: layer.moveX ? this.dumpEventNodeSequence(layer.moveX) : null,
                moveYEvents: layer.moveY ? this.dumpEventNodeSequence(layer.moveY) : null,
                rotateEvents: layer.rotate ? this.dumpEventNodeSequence(layer.rotate) : null,
                alphaEvents: layer.alpha ? this.dumpEventNodeSequence(layer.alpha) : null,
                speedEvents: layer.speed ? this.dumpEventNodeSequence(layer.speed) : null
            })),
            extended: {
                scaleXEvents: judgeLine.extendedLayer.scaleX ? this.dumpEventNodeSequence(judgeLine.extendedLayer.scaleX) : null,
                scaleYEvents: judgeLine.extendedLayer.scaleY ? this.dumpEventNodeSequence(judgeLine.extendedLayer.scaleY) : null,
                textEvents: judgeLine.extendedLayer.text ? this.dumpEventNodeSequence(judgeLine.extendedLayer.text) : null,
                colorEvents: judgeLine.extendedLayer.color ? this.dumpEventNodeSequence(judgeLine.extendedLayer.color) : null
            },
            father: judgeLine.father?.id ?? -1,
            isCover: judgeLine.cover ? 1 : 0,
            numOfNotes: notes.length,
            anchor: judgeLine.anchor,
            rotateWithFather: judgeLine.rotatesWithFather,
            isGif: 0,
            zOrder: judgeLine.zOrder
        };
    }
    
    compileEvent<VT>(snode: EventStartNode<VT>, getValue: (node: EventStartNode<VT> | EventEndNode<VT>) => VT): EventDataRPELike<VT> {
        const endNode = snode.next as EventEndNode<VT>;
        const isSegmented = snode.easingIsSegmented
        const easing = isSegmented ? (snode.easing as SegmentedEasing).easing : snode.easing;
        
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: isSegmented ? (snode.easing as SegmentedEasing).left : 0.0,
            easingRight: isSegmented ? (snode.easing as SegmentedEasing).right : 1.0,
            easingType: easing instanceof NormalEasing ?
                    easing.rpeId ?? 1 :
                    null,
            end: getValue(easing === fixedEasing ? snode : endNode),
            endTime: endNode.time,
            linkgroup: 0, // 假设默认值为 0
            start: getValue(snode),
            startTime: snode.time
        }
    }

    dumpEventNodeSequence<VT>(sequence: EventNodeSequence<VT>): EventDataRPELike<VT>[] {
        const nodes: EventDataRPELike<VT>[] = [];
        const interpolationStep = this.interpolationStep;
        if (!(sequence.type === EventType.color || sequence.type === EventType.text)) {
            // @ts-ignore 烦死了烦死了烦死了
            sequence = this.substitute(sequence);
        }
        let node = sequence.head.next;
        // 唯一真史
        const getValue = (sequence.type === EventType.text
            ? (node: EventStartNode<string> | EventEndNode<string>) => {
                const interpretedAs = node instanceof EventStartNode ? node.interpretedAs : node.previous.interpretedAs;
                return interpretedAs === InterpreteAs.str ? node.value : "%P%" + node.value;
            }
            : (node: EventStartNode<number> | EventEndNode<number>) => node.value) as unknown as (node: EventStartNode<VT> | EventEndNode<VT>) => VT;
        while (true) {
            const end = node.next;
            if (end.type === NodeType.TAIL) break;
            if (node.easing instanceof ParametricEquationEasing) {
                let cur = node.time;
                const endTime = end.time;
                let value = getValue(node);
                for (; TC.lt(cur, endTime);) {
                    const nextTime = TC.validateIp(TC.add(cur, interpolationStep));
                    const nextValue = node.getValueAt(TC.toBeats(nextTime))
                    nodes.push({
                        bezier: 0,
                        bezierPoints: [0, 0, 0, 0],
                        easingLeft: 0.0,
                        easingRight: 0.0,
                        easingType: 1,
                        start: value,
                        startTime: cur,
                        end: nextValue,
                        endTime: nextTime,
                        linkgroup: 0
                    });
                    cur = nextTime;
                    value = nextValue;
                }
                // 所切割的事件长度并不必然是step的整数倍
                nodes.push({
                    bezier: 0,
                    bezierPoints: [0, 0, 0, 0],
                    easingLeft: 0.0,
                    easingRight: 0.0,
                    easingType: 1,
                    start: value,
                    startTime: cur,
                    end: end.value,
                    endTime: endTime,
                    linkgroup: 0
                })
                
            } else {
                nodes.push(this.compileEvent(node, getValue));
            }
            node = end.next;
        }
        nodes.push(node.dumpAsLast());

        return nodes
    }

    compileNNLists(nnLists: NNList[], hnLists: HNList[]): NoteDataRPE[] {
        const noteLists = nnLists.map(list => this.nnListToArray(list));
        const holdLists = hnLists.map(list => this.nnListToArray(list));
        const ret: NoteDataRPE[] = []
        const time = (list: NoteDataRPE[]) => list.length === 0 ? [Infinity, 0, 1] as TimeT : list[list.length - 1].startTime;
        const concatWithOrder = (lists: NoteDataRPE[][]) => {
            if (lists.length === 0) return;
            // 先按最早的时间排序
            lists.sort((a, b) => {
                return TimeCalculator.gt(time(a), time(b)) ? 1 : -1;
            });
            // 每次从lists中第一个list pop一个data加入到结果，然后冒泡调整这个list的位置
            while (lists[0].length > 0) {
                const list = lists[0];
                // 只需要pop就可以了，pop复杂度O(1)，这是倒序的原因
                const node = list.pop();
                ret.push(node);
                let i = 0;
                while (i + 1 < lists.length && TimeCalculator.gt(time(lists[i]), time(lists[i + 1]))) {
                    const temp = lists[i];
                    lists[i] = lists[i + 1];
                    lists[i + 1] = temp;
                    i++;
                }
            }

        };
        concatWithOrder(noteLists);
        concatWithOrder(holdLists);
        return ret;
    }
    /**
     * 倒序转换为数组
     * @param nnList 
     * @returns 一个按照时间降序排列的数组
     */
    nnListToArray(nnList: NNList) {
        const notes: NoteDataRPE[] = [];
        let node: NNOrHead = nnList.tail.previous;
        while (node.type !== NodeType.HEAD) {
            for (let each of node.notes) {
                notes.push(each.dumpRPE(this.chart.timeCalculator));
            }
            node = node.previous;
        }
        return notes;
    }

    /**
     * 将当前序列中所有通过模板缓动引用了其他序列的事件直接展开为被引用的序列内容
     * transform all events that reference other sequences by template easing
     * into the content of the referenced sequence
     * 有点类似于MediaWiki的{{subst:templateName}}
     * @param map 由TemplateEasingLib提供
     * @returns 
     */
    substitute(seq: EventNodeSequence): EventNodeSequence {
        const map = this.sequenceMap;
        if (map.has(seq)) {
            return map.get(seq);
        }
        let currentNode: EventStartNode = seq.head.next;
        const newSeq = new EventNodeSequence(seq.type, seq.effectiveBeats);
        map.set(seq, newSeq);
        let currentPos: EventNodeLike<NodeType.HEAD> | EventEndNode = newSeq.head;
        while (true) {
            if (!currentNode || (currentNode.next.type === NodeType.TAIL)) {
                break;
            }
            const endNode = currentNode.next;
            if (currentNode.innerEasing instanceof TemplateEasing) {
                
                const srcSeq = this.substitute(currentNode.innerEasing.eventNodeSequence);
                const easing = currentNode.easing;
                const isSegmented = easingIsSegmented(easing);
                const startValue = currentNode.value;
                const endValue = currentNode.next.value;
                const delta = endValue - startValue;
                const startTime = currentNode.time;
                const timeDelta = TC.sub(currentNode.next.time, startTime);


                let srcStart: number, srcEnd: number, leftDividedNode: EventStartNode, rightDividedNode: EventStartNode,
                    srcStartTime: TimeT, srcTimeDelta: TimeT, toStopAt: EventStartNode;
                if (isSegmented) {
                    const totalDuration = TC.sub(srcSeq.tail.previous.time, srcSeq.head.next.time);
                    srcStart = srcSeq.getValueAt(easing.left * srcSeq.effectiveBeats)
                    srcEnd = srcSeq.getValueAt(easing.right * srcSeq.effectiveBeats, true);
                    leftDividedNode = srcSeq.getNodeAt(easing.left * srcSeq.effectiveBeats);
                    rightDividedNode = srcSeq.getNodeAt(easing.right * srcSeq.effectiveBeats, true);
                    toStopAt = rightDividedNode.next.next;
                    srcStartTime = TC.mul(totalDuration, numberToRatio(easing.left));
                    const srcEndTime = TC.mul(totalDuration, numberToRatio(easing.right));
                    TC.validateIp(srcStartTime);
                    TC.validateIp(srcEndTime);
                    srcTimeDelta = TC.sub(srcEndTime, srcStartTime);
                    TC.validateIp(srcTimeDelta);
                } else {
                    srcStart = srcSeq.head.next.value;
                    srcEnd = srcSeq.tail.previous.value;
                    leftDividedNode = srcSeq.head.next;
                    rightDividedNode = srcSeq.tail.previous;
                    toStopAt = rightDividedNode;
                    srcStartTime = srcSeq.head.next.time;
                    srcTimeDelta = TC.sub(srcSeq.tail.previous.time, srcStartTime);
                }
                
                const srcDelta = srcEnd - srcStart;
                const ratio = TC.div(timeDelta, srcTimeDelta)
                
                const convert: (v: number) => number
                    = (value: number) => startValue + (value - srcStart) * delta / srcDelta;
                // 我恨TS没有运算符重载
                const convertTime: (t: TimeT) => TimeT
                    = (time: TimeT) => TC.validateIp(TC.add(startTime, TC.mul(TC.sub(time, srcStartTime), ratio)));

                const first = currentNode.clone();
                EventNode.connect(currentPos, first)
                // 处理第一个节点的截段
                if (isSegmented) {
                    const left = easing.left * srcSeq.effectiveBeats
                    if (TC.toBeats(leftDividedNode.time) - left > 1e-6) {
                        // 断言：这里left不会大于有效拍数
                        const newLeft = left / (TC.toBeats((leftDividedNode.next as EventEndNode).time) - TC.toBeats(leftDividedNode.time))
                        first.easing = new SegmentedEasing(leftDividedNode.easing, newLeft, 1.0);
                    } else {
                        first.easing = leftDividedNode.easing;
                    }
                } else {
                    first.easing = srcSeq.head.next.easing;
                }
                let prev = first
                // 这里在到toStopAt之前一直都是非尾的
                for (let n: EventEndNode<number> = leftDividedNode.next as EventEndNode<number>; n.next !== toStopAt; n = n.next.next) {
                    const endNode = n;
                    const startNode = n.next;
                    const newEnd = new EventEndNode(convertTime(endNode.time), convert(endNode.value));
                    const newStart = new EventStartNode(convertTime(startNode.time), convert(startNode.value));
                    newStart.easing = startNode.easing;
                    EventNode.connect(prev, newEnd)
                    EventNode.connect(newEnd, newStart);
                    prev = newStart;
                }
                // 处理最后一个节点的截段
                if (isSegmented) {
                    const right = easing.right * srcSeq.effectiveBeats
                    if (TC.toBeats((rightDividedNode.next as EventEndNode).time) - right > 1e-6) {
                        // 断言：这里right不会大于有效拍数
                        const newRight = right / (TC.toBeats((rightDividedNode.next as EventEndNode).time) - TC.toBeats(rightDividedNode.time))
                        // 这时候prev是最后一个subst的node
                        prev.easing = new SegmentedEasing(rightDividedNode.easing, 0.0, newRight)
                    }

                }
                const endNode = currentNode.next.clone();
                EventNode.connect(prev, endNode);
                currentPos = endNode;
                endNode.value =  isSegmented ? endNode.value : convert((srcSeq.tail.previous.previous as EventEndNode).value);
            } else {
                const newStartNode = currentNode.clone();
                const newEndNode = endNode.clone();
                EventNode.connect(currentPos, newStartNode)
                EventNode.connect(newStartNode, newEndNode);
                currentPos = newEndNode;
            }
            currentNode = endNode.next;
        }
        const lastStart = currentNode.clone();
        EventNode.connect(currentPos, lastStart);
        EventNode.connect(lastStart, newSeq.tail)
        return newSeq;
    }
}


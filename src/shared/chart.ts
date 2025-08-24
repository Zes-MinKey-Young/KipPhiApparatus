

enum EventType {
    moveX,
    moveY,
    rotate,
    alpha,
    speed,
    easing,
    bpm
}
enum NoteType {
    tap=1,
    drag=4,
    flick=3,
    hold=2
}

type BasicEventName = "moveX" | "moveY" | "rotate" | "alpha" | "speed"

interface EventLayer {
    moveX?: EventNodeSequence;
    moveY?: EventNodeSequence;
    rotate?: EventNodeSequence;
    alpha?: EventNodeSequence;
    speed?: EventNodeSequence;
}



type Plain<T> = {[k: string]: T}

/**
 * 相当于 Python 推导式
 * @param arr 
 * @param expr 
 * @param guard 
 * @returns 
 */
function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => boolean): RT[] {
    let ret: RT[] = []
    for (let each of arr) {
        if (!guard || guard && guard(each)) {
            ret.push(expr(each))
        }
    }
    return ret;
}
/**
 * 相当于 Python 推导式
 * @param obj
 * @param expr 
 * @param guard 
 * @returns 
 */
 function dictForIn<T, RT>(obj: Plain<T>, expr: (v: T) => RT, guard?: (v: T) => boolean): Plain<RT> {
    let ret: Plain<RT> = {}
    for (let key in obj) {
        const each = obj[key]
        if (!guard || guard && guard(each)) {
            ret[key] = expr(each)
        }
    }
    return ret;
}


type UIName = "combo"  | "combonumber" | "score" | "pause" | "bar" | "name" | "level"

class Chart {
    judgeLines: JudgeLine[] = [];
    bpmList: BPMSegmentData[] = [];
    timeCalculator = new TimeCalculator();
    orphanLines: JudgeLine[] = [];
    // comboMapping: ComboMapping;
    name: string = "unknown";
    level: string = "unknown";
    offset: number = 0;
    
    templateEasingLib = new TemplateEasingLib;
    sequenceMap = new Map<string, EventNodeSequence>();

    effectiveBeats: number;
    nnnList: NNNList;
    /**  */
    judgeLineGroups: JudgeLineGroup[] = [];
    duration: number;


    chartingTime: number;
    rpeChartingTime: number;

    
    modified: boolean = false;
    maxCombo: number = 0;


    pauseAttach:       JudgeLine | null = null;
    combonumberAttach: JudgeLine | null = null;
    comboAttach:       JudgeLine | null = null;
    barAttach:         JudgeLine | null = null;
    scoreAttach:       JudgeLine | null = null;
    nameAttach:        JudgeLine | null = null;
    levelAttach:       JudgeLine | null = null;

    constructor() {}
    getEffectiveBeats() {
        const effectiveBeats = this.timeCalculator.secondsToBeats(this.duration)
        console.log(effectiveBeats)
        this.effectiveBeats = effectiveBeats
        return this.effectiveBeats
    }
    static fromRPEJSON(data: ChartDataRPE, duration: number) {
        const chart = new Chart();
        chart.judgeLineGroups = data.judgeLineGroup.map(group => new JudgeLineGroup(group));
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.duration = duration;
        chart.rpeChartingTime = data.chartTime ? Math.round(data.chartTime / 60) : 0;
        chart.chartingTime = 0;
        chart.updateCalculator()
        console.log(chart, chart.getEffectiveBeats())
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        
        // let line = data.judgeLineList[0];
        const judgeLineDataList: JudgeLineDataRPE[] = <JudgeLineDataRPE[]>data.judgeLineList;
        const judgeLineList: JudgeLine[] = judgeLineDataList.map(
            (lineData, id) =>
                JudgeLine.fromRPEJSON(chart, id, lineData, chart.templateEasingLib, chart.timeCalculator)
        );
        const length = judgeLineList.length;
        chart.judgeLines = judgeLineList;
        for (let i = 0; i < length; i++) {
            const data = judgeLineDataList[i];
            const line = judgeLineList[i];
            const father = data.father === -1 ? null : judgeLineList[data.father];
            if (father) {
                father.children.add(line);
            } else {
                chart.orphanLines.push(line);
            }
        }
        chart.countMaxCombo();
        return chart
    }
    static fromKPAJSON(data: ChartDataKPA) {
        const chart = new Chart();
        chart.bpmList = data.bpmList;
        chart.duration = data.duration;
        chart.name = data.info.name;
        chart.level = data.info.level;
        chart.offset = data.offset;
        chart.judgeLineGroups = data.judgeLineGroups.map(group => new JudgeLineGroup(group));
        chart.chartingTime = data.chartTime ?? 0;
        chart.rpeChartingTime = data.rpeChartTime ?? 0;
        chart.updateCalculator()
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        const envEasings = data.envEasings;
        const len = envEasings.length
        for (let i = 0; i < len; i++) {
            const easingData = envEasings[i];
            chart.templateEasingLib.require(easingData.name);
        }

        const sequences = data.eventNodeSequences
        const length = data.eventNodeSequences.length
        for (let i = 0; i < length; i++) {
            const seqData = sequences[i];
            const sequence = EventNodeSequence.fromRPEJSON(seqData.type, seqData.events, chart, seqData.endValue);
            sequence.id = seqData.id;
            chart.sequenceMap.set(sequence.id, sequence);
        }
        for (let i = 0; i < len; i++) {
            const easingData = envEasings[i];
            chart.templateEasingLib.implement(easingData.name, chart.sequenceMap.get(easingData.content));
        }
        chart.templateEasingLib.check()
        const isOld = !data.version || data.version < 150
        for (let lineData of data.orphanLines) {
            const line: JudgeLine = JudgeLine.fromKPAJSON(isOld, chart, lineData.id, lineData, chart.templateEasingLib, chart.timeCalculator)
            chart.orphanLines.push(line)
        }
        chart.judgeLines.sort((a, b) => a.id - b.id);
        chart.countMaxCombo();
        
        const ui = data.ui;
        if (ui) for (const uiname of ["combo", "combonumber", "score", "pause", "bar", "name", "level"] satisfies UIName[]) {
            if (typeof ui[uiname] === "number") { // 踩坑，线号可为0
                const line = chart.judgeLines[ui[uiname]]
                if (!line) {
                    continue;
                }
                chart.attachUIToLine(uiname, line);
            }
        }
        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.duration = this.duration;
        this.timeCalculator.update()
    }
    updateEffectiveBeats(duration: number) {
        const EB = this.timeCalculator.secondsToBeats(duration);
        for (let i = 0; i < this.judgeLines.length; i++) {
            const judgeLine = this.judgeLines[i]
            judgeLine.updateEffectiveBeats(EB);
        }
    }
    dumpKPA(): Required<ChartDataKPA> {
        const eventNodeSequences = new Set<EventNodeSequence>();
        const orphanLines = [];
        for (let line of this.orphanLines) {
            orphanLines.push(line.dumpKPA(eventNodeSequences, this.judgeLineGroups));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData: EventNodeSequenceDataKPA[] = [];
        for (let sequence of eventNodeSequences) {
            eventNodeSequenceData.push(sequence.dump());
        }
        return {
            version: VERSION,
            duration: this.duration,
            bpmList: this.timeCalculator.dump(),
            envEasings: envEasings,
            eventNodeSequences: eventNodeSequenceData,
            info: {
                level: this.level,
                name: this.name
            },
            ui: {
                combo: this.comboAttach?.id,
                combonumber: this.combonumberAttach?.id,
                score: this.scoreAttach?.id,
                pause: this.pauseAttach?.id,
                bar: this.barAttach?.id,
                name: this.nameAttach?.id,
                level: this.levelAttach?.id
            },
            offset: this.offset,
            orphanLines: orphanLines,
            judgeLineGroups: this.judgeLineGroups.map(g => g.name),
            chartTime: this.chartingTime,
            rpeChartTime: this.rpeChartingTime
        };
    }
    createNNNode(time: TimeT) {
     return new NNNode(time)
    }
    createEventNodeSequence(type: EventType, name: string) {
        if (this.sequenceMap.has(name)) {
            throw new Error(`The name ${name} is occupied.`)
        }
        const seq = EventNodeSequence.newSeq(type, this.getEffectiveBeats());
        seq.id = name;
        this.sequenceMap.set(name, seq);
        return seq;
    }
    countMaxCombo() {
        let combo = 0;
        const nnnlist = this.nnnList;
        for (let node: NNNOrTail = nnnlist.head.next; node.type !== NodeType.TAIL; node = node.next) {
            const nns = node.noteNodes;
            const nnsLength = nns.length;
            for (let i = 0; i < nnsLength; i++) {
                const nn = nns[i];
                combo += nn.notes.reduce((prev, note) => prev + (note.isFake ? 0 : 1), 0);
            }
            const hns = node.holdNodes;
            const hnsLength = hns.length;
            for (let i = 0; i < hnsLength; i++) {
                const hn = hns[i];
                combo += hn.notes.reduce((prev, hold) => prev + (hold.isFake ? 0 : 1), 0);
            }
        }
        this.maxCombo = combo;
    }
    attachUIToLine(ui: UIName, judgeLine: JudgeLine) {
        const key = `${ui}Attach` satisfies keyof Chart;
        if (this[key]) {
            throw new Error(`UI ${ui} is occupied`);
        }
        this[key] = judgeLine;
        judgeLine.hasAttachUI = true;
    }
    detachUI(ui: UIName) {
        const key = `${ui}Attach` satisfies keyof Chart;
        const judgeLine = this[key];
        if (!judgeLine) {
            return;
        }
        this[key] = null;
        if (![ // 看着好丑
            this.barAttach,
            this.nameAttach,
            this.comboAttach,
            this.scoreAttach,
            this.combonumberAttach,
            this.levelAttach,
            this.pauseAttach
        ].includes(judgeLine)) {
                judgeLine.hasAttachUI = false;
            }
    }
    queryJudgeLineUI(judgeLine: JudgeLine): UIName[] {
        const arr: UIName[] = [];
        for (const ui of ["combo", "combonumber", "score", "pause", "bar", "name", "level"] satisfies UIName[]) {
            if (this[`${ui}Attach` satisfies keyof Chart] === judgeLine) {
                arr.push(ui);
            }
        }
        return arr;
    }
    scanAllTextures() {
        const textures: Set<string> = new Set;
        for (const line of this.judgeLines) {
            textures.add(line.texture);
        }
        return textures
    }
}

class JudgeLineGroup {
    judgeLines: JudgeLine[];
    constructor(public name: string) {
        this.judgeLines = []
    }
    add(judgeLine: JudgeLine) {
        // 加入之前已经按照ID升序排列
        // 加入时将新判定线插入到正确位置
        if (judgeLine.group) {
            judgeLine.group.remove(judgeLine);
        }
        judgeLine.group = this;
        
        // 找到正确的位置插入，保持按ID升序排列
        for (let i = 0; i < this.judgeLines.length; i++) {
            if (this.judgeLines[i].id > judgeLine.id) {
                this.judgeLines.splice(i, 0, judgeLine);
                return;
            }
        }
        // 如果没有找到比它大的ID，则插入到末尾
        this.judgeLines.push(judgeLine);
        
    }
    remove(judgeLine: JudgeLine) {
        const index = this.judgeLines.indexOf(judgeLine);
        if (index !== -1) {
            this.judgeLines.splice(index, 1);
        }
    }
    isDefault() {
        return this.name.toLowerCase() === "default";
    }
}

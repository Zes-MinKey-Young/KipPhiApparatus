

abstract class SideEditor extends Z<"div"> {
    element: HTMLDivElement;
    $title: Z<"div">
    $body: Z<"div">
    constructor() {
        super("div");
        this.addClass("side-editor");
        this.$title = $("div").addClass("side-editor-title");
        this.$body = $("div").addClass("side-editor-body");
        this.append(this.$title, this.$body)
    }
    abstract update(): void
}




abstract class SideEntityEditor<T extends object> extends SideEditor {
    
    _target: T extends Set<any> ? T : WeakRef<T>;
    get target() {
        if (this._target && this._target instanceof Set) {
            return this._target
        }
        return this._target?.deref();
    }
    set target(val: T) {
        if (val instanceof Set) {
            this._target = val;
            this.update();
            return;
        }
        this._target = new WeakRef(val);
        this.update();
    }
    abstract update(): void
    constructor() {
        super();
    }
}


class NoteEditor extends SideEntityEditor<Note> {
    noteTypeOptions: BoxOption[] = ["tap", "hold", "flick", "drag"]
        .map((v) => new BoxOption(v, () => {
            editor.operationList.do(new NoteTypeChangeOperation(this.target, NoteType[v]))
        }));

    $warning       = $("span").addClass("side-editor-warning");
    $time          = new ZFractionInput();;
    $endTime       = new ZFractionInput();;
    $type          = new ZDropdownOptionBox(this.noteTypeOptions);
    $position      = new ZInputBox();
    $dir           = new ZSwitch("below", "above"); // 不用RPE的那种下拉框形式，少一个操作
    $speed         = new ZInputBox();
    $real          = new ZSwitch("fake", "real");
    $alpha         = new ZInputBox();
    $size          = new ZInputBox();
    $yOffset       = new ZInputBox();
    $visibleBeats  = new ZInputBox();
    $tint          = new ZInputBox();
    $tintHitEffect = new ZInputBox();
    $judgeSize     = new ZInputBox();
    $setAsDefault  = new ZButton("Set as default");
    $delete        = new ZButton("Delete").addClass("destructive");
    constructor() {
        super()
        this.$title.text("Note (NULL)")
        this.$body.append(
            this.$warning,
            $("span").text("speed"), this.$speed,
            $("span").text("time"),
            $("div").addClass("flex-row").append(this.$time, $("span").text(" ~ "), this.$endTime),
            $("span").text("type"), this.$type,
            $("span").text("pos"), this.$position,
            $("span").text("dir"), this.$dir,
            $("span").text("real"), this.$real,
            $("span").text("alpha"), this.$alpha,
            $("span").text("size"), this.$size,
            $("span").text("AbsYOffset"), this.$yOffset,
            $("span").text("visibleBeats"), this.$visibleBeats,
            $("span").text("tint"), this.$tint,
            $("span").text("tintHitEffects"), this.$tintHitEffect,
            $("span").text("judgeSize"), this.$judgeSize,
            this.$setAsDefault, this.$delete,
        )
        this.$time.onChange((t) => {
            editor.operationList.do(new NoteTimeChangeOperation(this.target, this.target.parentNode.parentSeq.getNodeOf(t)))
            if (this.target.type !== NoteType.hold) {
                this.$endTime.setValue(t)
            }
        })
        this.$endTime.onChange((t) => {
            editor.operationList.do(new HoldEndTimeChangeOperation(this.target, t));
        })
        this.$dir.whenClickChange((checked) => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "above", checked));
        })
        this.$real.whenClickChange((checked) => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "isFake", !checked));
        })
        // 这里缺保卫函数
        this.$position.whenValueChange(() => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "positionX", this.$position.getNum()))
        })
        this.$speed.whenValueChange(() => {
            editor.operationList.do(new NoteSpeedChangeOperation(this.target, this.$speed.getNum(), this.target.parentNode.parentSeq.parentLine))
        })
        this.$alpha.whenValueChange(() => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "alpha", this.$alpha.getNum()))
        })
        this.$size.whenValueChange(() => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "size", this.$size.getNum()))
        })
        this.$yOffset.whenValueChange(() => {
            editor.operationList.do(new NoteYOffsetChangeOperation(this.target, this.$yOffset.getNum(), this.target.parentNode.parentSeq.parentLine));

        })
        this.$visibleBeats.whenValueChange(() => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "visibleBeats", this.$visibleBeats.getNum()));
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new NoteDeleteOperation(this.target));
        });
        this.$tint.whenValueChange((str) => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "tint", str === "" ? undefined : parseInt(str, 16)));
        });
        this.$tintHitEffect.whenValueChange((str) => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "tintHitEffects", str === "" ? undefined : parseInt(str, 16)));
        });
        this.$judgeSize.whenValueChange(() => {
            editor.operationList.do(new NotePropChangeOperation(this.target, "judgeSize", this.$judgeSize.getNum()))
        });
        this.$setAsDefault.onClick(() => {
            const note = this.target;
            if (!note) {
                return;
            }
            editor.notesEditor.defaultConfig = {
                alpha: note.alpha,
                size: note.size,
                speed: note.speed,
                isFake: note.isFake ? 1 : 0,
                absoluteYOffset: note.yOffset,
                visibleBeats: note.visibleBeats
            }
        });
    }
    update() {
        const note = this.target
        if (!note) {
            this.$title.text("Note (NULL)")
            return;
        }
        const nnList = note.parentNode.parentSeq;
        if (note.parentNode.parentSeq.parentLine !== editor.judgeLinesEditor.selectedLine) {
            this.$warning.text("This Note doe not belong to the selected JudgeLine.")
        } else {
            this.$warning.text("");
        }
        this.$title.text(`Note (from #${nnList.parentLine.id}.${nnList.id})`);
        this.$time.setValue(note.startTime);
        if (note.type === NoteType.hold) {
            this.$endTime.setValue(note.endTime);
            this.$endTime.disabled = false;
        } else {
            this.$endTime.setValue(note.startTime);
            this.$endTime.disabled = true;
        }
        this.$type.value = this.noteTypeOptions[note.type - 1];
        this.$position.setValue(note.positionX + "")
        this.$dir.checked = note.above;
        this.$real.checked = !note.isFake;
        this.$speed.setValue(note.speed + "")
        this.$alpha.setValue(note.alpha + "")
        this.$yOffset.setValue(note.yOffset + "")
        this.$visibleBeats.setValue(note.visibleBeats + "")
        this.$size.setValue(note.size + "");
        this.$tint.setValue(note.tint ? note.tint.toString(16).padStart(6, "0") : "");
        this.$tintHitEffect.setValue(note.tintHitEffects ? note.tintHitEffects.toString(16).padStart(6, "0") : "");
        this.$judgeSize.setValue(note.judgeSize + "")
    }
}

type CanRepresentTime = TimeT | number | string

const processTimeArg = (time: CanRepresentTime) => {
    if (typeof time === "string") {
        try {
            return processTimeArg(time.match(/^(\d+):(\d+)\/(\d+)$/).map(s => parseInt(s)) as TimeT);
        } catch (e) {
            throw new Error(`Invalid time format: ${time}`);
        }
    } else if (typeof time === "number") {
        return time;
    } else {
        time = [...time]; // 防止从别的什么地方找来一个数据
        TimeCalculator.validateIp(time); // 原地规范化，如果失败就会抛错误，这里不用捕获
        return TimeCalculator.toBeats(time);
    }
}


/**
 * 多音符编辑的辅助函数
 * @param note 原封不动传入音符
 * @param easingFunc 缓动函数（ease开头）
 * @param start 开始点
 * @param end 结束点
 * @returns
 */
const fillCurve = (note: Note | EventNode, easingFunc: ((t: number) => number) | Easing, start: [CanRepresentTime, number], end: [CanRepresentTime, number]): number => {
    if (easingFunc instanceof Easing) {
        const easing = easingFunc;
        easingFunc = (t) => easing.getValue(t);
    }
    const startBeats = processTimeArg(start[0]);
    const endBeats = processTimeArg(end[0]);
    const timeDelta = endBeats - startBeats;
    const valueDelta = end[1] - start[1];
    return easingFunc((TimeCalculator.toBeats("startTime" in note ? note.startTime : note.time) - startBeats) / timeDelta) * valueDelta + start[1];
}


const snippets = {
blank: "",
"fillCurve (with comments)": `fillCurve(
// note to be modified
// 要修改的音符/节点
    note,
// Any easing function
// Note: there is no "easeIn/Out/InOutLinear" function.
// Use linear(t) instead.
// You can also use an easing object as parameter.
// e. g. easingMap.linear.in, easingMap.cubic.inout,
// editor.chart.templateEasingLib.get("myTemplateEasing")
// 任意缓动函数
// 注意线性缓动函数就是linear(t)，
// 没有easeIn/Out/InOutLinear这几种说法
// 也可以把缓动对象作为参数
    easeInOutQuad,
    [
// 起始时间 Starting Time
// 可以是[整数, 分子, 分母] Can be [int, nume, deno]
// "整数:分子/分母" "int:nume/deno" e.g.     "0:0:1"
// 或者就直接写一个数字 Or just a number e.g. 0
        [0, 0, 1],
// 起始值 Starting Value
        114
    ],
    [
// 结束时间 Ending time
        [1, 0, 1],
// 结束值 Ending Value
        514
    ]
)`,
fillCurve: `fillCurve(
    noteOrNode,
    easeInOutQuad,
    [
        [0, 0, 1],
        114
    ],
    [
        [1, 0, 1],
        514
    ]
)`,
help: `
// 这是多事件/音符编辑的帮助文档。
// 你需要在当前文本框输入一个JavaScript表达式，然后点击Execute。
// 该表达式在一个函数中运行，函数接收两个参数：
// note/node 当前音符/节点 val 当前音符/节点的原有属性值
// 例如，如果您在编辑多个音符，在属性下拉框中选中positionX，
// 在此代码框中输入：val + 100，然后点击Execute，
// 则所有音符的positionX都会被加上100。
// 如果你在编辑多个事件节点，
// 你可以选择开始、结束、背靠背、面对面四种模式。

// This is the help documentation of multi-note/node editor.
// You need to input a JavaScript expression in the code textarea, then click Execute.
// The expression will be run in a function that receives two parameters:
// 'note'/'node' The current note/node, 'val' The original value of the note/node
// For example, if you are editing multiple notes, select positionX in the property dropdown,
// input val + 100 in the code box, and click Execute, all notes' positionX will be added 100.
// If you are editing multiple nodes,
// you can choose four modes: start, end, back-to-back, face-to-face.
`
}


class MultiNoteEditor extends SideEntityEditor<Set<Note>> {
    readonly $reverse          = new ZButton("Reverse");
    readonly $delete           = new ZButton("Delete").addClass("destructive");
    readonly $propOptionBox    = new ZDropdownOptionBox([
        "above", "alpha", "endTime", "isFake", "judgeSize", "positionX",
        "size", "speed", "startTime", "tint", "tintHitEffects", "type",
        "visibleBeats", "yOffset"
    ].map((n) => new BoxOption(n)));
    readonly $code             = new JSEditor();
    readonly $execute          = new ZButton("Execute").addClass("progressive");
    readonly $snippets         = new ZDropdownOptionBox(Object.keys(snippets).map((n) => new BoxOption(n)))
                                    .css("width", "100%")
    readonly $fillDensityInput = new ZFractionInput();
    readonly $fill             = new ZButton("Fill").addClass("progressive");
    readonly $fillWarning      = $("span").addClass("side-editor-warning")

    constructor() {
        super();
        this.$title.text("Multi Notes");
        this.$body.append(
            this.$delete, this.$reverse,
            $("span")
                .addClass("flex-row")
                .append(
                    $("span").text("eachNote"),
                    $("span").text("."),
                    this.$propOptionBox,
                    $("span").text(" = ")
                ),
            $("div").append(this.$code, this.$execute),

            $("span").text("Snippets"), this.$snippets,

            $("span").text("Fill each neighbors with step: "),
            $("div").addClass("flex-row").append(this.$fillDensityInput, this.$fill),
            this.$fillWarning
        );
        this.$fillDensityInput.setValue([0, 1, 4])
        this.$execute.onClick(() => {
            const code = this.$code.getValue();
            const prop = this.$propOptionBox.value.text as NotePropName;
            const fn = new Function("val", "note", "return " + code);
            const sortedNotes = [...this.target].sort((a, b) => TC.gt(a.startTime, b.startTime) ? 1 : -1);
            const generateOp = ({
                "above":          n => new NotePropChangeOperation(n, "above",          fn(n.above, n)),
                "alpha":          n => new NotePropChangeOperation(n, "alpha",          fn(n.alpha, n)),
                "endTime":        n => new HoldEndTimeChangeOperation(n,                 fn(n.endTime, n)),
                "isFake":         n => new NotePropChangeOperation(n, "isFake",         fn(n.isFake, n)),
                "judgeSize":      n => new NotePropChangeOperation(n, "judgeSize",      fn(n.judgeSize, n)),
                "positionX":      n => new NotePropChangeOperation(n, "positionX",      fn(n.positionX, n)),
                "size":           n => new NotePropChangeOperation(n, "size",           fn(n.size, n)),
                "speed":          n => new NoteSpeedChangeOperation(n,                   fn(n.speed, n), n.parentNode.parentSeq.parentLine),
                "startTime":      n => new NoteTimeChangeOperation(n, n.parentNode.parentSeq.getNodeOf(fn(n.startTime, n))),
                "tint":           n => new NotePropChangeOperation(n, "tint",           fn(n.tint, n)),
                "type":           n => new NotePropChangeOperation(n, "type",           fn(n.type, n)),
                "visibleBeats":   n => new NotePropChangeOperation(n, "visibleBeats",   fn(n.visibleBeats, n)),
                "yOffset":        n => new NoteYOffsetChangeOperation(n,                 fn(n.yOffset, n), n.parentNode.parentSeq.parentLine),
                "tintHitEffects": n => new NotePropChangeOperation(n, "tintHitEffects", fn(n.tintHitEffects, n)),
            } satisfies Record<NotePropName, (n: Note) => Operation>)[prop];
            editor.operationList.do(
                new ComplexOperation<Operation[]>(
                    ...sortedNotes.map<Operation>((n) => {
                        try {    
                            return generateOp(n);
                        } catch (e) {
                            console.error(e);
                            notify(`Error: ${e.message}`);
                        }
                    })
                )
            )
        });
        this.$snippets.whenValueChange((name) => {
            this.$code.setValue(snippets[name]);
        });
        this.$fill.onClick(() => {
            const step = this.$fillDensityInput.getValue();
            try {
                TimeCalculator.validateIp(step);
            } catch (e) {
                notify(e.message);
                return;
            }
            if (TimeCalculator.toBeats(step) <= 0) {
                notify("Step must be positive");
                return;
            }
            const sortedNotes = [...this.target].sort((a, b) => TC.gt(a.startTime, b.startTime) ? 1 : -1);
            const toBeAdded = [];
            const fill = (note1: Note, note2: Note) => {
                const startTime = note1.startTime;
                const endTime = note2.startTime;
                const delta = TC.validateIp(TC.sub(endTime, startTime));
                const positionDelta = note2.positionX - note1.positionX;
                for (let offset = step; TC.lt(offset, delta); offset = TC.validateIp(TC.add(offset, step))) {
                    const note = note1.clone(offset);
                    note.positionX = (TC.toBeats(offset) / TC.toBeats(delta)) * positionDelta + note1.positionX;
                    toBeAdded.push(note);
                }
            }
            const len = sortedNotes.length;
            for (let i = 0; i < len - 1; i++) {
                console.log(i)
                const note1 = sortedNotes[i];
                const note2 = sortedNotes[i + 1];
                fill(note1, note2);
            }
            editor.operationList.do(new MultiNoteAddOperation(toBeAdded, editor.judgeLinesEditor.selectedLine));

        })
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new NotePropChangeOperation(n, "positionX", -n.positionX))))
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNoteDeleteOperation(this.target))
        });
    }
    update(): void {
        const count = this.target.size;
        const judgeLineCount = new Set([...this.target].map(n => n.parentNode.parentSeq.parentLine)).size;
        this.$title.text(`Multi Notes (${numNoun(count, "Note")} from ${numNoun(judgeLineCount, "JudgeLine")})`);
        if (judgeLineCount > 1) {
            this.$fillWarning.text("Warning: The selected notes come from different lines, but `Fill` will only fill the selected line.")
        } else {
            this.$fillWarning.text("");
        }
    }
}



class MultiNodeEditor extends SideEntityEditor<Set<EventStartNode>> {
    readonly $reverse           = new ZButton("Reverse");
    readonly $delete            = new ZButton("Delete").addClass("destructive");
    readonly $startEndOptionBox = new ZDropdownOptionBox([
        "start",
        "end",
        "back-to-back",
        "face-to-face"
    ].map((v) => new BoxOption(v)));
    readonly $propOptionBox = new ZDropdownOptionBox([
        "value",
        "time"
    ].map((x) => new BoxOption(x)));
    readonly $code          = new JSEditor();
    readonly $execute       = new ZButton("Execute");
    
    readonly $snippets      = new ZDropdownOptionBox(Object.keys(snippets).map((n) => new BoxOption(n)))
                                   .css("width", "100%")
    constructor() {
        super();
        this.$title.text("Multi Nodes");
        this.$body.append(

            this.$delete,
            this.$reverse,
            $("span")
                .addClass("flex-row")
                .append(
                    $("span").text("each"),
                    this.$startEndOptionBox,
                    $("span").text("."),
                    this.$propOptionBox,
                    $("span").text(" = ")
                ),
            $("div").append(this.$code, this.$execute),

            $("span").text("Snippets"), this.$snippets,

            
        );

        this.$execute.onClick(() => {
            const code = this.$code.getValue();
            const fn = new Function("val", "node", "return " + code);
            let sortedNodes: (EventStartNode | EventEndNode)[] = [...this.target].sort((a, b) => TimeCalculator.gt(a.time, b.time) ? 1 : -1);
            const startOrEnd = this.$startEndOptionBox.value.text;
            if (startOrEnd === "end") {
                sortedNodes = sortedNodes.map(n => n.next).filter(n => n.type === NodeType.MIDDLE);
            } else if (startOrEnd === "back-to-back") {
                const nodes = [];
                const len = sortedNodes.length;
                if (len > 0) {
                    const node = sortedNodes[0];
                    const end = node.previous;
                    if (end.type !== NodeType.HEAD) {
                        nodes.push(end);
                    }
                    nodes.push(node);
                }
                for (let i = 1; i < len; i++) {
                    const node = sortedNodes[i];
                    const end = node.previous;
                    nodes.push(end);
                    nodes.push(node)
                }
                sortedNodes = nodes;
            } else if (startOrEnd === "face-to-face") {
                const nodes = [];
                const len = sortedNodes.length
                for (let i = 0; i < len - 1; i++) {
                    const node = sortedNodes[i];
                    const end = node.next;
                    nodes.push(node);
                    nodes.push(end);
                }
                const node = sortedNodes[len - 1];
                const end = node.next;
                nodes.push(node);
                if (end.type !== NodeType.TAIL) {
                    nodes.push(end);
                }
                sortedNodes = nodes;
            }
            const prop = this.$propOptionBox.value.text;
            editor.operationList.do(
                new ComplexOperation(
                    ...sortedNodes.map((node: EventStartNode | EventEndNode) => {
                        return prop === "value"
                            ? new EventNodeValueChangeOperation(node, fn(node.value, node))
                            : new EventNodeTimeChangeOperation(node, fn(node.time, node))
                    })
                )
            )
        });
        this.$snippets.whenValueChange((name) => {
            this.$code.setValue(snippets[name]);
        });
        
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new EventNodeValueChangeOperation(n, -n.value))))
        })
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNodeDeleteOperation(Array.from(this.target)));
        })
    }
    update(): void {
        const size = this.target.size;
        const sequenceIDs = new Set<string>;
        for (const node of this.target) {
            if (!node.parentSeq) {
                // 别放孤儿进来
                this.target.delete(node);
                continue;
            }
            sequenceIDs.add(node.parentSeq.id);
        }
        this.$title.text(`Multi Nodes (${size} nodes from ${Array.from(sequenceIDs).join(", ")})`)
    }
} 

class EventEditor<VT extends number | string | RGB> extends SideEntityEditor<EventStartNode<VT> | EventEndNode<VT>> {
    $titleContent   = $("span");
    $goPrev         = new ZButton("prev").attr("title", "click to go to previous node,\nlong press to apply last change to previous node");
    $goNext         = new ZButton("next").attr("title", "click to go to next node,\nlong press to apply last change to next node");

    $applyLast      = new ZButton("Apply last Operation (delta) to this Node")
                        .addClass("progressive", "side-editor-whole-line");
    
    $warning        = $("span").addClass("side-editor-warning");
    $time           = new ZFractionInput();
    $value          = new ZInputBox();

    $normalOuter    = $("div");
    $normalLeft     = new ZInputBox().attr("placeholder", "left").setValue("0.0");
    $normalRight    = new ZInputBox().attr("placeholder", "right").setValue("1.0");
    $easing         = new ZEasingBox();

    $templateOuter  = $("div");
    $templateEasing = new ZInputBox().addClass("template-easing-box");
    $templateLeft   = new ZInputBox().attr("placeholder", "left").setValue("0.0");
    $templateRight  = new ZInputBox().attr("placeholder", "right").setValue("1.0");


    $parametricOuter = $("div");
    $parametric      = new ZInputBox();

    $interpolationOuter = $("div").addClass("flex-row", "side-editor-whole-line")
    $interpolationStep = new ZFractionInput().setValue([0, 1, 16]);
    $interpolateBtn = new ZButton("Interpolate");

    $substitute     = new ZButton("Substitute").addClass("progressive");

    $bezierEditor   = new BezierEditor(window.innerWidth * 0.2);

    $interpreteAsSpanText  = $("span").text("Interpreted as:")
    $interpreteAsOptionBox = new ZDropdownOptionBox(["str", "int", "float"].map(t => new BoxOption(t)));

    $colorNotation   = $("span").addClass("side-editor-info");

    $delete: ZButton;
    $radioTabs: ZRadioTabs;
    constructor() {
        super()
        this.$titleContent.text("EventNode (NULL)");
        this.$title.append(
            this.$titleContent,
            this.$goPrev,
            this.$goNext
        );
        this.$title
            .addClass("flex-row")
            .css("width", "100%");
        this.addClass("event-editor")
        this.$goPrev.whenShortPressed((e) => {
            let target = this.target.previous as EvSoE<VT>;
            if (e.altKey && target.previous.type !== NodeType.HEAD) {
                target = target.previous as EvSoE<VT>;
            }
            this.target = target;
        });
        this.$goPrev.whenLongPressed(() => {
            const prev = this.target.previous as EvSoE<VT>;
            applyOpToNode(prev);
        });
        this.$goNext.whenShortPressed((e) => {
            let target = this.target.next as EvSoE<VT>;
            if (e.altKey && target.next.type !== NodeType.TAIL) {
                target = target.next as EvSoE<VT>;
            }
            this.target = target;
        });
        this.$goNext.whenLongPressed(() => {
            const next = this.target.next as EvSoE<VT>;
            applyOpToNode(next);
        });
        const applyOpToNode = (node: EventNode<VT>) => {
            const listOperations = editor.operationList.operations;
            const operation = listOperations[listOperations.length - 1];
            if (typeof node.value === "string" || Array.isArray(node.value)) {
                return void notify("You cannot apply last operation to a string node.")
            }
            if (!operation) {
                return void notify("There is no operation done in the OperatonList")
            }
            if (!(operation instanceof EventNodeValueChangeOperation)) {
                notify("Last operation is not EventNodeValueChangeOperation");
                return;
            }
            const delta = operation.value - operation.originalValue;
            // @ts-ignore
            editor.operationList.do(new EventNodeValueChangeOperation(node, node.value + delta));
        }
        this.$applyLast.onClick(() => {
            const node = this.target;
            if (!node) {
                return void notify("The target of this editor has been garbage-collected.")
            }
            applyOpToNode(node);
        });

        this.$normalOuter.append(
            this.$easing,
            this.$normalLeft,
            this.$normalRight
        );
        this.$parametricOuter.append(
            this.$parametric,
        );
        this.$interpolationOuter.append(
            this.$interpolateBtn,
            $("span").text("with Step: ").css("alignSelf", "center"),
            this.$interpolationStep
        );
        this.$templateOuter.append(
            this.$templateEasing, $("br"),
            this.$templateLeft,
            this.$templateRight, $("br"),
            this.$substitute
        )
        this.$radioTabs = new ZRadioTabs("easing-type", {
            "Normal": this.$normalOuter,
            "Template": this.$templateOuter,
            "Bezier": this.$bezierEditor,
            "Parametric": this.$parametricOuter
        });
        this.$delete = new ZButton("delete").addClass("destructive")
            .onClick(() => editor.operationList.do(new EventNodePairRemoveOperation(EventNode.getEndStart(this.target)[1])));
        this.$body.append(
            this.$warning,
            $("span").text("time"), this.$time,
            $("span").text("value"), this.$value,
            this.$colorNotation,
            this.$interpreteAsSpanText, this.$interpreteAsOptionBox,
            this.$applyLast,
            this.$radioTabs,
            this.$interpolationOuter,
            $("span").text("del"), this.$delete
        )
        this.$substitute.onClick(() => {
            if (this.target.parentSeq.type === EventType.text || this.target.parentSeq.type === EventType.color) {
                return void notify("Can't substitute text or color event node sequence.")
            }
            editor.operationList.do(new EventSubstituteOperation(this.target));
        })
        this.$interpreteAsOptionBox.whenValueChange((textContent) => {
            if (this.target.parentSeq.type !== EventType.text) {
                return void notify("Illegal action")
            }
            const interpreteAs = InterpreteAs[textContent];
            editor.operationList.do(new TextEventNodeInterpretationChangeOperation(this.target as unknown as EventStartNode<string>, interpreteAs))
        })
        this.$time.onChange((t) => {
            editor.operationList.do(new EventNodeTimeChangeOperation(this.target, t))
        })
        this.$value.whenValueChange(() => {
            const originalValue = this.target.value as string | number | RGB;
            if (typeof originalValue === "number") {
                // @ts-ignore
                editor.operationList.do(new EventNodeValueChangeOperation(this.target, this.$value.getNum()))
            } else if (typeof originalValue === "string") {
                // @ts-ignore
                editor.operationList.do(new EventNodeValueChangeOperation(this.target, this.$value.getValue()))
            } else {
                const primitiveString = this.$value.getValue();
                let value: RGB
                if (primitiveString.match(/^#[0-9a-fA-F]{6}$/)) {
                    value = hex6StrToRgb(primitiveString);
                } else if (primitiveString.match(/^#[0-9a-fA-F]{3}$/)) {
                    value = hex3StrToRgb(primitiveString);
                } else if (primitiveString.match(/\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*/)) {
                    value = this.$value.getValue().split(",").map(s => parseInt(s.trim())) as RGB;
                } else {
                    return void notify("Wrong format")
                }
                console.log(primitiveString, value)
                // @ts-ignore
                editor.operationList.do(new EventNodeValueChangeOperation(this.target, value))
            }
        })
        this.$easing.onChange((id) => this.setNormalEasing(id))
        this.$templateEasing.whenValueChange((name) => this.setTemplateEasing(name))
        this.$bezierEditor.whenValueChange(() => {
            this.setBezierEasing(this.$bezierEditor.getValue());
        })
        this.$parametric.whenValueChange(() => {
            this.setParametricEasing(this.$parametric.getValue());
        });
        this.$interpolateBtn.onClick(() => {
            if (!this.target) {
                notify("The target has been garbage-collected.")
            }
            editor.operationList.do(new EventInterpolationOperation(EventNode.getStartEnd(this.target)[0], this.$interpolationStep.getValue()))
        })
        this.$radioTabs.$radioBox.onChange((id) => {
            if (id === 0) { // Normal
                this.setNormalEasing(this.$easing.value)
            } else if (id === 1) { // Template
                if (!this.$templateEasing.getValue()) { return; }
                this.setTemplateEasing(this.$templateEasing.getValue())
            } else if (id === 2) { // Bezier
                this.setBezierEasing(this.$bezierEditor.getValue());
            } else if (id === 3) { // Parametric
                this.setParametricEasing(this.$parametric.getValue());
            }
        });
        for (const $input of [this.$normalLeft, this.$normalRight, this.$templateLeft, this.$templateRight]) {
            $input.whenValueChange(() => {
                const isNormal = $input === this.$normalLeft || $input === this.$normalRight;
                const left = isNormal ? this.$normalLeft.getNum() : this.$templateLeft.getNum();
                const right = isNormal ? this.$normalRight.getNum() : this.$templateRight.getNum();
                if (left < 0 || right > 1 || left > right) {
                    editor.update();
                    return;
                }
                const isOriginallySegmented = this.target.easing instanceof SegmentedEasing;
                // 如果本来就是被分段的，就不改回纯的了
                // 否则能不分就不分
                const needsSegmentation = isOriginallySegmented || left !== 0 || right !== 1;
                if (needsSegmentation) {
                    if (isOriginallySegmented) {
                        editor.operationList.do(
                            new EventNodeEasingChangeOperation(this.target,
                                new SegmentedEasing((this.target.easing as SegmentedEasing).easing, left, right)
                            )
                        );
                    } else {
                        editor.operationList.do(
                            new EventNodeEasingChangeOperation(this.target,
                                new SegmentedEasing(this.target.easing, left, right)
                            )
                        );
                    }
                }
            });
        }
    }
    setNormalEasing(id: number): void {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easingArray[id]))
        this.target.innerEasing = easingArray[id]
    }
    setTemplateEasing(name: string): void {
        const chart = editor.chart;
        const easing = chart.templateEasingLib.getOrNew(name);
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing))
    }
    setBezierEasing(easing: BezierEasing) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing));
    }
    setParametricEasing(expression: string) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, new ParametricEquationEasing(expression)));
    }
    update(): void {
        const eventNode = this.target;
        if (!eventNode) {
            this.$titleContent.text("EventNode (NULL)")
            return;
        }
        if (eventNode.parentSeq !== editor.eventCurveEditors.selectedEditor.target) {
            this.$warning.text("This EventNode does not belong to the selected EventNodeSequence.");
        } else {
            this.$warning.text("");
        }
        if (eventNode.parentSeq.type !== EventType.text) {
            this.$interpreteAsSpanText.hide();
            this.$interpreteAsOptionBox.hide();
        } else {
            this.$interpreteAsSpanText.show();
            this.$interpreteAsOptionBox.show();
        }
        if (eventNode.parentSeq.type === EventType.color) {
            this.$colorNotation.text(`#${rgb2hex(eventNode.value as RGB).toString(16)}`);
        } else {
            this.$colorNotation.text("")
        }
        const isBPM = eventNode instanceof BPMStartNode || eventNode instanceof BPMEndNode
        const isStart = eventNode instanceof EventStartNode
        this.$titleContent.text(`${isBPM ? "BPM" : "Event"}${isStart ? "Start" : "End"}Node (from ${eventNode.parentSeq.id})`);
        this.$goPrev.disabled = eventNode.previous.type === NodeType.HEAD;
        this.$goNext.disabled = eventNode.next.type === NodeType.TAIL;
        this.$time.setValue(eventNode.time);
        this.$value.setValue(eventNode.value + "");
        if (eventNode.innerEasing instanceof NormalEasing) {
            this.$radioTabs.switchTo(0)
            this.$easing.setValue(eventNode.innerEasing);
            if (eventNode.easing instanceof SegmentedEasing) {
                this.$normalLeft.setValue(eventNode.easing.left + "");
                this.$normalRight.setValue(eventNode.easing.right + "");
            }
        } else if (eventNode.innerEasing instanceof TemplateEasing) {
            this.$radioTabs.switchTo(1)
            this.$templateEasing.setValue(eventNode.innerEasing.name);
        } else if (eventNode.innerEasing instanceof BezierEasing) { 
            this.$radioTabs.switchTo(2)
            this.$bezierEditor.setValue(eventNode.innerEasing);
        } else if (eventNode.innerEasing instanceof ParametricEquationEasing) { 
            this.$radioTabs.switchTo(3)
            this.$parametric.setValue(eventNode.innerEasing.equation);
        }
        if (typeof eventNode.value !== "number") {
            this.$radioTabs.$radioBox.disabledIndexes = [1, 3];
        }
        
    }
}

async function searchTexture(prefix: string) {
    const textures = await serverApi.queryTextures();
    if (!textures.includes("line.png")) {
        textures.push("line.png");
    }
    return textures.filter(texture => texture.startsWith(prefix));
}

class JudgeLineInfoEditor extends SideEntityEditor<JudgeLine> {
    readonly $cover             = new ZSwitch("no", "yes").setAsChecked()
    readonly $father            = new ZInputBox("-1");
    readonly $texture           = new ZSearchBox(searchTexture);
    readonly $anchor            = new ZInputBox("0.5, 0.5");
    readonly $group             = new ZDropdownOptionBox([new BoxOption("Default")]);
    readonly $newGroup          = new ZInputBox("");
    readonly $zOrder            = new ZArrowInputBox();
    readonly $createGroup       = new ZButton("Create");
    readonly $createLine        = new ZButton("Create");
    readonly $attachUI          = new ZCollapseController(true);
    readonly $rotatesWithFather = new ZSwitch("no", "yes");
    readonly $del               = new ZButton("Delete").addClass("destructive");
    readonly $setAsBindNote     = new ZButton("Set as note binding").addClass("progressive");

    readonly $eventLayerIdInput = new ZArrowInputBox().setValue(0);
    readonly $eventType         = new ZDropdownOptionBox(["moveX", "moveY", "rotate", "alpha", "speed"].map(
        name => new BoxOption(name)
    ))
    readonly $eventNodeSequence = $("div").addClass("flex-row").append(this.$eventLayerIdInput, this.$eventType)
    readonly $newEventSeqName   = new ZSearchBox((prefix: string) => 
        [...editor.chart.sequenceMap.keys()].filter(name => name.startsWith(prefix))
    )

    // @ts-ignore
    readonly map$uiAttach: Record<UIName, ZSwitch> = {}
    constructor() {
        super();

        const uiNames = ["bar", "combo", "combonumber", "level", "name", "pause", "score"] satisfies UIName[];
        const arr$element: Z<any>[] = [];
        for (const uiName of uiNames) {
            const $ui = new ZSwitch("Attach", "Detach");
            $ui.whenClickChange((checked: boolean) => {
                if (!this.target) {
                    notify("The target line of this editor has been garbage-collected");
                    return;
                }
                if (checked) {
                    editor.operationList.do(new AttachUIOperation(editor.chart, this.target, uiName));
                } else {
                    editor.operationList.do(new DetachUIOperation(editor.chart, uiName));
                }
            });
            arr$element.push(
                $("span").text(uiName),
                $ui
            );
            this.map$uiAttach[uiName] = $ui;
        }
        this.$attachUI.attach(...arr$element);


        this.$title.text("Judge Line");
        this.$body.append(
            $("span").text("Cover"), this.$cover,
            $("span").text("Notes under the line of its side will not be rendered if `Cover` is set to true.")
                     .addClass("side-editor-info"),
            $("span").text("Father"), this.$father,
            $("span").text("Texture"), this.$texture,
            $("span").text("Anchor"), this.$anchor,
            $("span").text("Group"), this.$group,
            $("span").text("zOrder"), this.$zOrder,
            $("span").text("Attach UI"), this.$attachUI,

            ...arr$element,

            $("span").text("Rotates with father"), this.$rotatesWithFather,
            $("span").text("New Group"), $("div").append(this.$newGroup, this.$createGroup),
            $("span").text("New Line"), this.$createLine,
            $("span").text("del"), this.$del,
            this.$eventNodeSequence, this.$newEventSeqName,
            this.$setAsBindNote
        );
        this.$cover.whenClickChange((checked: boolean) => {
            if (!this.target) {
                notify("The target of this editor has been garbage-collected");
                return;
            }
            editor.operationList.do(new JudgeLinePropChangeOperation(this.target, "cover", checked));
        });
        this.$zOrder.whenValueChange((num) => {
            editor.operationList.do(new JudgeLinePropChangeOperation(this.target, "zOrder", num));
        })
        this.$father.whenValueChange((content) => {
            if (!this.target) {
                notify("The target of this editor has been garbage-collected");
                return;
            }
            if (content === "-1") {
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, null));
            }
            if (isAllDigits(content)) {
                const lineId = parseInt(content);
                const father = editor.chart.judgeLines[lineId];
                if (!father) {
                    notify("Line ID out of range");
                    return false;
                }
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, father));
            } else {
                const father = editor.chart.judgeLines.find(line => line.name === content);
                if (!father) {
                    notify("Line name not found");
                    return false;
                }
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, father));
            }
        });
        this.$anchor.whenValueChange((content) => {
            const line = this.target;
            if (!line) {
                notify("The target of this editor has been garbage-collected.")
                return;
            }
            const segments = content.split(",");
            if (segments.length !== 2) {
                notify("Invalid anchor");
                return;
            }
            const x = parseFloat(segments[0].trim());
            const y = parseFloat(segments[1].trim());
            editor.operationList.do(new JudgeLinePropChangeOperation(line, "anchor", [x, y]))
        });
        this.$texture.whenValueChange((content) => {
            const line = this.target;
            if (!line) {
                notify("The target of this editor has been garbage-collected.")
                return;
            }
            editor.operationList.do(new JudgeLinePropChangeOperation(line, "texture", content))
        })
        this.$createGroup.onClick(() => {
            if (!this.target) {
                notify("The target of this editor has been garbage-collected");
                return;
            }
            const name = this.$newGroup.getValue().trim();
            if (name === "") {
                notify("Please input a name");
                return;
            }
            if (editor.chart.judgeLineGroups.some(group => group.name === name)) {
                notify(`'${name}' already exists`);
                return;
            }
            const group = new JudgeLineGroup(name);
            editor.chart.judgeLineGroups.push(group);
            editor.operationList.do(new JudgeLineRegroupOperation(this.target, group))
        });
        this.$createLine.onClick(() => {
            // 等重排了再说，重排之前没有这个线的编辑器，会出错
            editor.judgeLinesEditor.addEventListener("reflow", () => {
                console.log("reflow event")
                editor.judgeLinesEditor.selectedLine = line
            }, {once: true});
            const line = new JudgeLine(editor.chart);
            editor.operationList.do(new JudgeLineCreateOperation(editor.chart, line));
            this.target = line;
        });
        this.$rotatesWithFather.whenClickChange((checked) => {
            editor.operationList.do(new JudgeLinePropChangeOperation(this.target, "rotatesWithFather", checked))
        });
        this.$del.onClick(() => {
            if (!this.target) {
                notify("The target of this editor has been garbage-collected");
                editor.judgeLinesEditor.reflow();
                return;
            }
            editor.operationList.do(new JudgeLineDeleteOperation(editor.chart, this.target));
        });
        this.$setAsBindNote.onClick(() => {
            const judgeLine = this.target;
            if (!judgeLine) {
                notify("The target of this editor has been garbage-collected");
            }
            const seq = judgeLine.eventLayers[0].speed;
            if (seq.head.next === seq.tail.previous) {
                editor.operationList.do(new EventNodeValueChangeOperation(seq.head.next, 0));
                notify(`Set the only EventNode of #${judgeLine.id}.0.speed as 0`);
            } else if (seq.head.next.next.next === seq.tail.previous) {
                editor.operationList.do(new ComplexOperation(
                    new EventNodeValueChangeOperation(seq.head.next, 0),
                    new EventNodeValueChangeOperation(seq.head.next.next as EventEndNode, 0),
                    new EventNodeValueChangeOperation(seq.head.next.next.next as EventStartNode, 0)
                ));
                notify(`Set the only 3 EventNodes of #${judgeLine.id}.0.speed as 0`);
            } else {
                notify("Unable to set the speed as 0 for there have been more than 3 EventNodes");
                return;
            }
            const ySeq = judgeLine.eventLayers[0].moveY;
            if (ySeq.head.next === seq.tail.previous) {
                editor.operationList.do(new EventNodeValueChangeOperation(seq.head.next, 2000));
                notify(`Set the only EventNode of #${judgeLine.id}.0.moveY as 2000`)
            } else if (ySeq.head.next.next.next === ySeq.tail.previous) {
                
                editor.operationList.do(new ComplexOperation(
                    new EventNodeValueChangeOperation(ySeq.head.next, 2000),
                    new EventNodeValueChangeOperation(ySeq.head.next.next as EventEndNode, 2000),
                    new EventNodeValueChangeOperation(ySeq.head.next.next.next as EventStartNode, 2000)
                ));
                notify(`Set the only 3 EventNodes of #${judgeLine.id}.0.moveY as 2000`)
            } else {
                notify("Unable to set the y as 2000 for there have been more than 3 EventNodes");
            }
        });
        this.$newEventSeqName.whenValueChange((name) => {
            const layer: number = this.$eventLayerIdInput.getValue();
            const typeStr  = this.$eventType.value.text as BasicEventName;
            const type = EventType[typeStr];
            if (layer < 0 || layer > 3) {
                notify("Layer index out of range. Range is [0, 3]");
                return;
            }
            if (name.startsWith("->")) {
                name = name.substring(2);
                if (editor.chart.sequenceMap.get(name)) {
                    notify("Fail to rename for the sequence already exists");
                }
                editor.operationList.do(new EventNodeSequenceRenameOperation(this.target.eventLayers[layer][typeStr], name))
                return;
            }
            const ens = editor.chart.sequenceMap.get(name);
            if (!ens) {
                notify("No such sequence!");
            }
            if (ens.type !== type) {
                notify("The sequence types did not match!");
                return;
            }
            editor.operationList.do(new JudgeLineENSChangeOperation(this.target, layer, typeStr, ens));
        });
    }
    update(): void {
        const judgeLine = this.target;
        if (!judgeLine) {
            return;
        }
        this.$father.setValue(judgeLine.father ? judgeLine.father.id + "" : "-1");
        this.$rotatesWithFather.checked = judgeLine.rotatesWithFather;
        this.updateGroups(editor.chart.judgeLineGroups);
        this.updateAttach();
        this.$group.value = this.$group.options.find(option => option.text === judgeLine.group.name);
        this.$anchor.setValue(judgeLine.anchor.join(", "));
        this.$texture.value = judgeLine.texture;
        const layer = judgeLine.eventLayers[this.$eventLayerIdInput.getValue()]
        if (layer) {
            const seq = layer[this.$eventType.value.text as BasicEventName];
            if (seq) {
                this.$newEventSeqName.value = seq.id;
            }
        }
    }
    updateGroups(groups: JudgeLineGroup[]) {
        this.$group.replaceWithOptions(groups.map(group => {
            const option = new BoxOption(group.name, () => {
                if (!this.target) return;
                editor.operationList.do(new JudgeLineRegroupOperation(this.target, group))
            });
            return option
        }));
    }
    updateAttach() {
        const chart = editor.chart;
        for (const uiName of ["bar", "combonumber", "combo", "level", "name", "pause", "score"] satisfies UIName[]) {
            const attachTarget = chart[`${uiName}Attach` satisfies keyof Chart];
            if (attachTarget === this.target) {
                this.map$uiAttach[uiName].checked = true;
                this.map$uiAttach[uiName].disabled = false;
            } else if (attachTarget === null) {
                this.map$uiAttach[uiName].checked = false;
                this.map$uiAttach[uiName].disabled = false;
            } else {
                this.map$uiAttach[uiName].checked = false;
                this.map$uiAttach[uiName].disabled = true;
                this.map$uiAttach[uiName].text(`Attached to #${attachTarget.id}`); // 神级用法
            }
        }
    }
}

class UserScriptEditor extends SideEditor {
    $script = new JSEditor;
    $runBtn = new ZButton("Run").addClass("user-script-editor-run", "progressive");
    constructor() {
        super();
        this.addClass("user-script-editor");
        this.$body.append(
            this.$script,
            this.$runBtn
        );
        const log = (content: any) => {
            const $d = $("div").addClass("user-script-editor-output").text(content + "");
            this.$script.before($d)
        }
        this.$runBtn.onClick(() => {
            try {
                const script = new Function("log", "return " + this.$script.getValue().trim());
                const result = script(log);
                if (typeof result === "function") {
                    result.isUserScript = true;
                    if (result.name !== "") {
                        if (!globalThis[result.name]?.isUserScript) {
                            notify("Cannot override built-in Global Variable. Please use a different name.")
                        } else {
                            globalThis[result.name] = result;
                            log(result.toString())
                        }
                    }
                    if (result.main && typeof result.main === "function") {
                        if (editor.chart.modified && !result.trusted) {
                            notify("This script is not trusted. Please make sure it is safe to run. You'd better save the chart before running it.")
                            notify("To trust this script, please add a line `trusted = true`.");
                            return;
                        }
                        result.main(editor.operationList, editor.chart);
                    }
                } else {
                    log(result)
                }
            } catch (error) {
                const $d = $("div").addClass("user-script-editor-error").text(error.message);
                this.$script.before($d);
            }
        })
    }
    update() {}
}

class ChartInfoEditor extends SideEditor {
    $chartTitle  = new ZInputBox();
    $level       = new ZInputBox();
    $composer    = new ZInputBox();
    $charter     = new ZInputBox();
    $illustrator = new ZInputBox();

    $chartingTime = $("span").css("textAlign", "center");
    $rpeChartingTime = $("span").css("textAlign", "center");
    constructor() {
        super();
        this.$title.text("Chart Info");
        this.$body.append(
            $("span").text("Title"), this.$chartTitle,
            $("span").text("Difficulty"), this.$level,
            $("span").text("Composer"), this.$composer,
            $("span").text("Charter"), this.$charter,
            $("span").text("Illustrator"), this.$illustrator,
            $("span").text("Time spent charting here"), this.$chartingTime,
            $("span").text("Time spent charting in RPE"), this.$rpeChartingTime
        )
        this.$chartTitle.whenValueChange(value => {
            editor.operationList.do(new ChartPropChangeOperation(editor.chart, "name", value));
        })
        this.$level.whenValueChange(value => {
            editor.operationList.do(new ChartPropChangeOperation(editor.chart, "level", value));
        })
        this.$composer.whenValueChange(value => {
            editor.operationList.do(new ChartPropChangeOperation(editor.chart, "composer", value));
        })
        this.$charter.whenValueChange(value => {
            editor.operationList.do(new ChartPropChangeOperation(editor.chart, "charter", value));
        })
        this.$illustrator.whenValueChange(value => {
            editor.operationList.do(new ChartPropChangeOperation(editor.chart, "illustrator", value));
        })
    }
    update(): void {
        const chart = editor.chart;
        this.$chartTitle.setValue(chart.name);
        this.$level.setValue(chart.level);
        this.$composer.setValue(chart.composer);
        this.$charter.setValue(chart.charter);
        this.$illustrator.setValue(chart.illustrator);
        this.$chartingTime.text(formatTime(chart.chartingTime, 0));       // KPA存分
        this.$rpeChartingTime.text(formatTime(chart.rpeChartingTime, 0)); // RPE存秒，但是已经转换为分了

    }
}

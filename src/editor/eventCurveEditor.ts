const SCOPING_COLOR = "#FAE";

const COLOR_INTERPOLATION_STEP = 0.05;
const COLOR_INTERPOLATION_MAX_STOPS = 20;

const eventTypeMap = [
    { // moveX
        valueGridSpan: 135,
        valueRange: [-675, 675]
    },
    { // moveY
        valueGridSpan: 180,
        valueRange: [-450, 450]
    },
    { // rotate
        valueGridSpan: 90,
        valueRange: [-360, 360]
    },
    { // alpha
        valueGridSpan: 17,
        valueRange: [0, 255]
    },
    { // speed
        valueGridSpan: 2,
        valueRange: [-5, 15]
    },
    { // easing
        valueGridSpan: 270,
        valueRange: [-675, 675]
    },
    { // bpm
        valueGridSpan: 40,
        valueRange: [0, 400]
    },
    { // scaleX
        valueGridSpan: 1,
        valueRange: [-5, 5]
    },
    { // scaleY
        valueGridSpan: 1,
        valueRange: [-5, 5]
    }
] satisfies {valueGridSpan: number, valueRange: [number, number]}[];

type EventTypeName = "moveX" | "moveY" | "alpha" | "rotate" | "speed" | "easing" | "bpm" | "scaleX" | "scaleY" | "text" | "color";
type ExtendedEventTypeName = "scaleX" | "scaleY" | "text" | "color"

enum NewNodeState {
    controlsStart,
    controlsEnd,
    controlsBoth
}

const eventTypeKeys = ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm", "scaleX", "scaleY", "text", "color"] as const;
const normalTypes = ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"] as const;
const extendedTypes = ["scaleX", "scaleY", "text", "color"] as const;
const numericEventTypeKeys = ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm", "scaleX", "scaleY"] as const;

class EventCurveEditors extends Z<"div"> {
    selectOptions = {
        none: new BoxOption("none"),
        extend: new BoxOption("extend"),
        replace: new BoxOption("replace"),
        exclude: new BoxOption("exclude")
    }
    element: HTMLDivElement;
    $bar: Z<"div"> = $("div").addClass("event-curve-editors-bar");
    readonly normalOptions = normalTypes.map((type) => new BoxOption(type));
    readonly extendedOptions = extendedTypes.map((type) => new BoxOption(type));
    readonly $typeSelect = new ZDropdownOptionBox(this.normalOptions, true);
    readonly $layerSelect = new ZDropdownOptionBox(["0", "1", "2", "3", "ex"].map((s) => new BoxOption(s)), true);
    readonly $timeSpanInput = new ZInputBox("4").attr("size", "3");
    readonly $editSwitch = new ZSwitch("Edit");
    readonly $easingBox = new ZEasingBox(true);
    readonly $newNodeStateSelect: ZDropdownOptionBox;
    readonly $encapsuleBtn: ZButton;
    readonly $templateNameInput: ZInputBox;
    readonly $rangeInput = new ZInputBox().attr("size", "6");
    readonly $selectOption = new ZDropdownOptionBox(Object.values(this.selectOptions), true);
    selectState: SelectState;


    moveX: EventCurveEditor;
    moveY: EventCurveEditor;
    alpha: EventCurveEditor;
    rotate: EventCurveEditor;
    speed: EventCurveEditor;
    easing: EventCurveEditor;
    bpm: EventCurveEditor;



    // 父类的text方法没用，这里覆盖掉
    // @ts-ignore
    override text: TextEventSequenceEditor;
    color: ColorEventSequenceEditor;

    scaleX: EventCurveEditor;
    scaleY: EventCurveEditor;

    lastBeats: number;
    easingBeats: number = 0;

    clipboard: Set<EventStartNode<unknown>>;
    nodesSelection: Set<EventStartNode<unknown>>;

    constructor() {
        super("div")
        this.addClass("event-curve-editors")

        this.$typeSelect.whenValueChange((val) => {
            this.selectedEditor = this[val];
        })
        this.$layerSelect.whenValueChange((val) => {
            if (!(["0", "1", "2", "3", "ex"]).includes(val)) {
                throw new Error("Invalid layer");
            }
            const wasEx = this.selectedLayer === "ex";
            const isEx = val === "ex";
            if (wasEx && !isEx) {
                this.selectedEditor = this.moveX;
                this.$typeSelect.replaceWithOptions(this.normalOptions)
                this.$typeSelect.value = this.normalOptions[0];
            } else if (isEx && !wasEx) {
                this.selectedEditor = this.scaleX;
                this.$typeSelect.replaceWithOptions(this.extendedOptions);
                this.$typeSelect.value = this.extendedOptions[0];
            }
            // @ts-expect-error 上面已经排除（我也不知道什么时候会出这种）
            this.selectedLayer = val;
        });
        this.$rangeInput.whenValueChange((content) => {
            if (this.selectedEditor instanceof TextEventSequenceEditor) {
                return;
            }
            if (content === "auto" || content === "") {
                this.selectedEditor.autoRangeEnabled = true;
                return;
            }
            const parts = content.split(",");
            if (parts.length !== 2) {
                notify("Invalid range");
                this.updateAdjustmentOptions(this.selectedEditor);
                return;
            }
            this.selectedEditor.valueRange = [parseFloat(parts[0]), parseFloat(parts[1])];
            this.selectedEditor.autoRangeEnabled = false;
        })
        this.$easingBox.onChange(id => {
            for (let type of eventTypeKeys) {
                this[type].easing = rpeEasingArray[id];
            }
        });
        this.$easingBox.setValue(easingMap.linear.in);
        this.$newNodeStateSelect = new ZDropdownOptionBox([
            "Both",
            "Start",
            "End"
        ].map((s) => new BoxOption(s)), true)
            .whenValueChange((val) => {
                for (let type of eventTypeKeys) {
                    if (type === "text") {
                        continue;
                    }
                    this[type].newNodeState = NewNodeState["controls" + val];
                }
            });
            
        this.$encapsuleBtn = new ZButton("Encapsule");
        this.$templateNameInput = new ZInputBox().attr("size", "4");
        this.$templateNameInput.whenValueChange((name) => {
            const easing = editor.chart.templateEasingLib.get(name)
            if (easing) {
                this.easing.target = easing.eventNodeSequence;
                this.easing.targetEasing = easing;
                this.draw();
            } else {
                this.easing.target = null;
            }
        })
        this.on("wheel", (ev) => {
            const delta = ev.deltaY / 500;
            if (editor.player.playing) {
                editor.pause()
            }
            if (this.selectedEditor === this.easing) {
                this.easingBeats = Math.min(Math.max(this.easingBeats + delta, 0), this.easing.target.effectiveBeats);
                this.easing.draw(this.easingBeats)
            } else {
                changeAudioTime(editor.player.audio, delta);
                editor.update()
            }
        })



        this.$bar.append(
            this.$typeSelect,
            this.$layerSelect,
            this.$timeSpanInput,
            this.$rangeInput,
            this.$selectOption,
            this.$editSwitch,
            this.$easingBox,
            this.$newNodeStateSelect,
            this.$templateNameInput,
            this.$encapsuleBtn
        )
        this.append(this.$bar)


        this.nodesSelection = new Set<EventStartNode<unknown>>();

    }
    init() {
        const barHeight = this.$bar.clientHeight + 8;
        for (let type of numericEventTypeKeys) {
            this[type] = new EventCurveEditor(EventType[type], this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
            this[type].active = false;
            this.append(this[type].element)
        }
        this.text = new TextEventSequenceEditor(this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
        this.text.active = false;
        this.append(this.text.element)
        this.color = new ColorEventSequenceEditor(this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
        this.color.active = false;
        this.append(this.color.element)
        this.selectedEditor = this.moveX;
    }
    _selectedEditor: EventCurveEditor | TextEventSequenceEditor;
    get selectedEditor() {
        return this._selectedEditor
    }
    set selectedEditor(val) {
        if (val === this._selectedEditor) return;
        if (this._selectedEditor) this._selectedEditor.active = false;
        this._selectedEditor = val;
        val.active = true;
        if (val instanceof EventCurveEditor)
            this.updateAdjustmentOptions(val);
        this.nodesSelection = new Set<EventStartNode<unknown>>();
        this.draw()
    }
    _selectedLayer: "0" | "1" | "2" | "3" | "ex" = "0";
    get selectedLayer() {
        return this._selectedLayer
    }
    set selectedLayer(val) {
        this._selectedLayer = val;
        if (val === "ex") {

        } else {
            ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
                this[type].changeTarget(this.target, val)
            })
        }
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats
        this.lastBeats = beats;
        //console.log("draw")
        if (this.selectedEditor === this.easing) {
            this.easing.draw(this.easingBeats);
        } else {
                
            this.selectedEditor.draw(beats)
        }
    }
    target: JudgeLine;
    changeTargetLine(target: JudgeLine) {
        (["moveX", "moveY", "alpha", "rotate", "speed", "scaleX", "scaleY", "text", "color"] as const).forEach((type) => {
            this[type].changeTarget(target, this.selectedLayer)
        })
        this.target = target;
        this.draw()
    }
    updateAdjustmentOptions(editor: EventCurveEditor) {
        this.$rangeInput.setValue(editor.autoRangeEnabled ? "auto" : editor.valueRange.join(","))
    }
}

type NodePosition = {
    node: EventNode;
    x: number;
    y: number
}

enum EventCurveEditorState {
    select,
    selecting,
    edit,
    flowing,
    selectScope,
    selectingScope
}

const lengthOf = (range: readonly [number, number]) => range[1] - range[0];
const medianOf = (range: readonly [number, number]) => (range[0] + range[1]) / 2;
const percentileOf = (range: readonly [number, number], percent: number) => range[0] + lengthOf(range) * percent;
/**
 * 对于一个值，在一系列可吸附值上寻找最接近的值
 * @param sortedAttachable 
 * @param value 
 * @returns 
 */
const computeAttach = (sortedAttachable: number[], value: number) => {
    const len = sortedAttachable.length;
    if (len === 0) return value;
    if (value < sortedAttachable[0]) {
        return sortedAttachable[0];
    }
    for (let i = 0; i < len - 1; i++) {
        const cur = sortedAttachable[i];
        if (value === cur) {
            return cur;
        }
        const next = sortedAttachable[i + 1];
        if (value > cur && value < next) {
            return (value - cur) < (next - value) ? cur : next;
        }
    }
    if (value > sortedAttachable[len - 1]) {
        return sortedAttachable[len - 1];
    }
}
/**
 * 生成可吸附值
 * @param linear 一次函数的两个系数
 * @param range 显示范围
 */
function generateAttachable (linear: [k: number, b: number], range: readonly [number, number])  {
    const k = linear[0], b = linear[1];
    const left = range[0], right = range[1];
    if (k <= 1e-6) {
        return [left, b, right];
    }
    const startingX = Math.floor((left - b) / k);
    const attachable: number[] = [];
    for (let i = startingX; ; i++) {
        const val = k * i + b;
        attachable.push(k * i + b);
        if (val > right) break;
    }
    return attachable;
}

function divideOrMul(gridSpan: number, maximum: number)  {
    const m = Math.floor(maximum);
    if (m === 0) {
        const times = Math.floor(1 / maximum);
        return gridSpan * times;
    }
    if (isNaN(gridSpan) || isNaN(m)) { debugger;}
    if (!Number.isInteger(gridSpan)) {
        return gridSpan / m;
    } else {
        // 有的时候maximum莫名其妙整的特大，采取这种方式
        if (gridSpan < maximum) {
            return 1;
        }
        for (let i = m; i >= 1; i--) {
            if (gridSpan % i === 0) {
                return gridSpan / i;
            }
        }
        return gridSpan;
    }
}

class EventCurveEditor {
    target: EventNodeSequence<number>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;

    innerHeight: number;
    innerWidth: number;

    $element: Z<"div">;
    element: HTMLDivElement
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // halfCent: number;
    valueRatio: number;
    timeRatio: number;
    valueRange: readonly [number, number];

    timeSpan: number;
    timeGridSpan: number;
    attachableValues: number[] = [];

    timeGridColor: RGB;
    valueGridColor: RGB;

    padding: number;

    lastBeats: number;

    selectionManager: SelectionManager<EventStartNode | EventEndNode>;
    state: EventCurveEditorState;
    wasEditing: boolean

    _selectedNode: WeakRef<EventStartNode | EventEndNode>;
    pointedValue: number;
    pointedTime: TimeT;

    easing: NormalEasing;
    newNodeState: NewNodeState = NewNodeState.controlsBoth;
    selectState: SelectState;
    lastSelectState: SelectState = SelectState.extend;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;

    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref()
    }
    set selectedNode(val: EventStartNode | EventEndNode) {
        this._selectedNode = new WeakRef(val);
        editor.eventEditor.target = val;
    }

    private _active: boolean
    /** @deprecated use active instead */
    get displayed() {return this.active}
    set displayed(val) {this.active = val}
    get active() {
        return this._active
    }
    set active(val) {
        if (val === this._active) {
            return
        }
        this._active = val;
        if (val) {
            this.element.style.display = ""
        } else {
            this.element.style.display = "none";
        }
    }
    constructor(public type: Exclude<EventType, EventType.text | EventType.color>, height: number, width: number, parent: EventCurveEditors) {
        const config = eventTypeMap[type]
        if (type === EventType.alpha) {
            this.autoRangeEnabled = false;
        }
        this.parentEditorSet = parent
        this._active = true;
        this.$element = $("div")
        this.element = this.$element.element;
        this.active = false;
        this.state = EventCurveEditorState.select


        this.selectionManager = new SelectionManager()


        this.canvas = document.createElement("canvas")
        this.element.append(this.canvas)
        this.canvas.width = width
        this.canvas.height = height;
        this.padding = 14;
        this.innerHeight = this.canvas.height - this.padding * 2;
        this.innerWidth = this.canvas.width - this.padding * 2;
        this.context = this.canvas.getContext("2d");
        this.context.font = "16px Phigros"


        this.timeSpan = 4
        // this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.valueRatio = this.innerHeight / lengthOf(this.valueRange);
        this.attachableValues = generateAttachable([config.valueGridSpan, 0], this.valueRange);
        this.timeRatio = this.innerWidth / this.timeSpan;
        this.timeGridSpan = 1;
        this.timeGridColor = [120, 255, 170];
        this.valueGridColor = [255, 170, 120];
        this.initContext()

        this.easing = easingMap.linear.in;
        
        // 下面有一堆监听器
        // #region
        parent.$editSwitch.whenClickChange((checked) => {
            this.state = checked ? EventCurveEditorState.edit : EventCurveEditorState.select;
        })
        parent.$timeSpanInput.whenValueChange((val) => {
            this.timeSpan = parent.$timeSpanInput.getNum();
            this.draw();
        })
        

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const coord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            
            const {x, y} = coord;
            const {padding} = this;
            const {x: beats, y: value} = coord.mul(this.invertedMatrix);
            this.pointedValue = computeAttach(this.attachableValues, value);
            const accurateBeats = beats + this.lastBeats
            let pointedBeats = Math.floor(accurateBeats)
            let beatFraction = Math.round((accurateBeats - pointedBeats) * editor.timeDivisor)
            if (beatFraction === editor.timeDivisor) {
                pointedBeats += 1
                beatFraction = 0
            }
            this.pointedTime = [pointedBeats, beatFraction, editor.timeDivisor];

            switch (this.state) {
                case EventCurveEditorState.selecting:
                    // console.log("det")
                    editor.operationList.do(new EventNodeValueChangeOperation(this.selectedNode, this.pointedValue))
                    editor.operationList.do(new EventNodeTimeChangeOperation(this.selectedNode, this.pointedTime))

            }
            this.draw()
        })
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event)
            this.draw()
        })
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.upHandler(event)
            this.draw()
        })

        parent.$selectOption.whenValueChange((v: string) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = EventCurveEditorState.select;
            } else {
                this.state = EventCurveEditorState.selectScope;
                this.lastSelectState = this.selectState;
            }
        });

        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        parent.$encapsuleBtn.onClick(() => {
            if (!this.active) {
                return;
            }
            const $input = this.parentEditorSet.$templateNameInput
            const name = $input.getValue();
            if (name === "") {
                notify("Please input template name")
                return;
            }
            const lib = editor.chart.templateEasingLib;
            if (name in lib.easings) {
                notify("Template name already exists")
                return;
            }
            // 普通的ECE激活时一定是选中的普通节点，断言是安全的
            const op = encapsule(lib, this.target, this.parentEditorSet.nodesSelection as Set<EventStartNode>, name);
            if (op === EncapsuleErrorType.NotBelongToSourceSequence) {
                notify("Not belong to source sequence")
            } else if (op === EncapsuleErrorType.NotContinuous) {
                notify("Not continuous")
            } else if (op === EncapsuleErrorType.ZeroDelta) {
                notify("Selected first and last eventStartNode has zero delta");
            } else {
                editor.operationList.do(op);
                parent.$templateNameInput.dispatchEvent(new ZValueChangeEvent());
            }
        })
        
        window.addEventListener("keydown", (e: KeyboardEvent) => { // 踩坑：Canvas不能获得焦点
            if (!this.mouseIn) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    return;
                }
                parent.$selectOption.value = parent.selectOptions[SelectState[this.lastSelectState]]
                this.state = EventCurveEditorState.selectScope;
                this.selectState = this.lastSelectState;
                this.draw();
                return;
            }
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
            }
        })
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    this.state = EventCurveEditorState.select;
                    this.selectState = SelectState.none;
                    parent.$selectOption.value = parent.selectOptions.none;
                    this.draw();
                }
            }
        })
        // #endregion
    }

    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix() {
        this.valueRatio = this.innerHeight / lengthOf(this.valueRange);
        this.timeRatio = this.innerWidth / this.timeSpan;
        const {
            valueRange,
            timeRatio,
            valueRatio
        } = this;
        this.matrix = identity.scale(timeRatio, -valueRatio).translate(0, -medianOf(valueRange));
        this.invertedMatrix = this.matrix.invert();
        // console.log(this.matrix);
        // console.log(identity.translate(0, -valueBasis * valueRange))
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
    }

    downHandler(event: MouseEvent | TouchEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const coord = canvasCoord.mul(this.invertedMatrix);
        this.canvasPoint = canvasCoord;
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord)
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target
                    editor.switchSide(editor.eventEditor)
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                const time: TimeT = this.pointedTime;
                const prev = this.target.getNodeAt(TimeCalculator.toBeats(time))
                if (TimeCalculator.eq(prev.time, time)) {
                    break;
                }
                let node, endNode;
                if (this.type === EventType.bpm) {
                    node = new BPMStartNode(time, this.pointedValue);
                    endNode = new BPMEndNode(time);
                } else {
                    endNode = new EventEndNode(time, this.newNodeState === NewNodeState.controlsStart ? prev.value : this.pointedValue)
                    node = new EventStartNode(time, this.newNodeState === NewNodeState.controlsEnd ? prev.value : this.pointedValue);
                }
                node.easing = this.parentEditorSet.easing.targetEasing ?? this.easing;
                EventNode.connect(endNode, node)
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.operationList.do(new EventNodePairInsertOperation(node, prev));
                if (this.type === EventType.bpm) {
                    editor.player.audio.currentTime = editor.chart.timeCalculator.toSeconds(this.lastBeats);
                }
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.parentEditorSet.$editSwitch.checked = false;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: MouseEvent | TouchEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const {x, y} = canvasCoord.mul(this.invertedMatrix);
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                    this.parentEditorSet.$editSwitch.checked = true;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array.map(x => x.target).filter(x => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.union(new Set(nodes)) as Set<EventStartNode<unknown>>;
                        break;
                    case SelectState.replace:
                        this.parentEditorSet.nodesSelection = new Set(nodes) as Set<EventStartNode<unknown>>;
                        break;
                    case SelectState.exclude:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.difference(new Set(nodes));
                        break;
                }
                this.parentEditorSet.nodesSelection = new Set([...this.parentEditorSet.nodesSelection].filter((note: EventStartNode<any>) => !!note.parentSeq))
                // console.log("bp")
                if (this.parentEditorSet.nodesSelection.size !== 0) {
                    editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection;
                    editor.switchSide(editor.multiNodeEditor);
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    initContext() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {height: canvasHeight, width: canvasWidth} = this.canvas;
        const {innerHeight, innerWidth} = this;
        const {
            attachableValues,
            timeGridSpan, valueRange,
            valueRatio, timeRatio, context} = this;
        const timeDivisor = editor.timeDivisor
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight)
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        context.save()
        context.fillStyle = "#EEE";
        context.strokeStyle = rgb(...this.valueGridColor)
        context.lineWidth = 1;

        const len = attachableValues.length;
        for (let i = 0; i < len; i++) {
            const value = attachableValues[i];
            const positionY = this.matrix.ymul(0, value);
            drawLine(context, -canvasWidth / 2, positionY, canvasWidth, positionY);
            context.fillText(value + "", -innerWidth / 2, positionY)
        }
        context.strokeStyle = rgb(...this.timeGridColor)

        context.lineWidth = 3;
        
        const stopBeats = Math.ceil((beats + this.timeSpan / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeSpan / 2) / timeGridSpan - 1) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats)  * timeRatio
            drawLine(context, positionX, innerHeight / 2, positionX, -innerHeight / 2);
            context.fillText(time + "", positionX, innerHeight / 2)

            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio
                drawLine(context, minorPosX, innerHeight / 2, minorPosX, -innerHeight / 2);
            }
            context.restore()
        }
        context.restore()
        context.lineWidth = 3;
        drawLine(context, 0, innerHeight / 2, 0, -innerHeight / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        if (!this.target) {
            return
        }
        beats = beats || this.lastBeats || 0;
        this.updateMatrix()
        const {
            context,
            selectionManager,
            matrix
        }= this
        selectionManager.refresh()
        this.drawCoordination(beats)
        context.save()
        context.fillStyle = "#EEE"
        context.font = "16px phigros"
        context.fillText("State: " + EventCurveEditorState[this.state], 10, -30)
        context.fillText("Beats: " + shortenFloat(beats, 4).toString(), 10, -10)
        context.fillText("Sequence: " + this.target.id, 10, -50)
        context.fillText(`fps: ${shortenFloat(editor.frameRate, 2)}`, 10, -70);
        context.fillText(`Time: ${shortenFloat(editor.player.time, 4)}s`, 10, 40)
        const pointedTime = this.pointedTime;
        if (pointedTime) {
            context.fillText(`pointedTime: ${pointedTime[0]}:${pointedTime[1]}/${pointedTime[2]}`, 10, 10);
        }

        if (this.canvasPoint) {
            this.context.fillText(`Cursor: ${this.canvasPoint.x}, ${this.canvasPoint.y}`, 10, -90)
        }
        context.restore()
        const startBeats = beats - this.timeSpan / 2;
        const endBeats = beats + this.timeSpan / 2;
        // 该数组用于自动调整网格
        const valueArray = [];


        const line = editor.judgeLinesEditor?.selectedLine;
        if (
            line &&
            [EventType.moveX, EventType.moveY, EventType.alpha, EventType.rotate, EventType.speed].includes(this.type)
            && !line.group.isDefault()
        ) {
            const group = line.group;
            const parent = this.parentEditorSet
            context.save();
            context.font = "16px Phigros"
            const len = group.judgeLines.length;
            for (let i = 0; i < len; i++) {
                const judgeLine = group.judgeLines[i];
                if (judgeLine === line) {
                    continue;
                }
                const sequence = judgeLine.extendedLayer[EventType[this.type]];
                if (!sequence) {
                    continue;
                }
                context.strokeStyle = context.fillStyle = `hsl(${i / len * 360}, 80%, 75%)`;
                context.globalAlpha = 1
                context.fillText(`${judgeLine.id}`, i * 14, 60);
                context.globalAlpha = 0.5;
                this.drawSequence(sequence, valueArray, beats, startBeats, endBeats, matrix);
            }
            context.restore();
        }

        selectionManager.setBasePriority(1);
        this.drawSequence(this.target, valueArray, beats, startBeats, endBeats, matrix);
        selectionManager.setBasePriority(0);


        this.adjust(valueArray);
        
        if (this.state === EventCurveEditorState.selectingScope) {
            const {startingCanvasPoint, canvasPoint} = this;
            context.save()
            context.lineWidth = 3;
            context.strokeStyle = SCOPING_COLOR;
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore()
        }
        this.lastBeats = beats;
    }
    drawSequence(sequence: EventNodeSequence, valueArray: number[], beats: number, startBeats: number, endBeats: number, matrix: Matrix) {
        const {selectionManager, context} = this;
        const {width} = this.canvas;
        
        let previousEndNode: EventEndNode | EventNodeLike<NodeType.HEAD> = sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || sequence.head; // 有点奇怪的操作
        let previousTime = previousEndNode.type === NodeType.HEAD ? 0: TimeCalculator.toBeats(previousEndNode.time);
        while (previousTime < endBeats) {
            const startNode = previousEndNode.next;
            const endNode = startNode.next;
            if (endNode.type === NodeType.TAIL) {
                break;
            }
            const startTime = TimeCalculator.toBeats(startNode.time);
            const endTime = TimeCalculator.toBeats(endNode.time);
            const startValue = startNode.value;
            const endValue   = endNode.value;
            valueArray.push(startValue, endValue);
            const {x: startX, y: startY} = new Coordinate(startTime - beats, startValue).mul(matrix);
            // console.log("startXY", startX, startY);
            // console.log(Matrix.fromDOMMatrix(context.getTransform()))
            const {x: endX, y: endY} = new Coordinate(endTime - beats, endValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2
            const topEndY = endY - NODE_HEIGHT / 2

            selectionManager.add({
                target: startNode,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY)
            selectionManager.add({
                target: endNode,
                left: endX - NODE_WIDTH,
                top: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, endX - NODE_WIDTH, topEndY + NODE_HEIGHT + 20)

            const selected = (this.parentEditorSet.nodesSelection as Set<EventStartNode>).has(startNode)

            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }


            startNode.drawCurve(context, startX, startY, endX, endY, matrix);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT)
            // console.log(this.type, EventType.speed)
            if (this.type === EventType.speed) {
                // console.log(startNode)
                // console.log(startNode.easing)
                context.lineWidth = 1;
                context.fillText(("" + startNode.cachedIntegral).slice(0, 6), startX, 0)
                context.lineWidth = 3
            }
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if (previousEndNode.next.next.type === NodeType.TAIL) {
            const lastStart = previousEndNode.next;
            const startTime = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const {x: startX, y: startY} = new Coordinate(startTime - beats, startValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2;
            const selected = (this.parentEditorSet.nodesSelection as Set<EventStartNode>).has(lastStart)
            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }
            drawLine(context, startX, startY, width / 2, startY);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            selectionManager.add({
                target: lastStart,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);

        }
    }

    autoRangeEnabled: boolean = true;
    adjust(values: number[]): void {
        if (this.state !== EventCurveEditorState.select) {
            return;
        }
        const valueRange = this.valueRange;
        const distinctValueCount = new Set(values).size;
        if (distinctValueCount < 2 && valueRange[0] < values[0] && values[0] < valueRange[1]) {
            return;
        }
        if (this.autoRangeEnabled) {
            
            const sorted = values.sort((a, b) => a - b);
            const lengthOfValue = lengthOf(valueRange);
            // 如果上四分位数超出了valueRange，则扩大valueRange右边界valueRange长度的一半。
            // 如果上四分位数不及valueRange的2/3处位置，则缩小valueRange右边界valueRange长度的一半。
            // 下四分位数同理
            const upper = getPercentile(sorted, 0.95);
            const lower = getPercentile(sorted, 0.05);
            const pos1Third = percentileOf(valueRange, 0.34);
            const pos2Third = percentileOf(valueRange, 0.66);
            const range: [number, number] = [...this.valueRange];
            if (upper > valueRange[1]) {
                range[1] = valueRange[1] + lengthOfValue / 2;
            } else if (upper < pos2Third) {
                range[1] = valueRange[1] - lengthOfValue / 3;
            }
            if (lower < valueRange[0]) {
                range[0] = valueRange[0] - lengthOfValue / 2;
            } else if (lower > pos1Third) {
                range[0] = valueRange[0] + lengthOfValue / 3;
            }
            this.valueRange = range;
        }

        // 计算合适的valueGridSpan
        // 根据这个值能够整除多少个值。
        let priority = 0;
        let valueGridSpan = eventTypeMap[this.type].valueGridSpan;
        const len = values.length;
        for (let i = 0; i < len; i++) {
            const v = values[i];
            if (v === 0) {
                continue;
            }
            const p = values.reduce((acc, cur) => {
                return cur % v === 0 ? acc + 1 : acc
            });
            if (p > priority * 1.2) {
                priority = p;
                valueGridSpan = v;
            }
        }
        valueGridSpan = divideOrMul(valueGridSpan, 10 / (lengthOf(this.valueRange) / valueGridSpan));
        
        if (distinctValueCount > 10) {
            this.attachableValues = generateAttachable([valueGridSpan, 0], this.valueRange);
        } else {
                
            this.attachableValues = Array.from(new Set([...generateAttachable([valueGridSpan, 0], this.valueRange), ...values])).sort((a, b) => a - b);
        }
        
    }
    changeTarget(line: JudgeLine, index: string) {
        if (this.type === EventType.easing) {
            console.error("Easing does not use changeTarget. Assign directly instead.")
            return;
        }
        if (this.type === EventType.scaleX || this.type === EventType.scaleY) {
            const seq = line.extendedLayer[EventType[this.type]];
            if (seq) {
                this.target = seq;
            } else {
                const seq = editor.chart.createEventNodeSequence(this.type, `#${line.id}.ex.${EventType[this.type]}`)
                line.extendedLayer[EventType[this.type]] = seq;
                this.target = seq
                notify(`Created a new EventNodeSequence ${this.target.id}. This is not an operation, and thus you cannot undo.`);
            }
            return;
        }
        if (index === "ex") {
            return;
        }
        line.eventLayers[index] = line.eventLayers[index] || {};
        const seq = line.eventLayers[index][EventType[this.type]];
        if (seq) {
            this.target = seq;
        } else {
            const seq = editor.chart.createEventNodeSequence(this.type, `#${line.id}.${index}.${EventType[this.type]}`)
            this.target = seq;
            line.eventLayers[index][EventType[this.type]] = seq;
            notify(`Created a new EventNodeSequence ${this.target.id}. This is not an operation, and thus you cannot undo.`);
        }
    }

    

    paste() {
        if (!this.active) {
            return;
        }
        const {lastBeats} = this;
        const {clipboard} = this.parentEditorSet;
        const {timeDivisor} = editor;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        for (let ele of clipboard) {
            if (typeof ele.value === "number") {
                break;
            } else {
                return;
            }
        }
        if (!lastBeats) {
            notify("Have not rendered a frame")
        }
        const dest: TimeT = this.pointedTime

        
        const [_, newNodes] = EventNode.setToNewOrderedArray(dest, clipboard as Set<EventStartNode>);
        editor.operationList.do(new MultiNodeAddOperation(newNodes, this.target));
        editor.multiNodeEditor.target = (this.parentEditorSet.nodesSelection as Set<EventStartNode>) = new Set<EventStartNode>(newNodes);
        editor.update();
    }
    copy(): void {
        if (!this.active) {
            return;
        }
        console.log(this.parentEditorSet.nodesSelection);
        this.parentEditorSet.clipboard = this.parentEditorSet.nodesSelection;
        this.parentEditorSet.nodesSelection = new Set<EventStartNode<unknown>>();
        editor.update();
    }
}


class TextEventSequenceEditor {
    target: EventNodeSequence<string>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;

    innerHeight: number;
    innerWidth: number;

    $element: Z<"div">;
    element: HTMLDivElement
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    timeRatio: number;

    timeSpan: number;
    timeGridInterval: number;

    timeGridColor: RGB;

    padding: number;

    lastBeats: number;

    selectionManager: SelectionManager<EventStartNode<string> | EventEndNode<string>>;
    state: EventCurveEditorState;
    wasEditing: boolean

    _selectedNode: WeakRef<EventStartNode<string> | EventEndNode<string>>;
    pointedTime: TimeT;

    easing: NormalEasing;
    selectState: SelectState;
    lastSelectState: SelectState = SelectState.extend;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;

    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref()
    }
    set selectedNode(val: EventStartNode<string> | EventEndNode<string>) {
        this._selectedNode = new WeakRef(val);
        editor.eventEditor.target = val;
    }

    private _active: boolean
    /** @deprecated use active instead */
    get displayed() {return this.active}
    set displayed(val) {this.active = val}
    get active() {
        return this._active
    }
    set active(val) {
        if (val === this._active) {
            return
        }
        this._active = val;
        if (val) {
            this.element.style.display = ""
        } else {
            this.element.style.display = "none";
        }
    }
    constructor(height: number, width: number, parent: EventCurveEditors) {
        this.parentEditorSet = parent
        this._active = true;
        this.$element = $("div")
        this.element = this.$element.element;
        this.active = false;
        this.state = EventCurveEditorState.select


        this.selectionManager = new SelectionManager()


        this.canvas = document.createElement("canvas")
        this.element.append(this.canvas)
        this.canvas.width = width
        this.canvas.height = height;
        this.padding = 14;
        this.innerHeight = this.canvas.height - this.padding * 2;
        this.innerWidth = this.canvas.width - this.padding * 2;
        this.context = this.canvas.getContext("2d");
        this.context.font = "16px Phigros"


        this.timeSpan = 4
        this.timeRatio = this.innerWidth / this.timeSpan;
        this.timeGridInterval = 1;
        this.timeGridColor = [120, 255, 170];
        this.initContext()

        this.easing = easingMap.linear.in;
        
        // 下面有一堆监听器
        // #region
        parent.$editSwitch.whenClickChange((checked) => {
            this.state = checked ? EventCurveEditorState.edit : EventCurveEditorState.select;
        })
        parent.$timeSpanInput.whenValueChange((val) => {
            this.timeSpan = parent.$timeSpanInput.getNum();
            this.draw();
        })
        

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const coord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            
            const offsetBeats = coord.x / this.timeGridInterval / this.timeRatio;
            const accurateBeats = offsetBeats + this.lastBeats
            let pointedBeats = Math.floor(accurateBeats)
            let beatFraction = Math.round((accurateBeats - pointedBeats) * editor.timeDivisor)
            if (beatFraction === editor.timeDivisor) {
                pointedBeats += 1
                beatFraction = 0
            }
            this.pointedTime = [pointedBeats, beatFraction, editor.timeDivisor];

            switch (this.state) {
                case EventCurveEditorState.selecting:
                    // console.log("det")
                    editor.operationList.do(new EventNodeTimeChangeOperation(this.selectedNode, this.pointedTime))

            }
            this.draw()
        })
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event)
            this.draw()
        })
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.upHandler(event)
            this.draw()
        })

        parent.$selectOption.whenValueChange((v: string) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = EventCurveEditorState.select;
            } else {
                this.state = EventCurveEditorState.selectScope;
                this.lastSelectState = this.selectState;
            }
        });

        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        parent.$encapsuleBtn.onClick(() => {
            if (!this.active) {
                return;
            }
            notify("Encapsulation is not supported for text.")
        })
        
        window.addEventListener("keydown", (e: KeyboardEvent) => { // 踩坑：Canvas不能获得焦点
            if (!this.mouseIn) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    return;
                }
                parent.$selectOption.value = parent.selectOptions[SelectState[this.lastSelectState]]
                this.state = EventCurveEditorState.selectScope;
                this.selectState = this.lastSelectState;
                this.draw();
                return;
            }
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
            }
        })
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    this.state = EventCurveEditorState.select;
                    this.selectState = SelectState.none;
                    parent.$selectOption.value = parent.selectOptions.none;
                    this.draw();
                }
            }
        })
        // #endregion
    }

    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix() {
        this.timeRatio = this.innerWidth / this.timeSpan;
        // console.log(this.matrix);
        // console.log(identity.translate(0, -valueBasis * valueRange))
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
    }

    downHandler(event: MouseEvent | TouchEvent) {
        if (!this.target) {
            this.createTarget(editor.judgeLinesEditor.selectedLine);
            return;
        }
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        this.canvasPoint = canvasCoord;
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord)
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target
                    editor.switchSide(editor.eventEditor)
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                const time: TimeT = this.pointedTime;
                const prev = this.target.getNodeAt(TimeCalculator.toBeats(time))
                if (TimeCalculator.eq(prev.time, time)) {
                    break;
                }
                const endNode = new EventEndNode(time, prev.value)
                const node = new EventStartNode(time, prev.value);
                
                node.easing = this.parentEditorSet.easing.targetEasing ?? this.easing;
                EventNode.connect(endNode, node)
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.operationList.do(new EventNodePairInsertOperation(node, prev));
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.parentEditorSet.$editSwitch.checked = false;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: MouseEvent | TouchEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                    this.parentEditorSet.$editSwitch.checked = true;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array.map(x => x.target).filter(x => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        (this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>) = (this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>).union(new Set(nodes));
                        break;
                    case SelectState.replace:
                        (this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>) = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.difference(new Set(nodes));
                        break;
                }
                (this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>) = new Set([...this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>].filter((note: EventStartNode<string>) => !!note.parentSeq))
                // console.log("bp")
                if (this.parentEditorSet.nodesSelection.size !== 0) {
                    editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection;
                    editor.switchSide(editor.multiNodeEditor);
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    initContext() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {height: canvasHeight, width: canvasWidth} = this.canvas;
        const {innerHeight, innerWidth} = this;
        const {
            timeGridInterval: timeGridSpan,
            timeRatio, context} = this;

        context.fillStyle = "#333"
        
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight)
        const timeDivisor = editor.timeDivisor
        context.strokeStyle = rgb(...this.timeGridColor)

        context.lineWidth = 3;
        
        const stopBeats = Math.ceil((beats + this.timeSpan / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeSpan / 2) / timeGridSpan - 1) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats)  * timeRatio
            drawLine(context, positionX, innerHeight / 2, positionX, -innerHeight / 2);
            context.fillStyle = "#FFF"
            context.fillText(time + "", positionX, innerHeight / 2)

            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio
                drawLine(context, minorPosX, innerHeight / 2, minorPosX, -innerHeight / 2);
            }
            context.restore()
        }
        context.restore()
        context.lineWidth = 3;
        drawLine(context, 0, innerHeight / 2, 0, -innerHeight / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix()
        const {
            context,
            selectionManager
        }= this
        selectionManager.refresh()
        this.drawCoordination(beats)
        if (!this.target) {
            context.fillText("Click to add a textEvent Sequence (IRREVERSIBLE!)", 0, 0)
            return
        }
        context.save()
        context.fillStyle = "#EEE"
        context.font = "16px phigros"
        context.fillText("State: " + EventCurveEditorState[this.state], 10, -30)
        context.fillText("Beats: " + shortenFloat(beats, 4).toString(), 10, -10)
        context.fillText("Sequence: " + this.target.id, 10, -50)
        context.fillText(`fps: ${shortenFloat(editor.frameRate, 2)}`, 10, -70);
        context.fillText(`Time: ${shortenFloat(editor.player.time, 4)}s`, 10, 40)
        const pointedTime = this.pointedTime;
        if (pointedTime) {
            context.fillText(`pointedTime: ${pointedTime[0]}:${pointedTime[1]}/${pointedTime[2]}`, 10, 10);
        }

        if (this.canvasPoint) {
            this.context.fillText(`Cursor: ${this.canvasPoint.x}, ${this.canvasPoint.y}`, 10, -90)
        }
        context.restore()
        const startBeats = beats - this.timeSpan / 2;
        const endBeats = beats + this.timeSpan / 2;


        const line = editor.judgeLinesEditor?.selectedLine;
        let len = 0;
        if (
            line && !line.group.isDefault()
        ) {
            const group = line.group;
            const parent = this.parentEditorSet
            context.save();
            context.font = "16px Phigros"
            len = group.judgeLines.length;
            for (let i = 0; i < len; i++) {
                const judgeLine = group.judgeLines[i];
                if (judgeLine === line) {
                    continue;
                }
                const sequence = judgeLine.extendedLayer.text;
                if (!sequence) {
                    continue;
                }
                context.strokeStyle = context.fillStyle = `hsl(${i / len * 360}, 80%, 75%)`;
                context.globalAlpha = 1
                context.fillText(`${judgeLine.id}`, i * 14, 60);
                context.globalAlpha = 0.5;
                this.drawSequence(sequence, beats, startBeats, endBeats, i + 1, len + 1);
            }
            context.restore();
        }

        selectionManager.setBasePriority(1);
        this.drawSequence(this.target, beats, startBeats, endBeats, 0, len + 1);
        console.log("seq")
        selectionManager.setBasePriority(0);


        
        if (this.state === EventCurveEditorState.selectingScope) {
            const {startingCanvasPoint, canvasPoint} = this;
            context.save()
            context.lineWidth = 3;
            context.strokeStyle = SCOPING_COLOR;
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore()
        }
        this.lastBeats = beats;
    }
    drawSequence(sequence: EventNodeSequence<string>, beats: number, startBeats: number, endBeats: number, index: number, total: number) {
        const {selectionManager, context} = this;
        const {width} = this.canvas;
        const {innerHeight, innerWidth, timeRatio} = this;

        const Y = ((index + 0.5) / total - 0.5) * innerHeight;

        
        let previousEndNode: EventEndNode<string> | EventNodeLike<NodeType.HEAD, string> = sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || sequence.head; // 有点奇怪的操作
        let previousTime = previousEndNode.type === NodeType.HEAD ? 0: TimeCalculator.toBeats(previousEndNode.time);
        while (previousTime < endBeats) {
            const startNode = previousEndNode.next;
            const endNode = startNode.next;
            if (endNode.type === NodeType.TAIL) {
                break;
            }
            const startTime = TimeCalculator.toBeats(startNode.time);
            const endTime = TimeCalculator.toBeats(endNode.time);
            const startValue = startNode.value;
            const endValue   = endNode.value;
            const startX = (startTime - beats) * timeRatio;
            const endX = (endTime - beats) * timeRatio;
            const topY = Y - NODE_HEIGHT / 2
            const topEndY = Y - NODE_HEIGHT / 2

            selectionManager.add({
                target: startNode,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY)
            selectionManager.add({
                target: endNode,
                left: endX - NODE_WIDTH,
                top: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, endX - NODE_WIDTH, topEndY + NODE_HEIGHT + 20)

            const selected = this.parentEditorSet.nodesSelection.has(startNode as any)

            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }


            startNode.drawCurve(context, startX, Y, endX, Y, identity);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT)
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if (previousEndNode.next.next.type === NodeType.TAIL) {
            const lastStart = previousEndNode.next;
            const startBeats = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const startX = (startBeats - beats) * timeRatio;
            const topY = Y - NODE_HEIGHT / 2;
            const selected = this.parentEditorSet.nodesSelection.has(lastStart as any)
            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }
            drawLine(context, startX, Y, width / 2, Y);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, Y - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            selectionManager.add({
                target: lastStart,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);
        }
    }
    changeTarget(line: JudgeLine, index: string) {
        const seq = line.extendedLayer.text;
        this.target = seq;
        
    }
    createTarget(line: JudgeLine) {
        const seq = editor.chart.createEventNodeSequence(EventType.text, `#${line.id}.ex.text`)
        this.target = seq;
        editor.operationList.do(new JudgeLineExtendENSChangeOperation(line, "text", seq));
        notify(`Created #${line.id}.ex.text, you can undo it.`);
    }

    

    paste() {
        EventCurveEditor.prototype.paste.call(this);
    }
    copy(): void {
        EventCurveEditor.prototype.copy.call(this);
    }
}

class ColorEventSequenceEditor {
    target: EventNodeSequence<RGB>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;

    innerHeight: number;
    innerWidth: number;

    $element: Z<"div">;
    element: HTMLDivElement
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    timeRatio: number;

    timeSpan: number;
    timeGridInterval: number;

    timeGridColor: RGB;

    padding: number;

    lastBeats: number;

    selectionManager: SelectionManager<EvSoE<RGB>>;
    state: EventCurveEditorState;
    wasEditing: boolean

    _selectedNode: WeakRef<EvSoE<RGB>>;
    pointedTime: TimeT;

    easing: NormalEasing;
    selectState: SelectState;
    lastSelectState: SelectState = SelectState.extend;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;

    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref()
    }
    set selectedNode(val: EventStartNode<string> | EventEndNode<string>) {
        this._selectedNode = new WeakRef(val);
        editor.eventEditor.target = val;
    }

    private _active: boolean
    /** @deprecated use active instead */
    get displayed() {return this.active}
    set displayed(val) {this.active = val}
    get active() {
        return this._active
    }
    set active(val) {
        if (val === this._active) {
            return
        }
        this._active = val;
        if (val) {
            this.element.style.display = ""
        } else {
            this.element.style.display = "none";
        }
    }
    constructor(height: number, width: number, parent: EventCurveEditors) {
        this.parentEditorSet = parent
        this._active = true;
        this.$element = $("div")
        this.element = this.$element.element;
        this.active = false;
        this.state = EventCurveEditorState.select


        this.selectionManager = new SelectionManager()


        this.canvas = document.createElement("canvas")
        this.element.append(this.canvas)
        this.canvas.width = width
        this.canvas.height = height;
        this.padding = 14;
        this.innerHeight = this.canvas.height - this.padding * 2;
        this.innerWidth = this.canvas.width - this.padding * 2;
        this.context = this.canvas.getContext("2d");
        this.context.font = "16px Phigros"


        this.timeSpan = 4
        this.timeRatio = this.innerWidth / this.timeSpan;
        this.timeGridInterval = 1;
        this.timeGridColor = [120, 255, 170];
        this.initContext()

        this.easing = easingMap.linear.in;
        
        // 下面有一堆监听器
        // #region
        parent.$editSwitch.whenClickChange((checked) => {
            this.state = checked ? EventCurveEditorState.edit : EventCurveEditorState.select;
        })
        parent.$timeSpanInput.whenValueChange((val) => {
            this.timeSpan = parent.$timeSpanInput.getNum();
            this.draw();
        })
        

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const coord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            
            const offsetBeats = coord.x / this.timeGridInterval / this.timeRatio;
            const accurateBeats = offsetBeats + this.lastBeats
            let pointedBeats = Math.floor(accurateBeats)
            let beatFraction = Math.round((accurateBeats - pointedBeats) * editor.timeDivisor)
            if (beatFraction === editor.timeDivisor) {
                pointedBeats += 1
                beatFraction = 0
            }
            this.pointedTime = [pointedBeats, beatFraction, editor.timeDivisor];

            switch (this.state) {
                case EventCurveEditorState.selecting:
                    // console.log("det")
                    editor.operationList.do(new EventNodeTimeChangeOperation(this.selectedNode, this.pointedTime))

            }
            this.draw()
        })
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event)
            this.draw()
        })
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.upHandler(event)
            this.draw()
        })

        parent.$selectOption.whenValueChange((v: string) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = EventCurveEditorState.select;
            } else {
                this.state = EventCurveEditorState.selectScope;
                this.lastSelectState = this.selectState;
            }
        });

        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        parent.$encapsuleBtn.onClick(() => {
            if (!this.active) {
                return;
            }
            notify("Encapsulation is not supported for color.")
        })
        
        window.addEventListener("keydown", (e: KeyboardEvent) => { // 踩坑：Canvas不能获得焦点
            if (!this.mouseIn) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    return;
                }
                parent.$selectOption.value = parent.selectOptions[SelectState[this.lastSelectState]]
                this.state = EventCurveEditorState.selectScope;
                this.selectState = this.lastSelectState;
                this.draw();
                return;
            }
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
            }
        })
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                if (this.state === EventCurveEditorState.selectScope || this.state === EventCurveEditorState.selectingScope) {
                    this.state = EventCurveEditorState.select;
                    this.selectState = SelectState.none;
                    parent.$selectOption.value = parent.selectOptions.none;
                    this.draw();
                }
            }
        })
        // #endregion
    }

    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix() {
        this.timeRatio = this.innerWidth / this.timeSpan;
        // console.log(this.matrix);
        // console.log(identity.translate(0, -valueBasis * valueRange))
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
    }

    downHandler(event: MouseEvent | TouchEvent) {
        if (!this.target) {
            this.createTarget(editor.judgeLinesEditor.selectedLine);
            return;
        }
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        this.canvasPoint = canvasCoord;
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord)
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target
                    editor.switchSide(editor.eventEditor)
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                const time: TimeT = this.pointedTime;
                const prev = this.target.getNodeAt(TimeCalculator.toBeats(time))
                if (TimeCalculator.eq(prev.time, time)) {
                    break;
                }
                const endNode = new EventEndNode(time, prev.value)
                const node = new EventStartNode(time, prev.value);
                
                node.easing = this.parentEditorSet.easing.targetEasing ?? this.easing;
                EventNode.connect(endNode, node)
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.operationList.do(new EventNodePairInsertOperation(node, prev));
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.parentEditorSet.$editSwitch.checked = false;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: MouseEvent | TouchEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                    this.parentEditorSet.$editSwitch.checked = true;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array.map(x => x.target).filter(x => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        (this.parentEditorSet.nodesSelection as Set<EventStartNode<RGB>>) = (this.parentEditorSet.nodesSelection as Set<EventStartNode<RGB>>).union(new Set(nodes));
                        break;
                    case SelectState.replace:
                        (this.parentEditorSet.nodesSelection as Set<EventStartNode<RGB>>) = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.difference(new Set(nodes));
                        break;
                }
                (this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>) = new Set([...this.parentEditorSet.nodesSelection as Set<EventStartNode<string>>].filter((note: EventStartNode<string>) => !!note.parentSeq))
                // console.log("bp")
                if (this.parentEditorSet.nodesSelection.size !== 0) {
                    editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection;
                    editor.switchSide(editor.multiNodeEditor);
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    initContext() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {height: canvasHeight, width: canvasWidth} = this.canvas;
        const {innerHeight, innerWidth} = this;
        const {
            timeGridInterval: timeGridSpan,
            timeRatio, context} = this;

        context.fillStyle = "#333"
        
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight)
        const timeDivisor = editor.timeDivisor
        context.strokeStyle = rgb(...this.timeGridColor)

        context.lineWidth = 3;
        
        const stopBeats = Math.ceil((beats + this.timeSpan / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeSpan / 2) / timeGridSpan - 1) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats)  * timeRatio
            drawLine(context, positionX, innerHeight / 2, positionX, -innerHeight / 2);
            context.fillStyle = "#FFF"
            context.fillText(time + "", positionX, innerHeight / 2)

            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio
                drawLine(context, minorPosX, innerHeight / 2, minorPosX, -innerHeight / 2);
            }
            context.restore()
        }
        context.restore()
        context.lineWidth = 3;
        drawLine(context, 0, innerHeight / 2, 0, -innerHeight / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix()
        const {
            context,
            selectionManager
        }= this
        selectionManager.refresh()
        this.drawCoordination(beats)
        if (!this.target) {
            context.fillText("Click to add a colorEvent Sequence", 0, 0)
            return
        }
        context.save()
        context.fillStyle = "#EEE"
        context.font = "16px phigros"
        context.fillText("State: " + EventCurveEditorState[this.state], 10, -30)
        context.fillText("Beats: " + shortenFloat(beats, 4).toString(), 10, -10)
        context.fillText("Sequence: " + this.target.id, 10, -50)
        context.fillText(`fps: ${shortenFloat(editor.frameRate, 2)}`, 10, -70);
        context.fillText(`Time: ${shortenFloat(editor.player.time, 4)}s`, 10, 40)
        const pointedTime = this.pointedTime;
        if (pointedTime) {
            context.fillText(`pointedTime: ${pointedTime[0]}:${pointedTime[1]}/${pointedTime[2]}`, 10, 10);
        }

        if (this.canvasPoint) {
            this.context.fillText(`Cursor: ${this.canvasPoint.x}, ${this.canvasPoint.y}`, 10, -90)
        }
        context.restore()
        const startBeats = beats - this.timeSpan / 2;
        const endBeats = beats + this.timeSpan / 2;


        const line = editor.judgeLinesEditor?.selectedLine;
        let len = 0;
        if (
            line && !line.group.isDefault()
        ) {
            const group = line.group;
            const parent = this.parentEditorSet
            context.save();
            context.font = "16px Phigros"
            len = group.judgeLines.length;
            for (let i = 0; i < len; i++) {
                const judgeLine = group.judgeLines[i];
                if (judgeLine === line) {
                    continue;
                }
                const sequence = judgeLine.extendedLayer.color;
                if (!sequence) {
                    continue;
                }
                context.fillStyle = `hsl(${i / len * 360}, 80%, 75%)`;
                context.globalAlpha = 1
                context.fillText(`${judgeLine.id}`, i * 14, 60);
                context.globalAlpha = 0.5;
                this.drawSequence(sequence, beats, startBeats, endBeats, i + 1, len + 1);
            }
            context.restore();
        }

        selectionManager.setBasePriority(1);
        this.drawSequence(this.target, beats, startBeats, endBeats, 0, len + 1);
        console.log("seq")
        selectionManager.setBasePriority(0);


        
        if (this.state === EventCurveEditorState.selectingScope) {
            const {startingCanvasPoint, canvasPoint} = this;
            context.save()
            context.lineWidth = 3;
            context.strokeStyle = SCOPING_COLOR;
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore()
        }
        this.lastBeats = beats;
    }
    drawSequence(sequence: EventNodeSequence<RGB>, beats: number, startBeats: number, endBeats: number, index: number, total: number) {
        const {selectionManager, context} = this;
        const {width} = this.canvas;
        const {innerHeight, innerWidth, timeRatio} = this;

        const Y = ((index + 0.5) / total - 0.5) * innerHeight;

        
        let previousEndNode: EventEndNode<RGB> | EventNodeLike<NodeType.HEAD, RGB> = sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || sequence.head; // 有点奇怪的操作
        let previousTime = previousEndNode.type === NodeType.HEAD ? 0: TimeCalculator.toBeats(previousEndNode.time);
        while (previousTime < endBeats) {
            const startNode = previousEndNode.next;
            const endNode = startNode.next;
            if (endNode.type === NodeType.TAIL) {
                break;
            }
            const startTime = TimeCalculator.toBeats(startNode.time);
            const endTime = TimeCalculator.toBeats(endNode.time);
            const startValue = startNode.value;
            const endValue   = endNode.value;
            const startX = (startTime - beats) * timeRatio;
            const endX = (endTime - beats) * timeRatio;
            const topY = Y - NODE_HEIGHT / 2
            const topEndY = Y - NODE_HEIGHT / 2

            selectionManager.add({
                target: startNode,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY)
            selectionManager.add({
                target: endNode,
                left: endX - NODE_WIDTH,
                top: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, endX - NODE_WIDTH, topEndY + NODE_HEIGHT + 20)

            const selected = this.parentEditorSet.nodesSelection.has(startNode as any)

            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            } else {
                const gradient = context.createLinearGradient(startX, 0, endX, 0);
                gradient.addColorStop(0, rgb(...startValue));
                gradient.addColorStop(1, rgb(...endValue));
                const easing = startNode.easing;
                if (easing !== linearEasing) {
                    for (let i = 1; i < COLOR_INTERPOLATION_MAX_STOPS; i++) {
                        const pos = COLOR_INTERPOLATION_STEP * i;
                        const val: RGB = startValue.map((channel, i) => channel + easing.getValue(pos) * (endValue[i] - channel)) as RGB;
                        gradient.addColorStop(pos, rgb(...val));
                    }
                }
                context.strokeStyle = gradient;
            }


            startNode.drawCurve(context, startX, Y, endX, Y, identity);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT)
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if (previousEndNode.next.next.type === NodeType.TAIL) {
            const lastStart = previousEndNode.next;
            const startBeats = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const startX = (startBeats - beats) * timeRatio;
            const topY = Y - NODE_HEIGHT / 2;
            const selected = this.parentEditorSet.nodesSelection.has(lastStart as any)
            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            } else {
                context.strokeStyle = rgb(...startValue)
            }
            drawLine(context, startX, Y, width / 2, Y);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, Y - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            selectionManager.add({
                target: lastStart,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);
        }
    }
    changeTarget(line: JudgeLine, index: string) {
        const seq = line.extendedLayer.color;
        this.target = seq;
        
    }
    createTarget(line: JudgeLine) {
        const seq = editor.chart.createEventNodeSequence(EventType.color, `#${line.id}.ext.color`)
        this.target = seq;
        editor.operationList.do(new JudgeLineExtendENSChangeOperation(line, "color", seq));
        notify(`Created #${line.id}.ex.color, you can undo it.`);
    }

    

    paste() {
        EventCurveEditor.prototype.paste.call(this);
    }
    copy(): void {
        EventCurveEditor.prototype.copy.call(this);
    }
}
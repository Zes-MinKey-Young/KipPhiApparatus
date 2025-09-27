declare const VERSION = 180;
declare const VERSION_STRING = "1.8.0";
/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */
declare const DEFAULT_TEMPLATE_LENGTH = 16;
declare const easeOutElastic: (x: number) => number;
declare const easeOutBounce: (x: number) => number;
declare const easeOutExpo: (x: number) => number;
declare const easeOutBack: (x: number) => number;
declare const linear: (x: number) => number;
declare const linearLine: CurveDrawer;
declare const easeOutSine: (x: number) => number;
declare const easeInQuad: (x: number) => number;
declare const easeInCubic: (x: number) => number;
declare const easeInQuart: (x: number) => number;
declare const easeInQuint: (x: number) => number;
declare const easeInCirc: (x: number) => number;
declare function mirror(easeOut: (x: number) => number): (x: number) => number;
declare function toEaseInOut(easeIn: (x: number) => number, easeOut: (x: number) => number): (x: number) => number;
declare const easeOutQuad: (x: number) => number;
declare const easeInSine: (x: number) => number;
declare const easeOutQuart: (x: number) => number;
declare const easeOutCubic: (x: number) => number;
declare const easeOutQuint: (x: number) => number;
declare const easeOutCirc: (x: number) => number;
declare const easeInExpo: (x: number) => number;
declare const easeInElastic: (x: number) => number;
declare const easeInBounce: (x: number) => number;
declare const easeInBack: (x: number) => number;
declare const easeInOutSine: (x: number) => number;
declare const easeInOutQuad: (x: number) => number;
declare const easeInOutCubic: (x: number) => number;
declare const easeInOutQuart: (x: number) => number;
declare const easeInOutQuint: (x: number) => number;
declare const easeInOutExpo: (x: number) => number;
declare const easeInOutCirc: (x: number) => number;
declare const easeInOutBack: (x: number) => number;
declare const easeInOutElastic: (x: number) => number;
declare const easeInOutBounce: (x: number) => number;
declare const easingFnMap: {
    linear: ((x: number) => number)[];
    sine: ((x: number) => number)[];
    quad: ((x: number) => number)[];
    cubic: ((x: number) => number)[];
    quart: ((x: number) => number)[];
    quint: ((x: number) => number)[];
    expo: ((x: number) => number)[];
    circ: ((x: number) => number)[];
    back: ((x: number) => number)[];
    elastic: ((x: number) => number)[];
    bounce: ((x: number) => number)[];
};
/**
 * 缓动基类
 * Easings are used to describe the rate of change of a parameter over time.
 * They are used in events, curve note filling, etc.
 */
declare abstract class Easing {
    constructor();
    /**
     * 返回当前变化量与变化量之比
     * 或者当前数值。（参数方程）
     * @param t 一个0-1的浮点数，代表当前经过时间与总时间之比
     */
    abstract getValue(t: number): number;
    segmentedValueGetter(easingLeft: number, easingRight: number): (t: number) => number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
type TupleCoordinate = [number, number];
type CurveDrawer = (context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => void;
/**
 * @immutable
 */
declare class SegmentedEasing extends Easing {
    readonly easing: Easing;
    readonly left: number;
    readonly right: number;
    getter: (t: number) => number;
    constructor(easing: Easing, left: number, right: number);
    getValue(t: number): number;
    replace(easing: Easing): Easing;
}
/**
 * 普通缓动
 * See https://easings.net/zh-cn to learn about the basic types of easing.
 *
 */
declare class NormalEasing extends Easing {
    rpeId: number;
    id: number;
    funcType: string;
    easeType: string;
    _getValue: (t: number) => number;
    _drawCurve: CurveDrawer;
    constructor(fn: (t: number) => number);
    constructor(fn: (t: number) => number, curveDrawer?: CurveDrawer);
    getValue(t: number): number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
interface Coordinate {
    readonly x: number;
    readonly y: number;
}
/**
 * 贝塞尔曲线缓动
 * uses the Bezier curve formula to describe an easing.
 */
declare class BezierEasing extends Easing {
    cp1: Coordinate;
    cp2: Coordinate;
    constructor();
    getValue(t: number): number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
declare class TemplateEasing extends Easing {
    eventNodeSequence: EventNodeSequence;
    name: string;
    constructor(name: string, sequence: EventNodeSequence);
    getValue(t: number): number;
    get valueDelta(): number;
    get headValue(): number;
}
/**
 * 参数方程缓动
 * to implement an easing with a parametric equation.
 * RPE 亦有参数方程，但是它并不是作为缓动类型使用的；
 * RPE also has Parametric Equations, but it does not use it as an easing type;
 * 相反，RPE只是通过插值生成一个线性事件序列，是无法逆向的。
 * It instead just generate a sequence of linear events through interpolation, which is irreversible.
 * 这里在KPA中我们使用它作为缓动类型，以增加复用性。
 * Here in KPA we use it as an easing type, to increase reusability.
 * 在转换为RPEJSON前，都不需要对其进行分割。
 * We do not segment it until the chart is converted to an RPEJSON.
 */
declare class ParametricEquationEasing extends Easing {
    equation: string;
    _getValue: (x: number) => number;
    constructor(equation: string);
    getValue(t: number): number;
}
/**
 * 缓动库
 * 用于管理模板缓动
 * for template easing management
 * 谱面的一个属性
 * a property of chart
 * 加载谱面时，先加载事件序列，所需的模板缓动会被加入到缓动库，但并不立即实现，在读取模板缓动时，才实现缓动。
 * To load a chart, the eventNodeSquences will be first loaded, during which process
 * the easings will be added to the easing library but not implemented immediately.
 * They will be implemented when the template easings are read from data.
 *
 */
declare class TemplateEasingLib {
    easings: {
        [name: string]: TemplateEasing;
    };
    constructor();
    getOrNew(name: string): TemplateEasing;
    /**
     * 注册一个模板缓动，但不会实现它
     * register a template easing when reading eventNodeSequences, but does not implement it immediately
     */
    require(name: string): void;
    implement(name: string, sequence: EventNodeSequence): void;
    /**
     * 检查所有模板缓动是否实现
     * check if all easings are implemented
     * 应当在读取完所有模板缓动后调用
     * should be invoked after all template easings are read
     */
    check(): void;
    get(key: string): TemplateEasing | undefined;
    dump(eventNodeSequences: Set<EventNodeSequence>): CustomEasingData[];
}
declare const linearEasing: NormalEasing;
declare const fixedEasing: NormalEasing;
declare const easingMap: {
    fixed: {
        out: NormalEasing;
        in: NormalEasing;
        inout: NormalEasing;
    };
    linear: {
        out: NormalEasing;
        in: NormalEasing;
        inout: NormalEasing;
    };
    sine: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quad: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    cubic: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quart: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quint: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    expo: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    circ: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    back: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    elastic: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    bounce: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
};
/**
 * 按照KPA的编号
 */
declare const easingArray: NormalEasing[];
declare const rpeEasingArray: NormalEasing[];
declare const MIN_LENGTH = 128;
declare const MAX_LENGTH = 1024;
declare const MINOR_PARTS = 16;
type EndNextFn<T extends TwoDirectionNode> = (node: T) => [endBeats: number, next: T];
interface TwoDirectionNodeLike {
    next: this | null;
    previous: this | null;
    type: NodeType;
}
declare class JumpArray<T extends TwoDirectionNodeLike> {
    endNextFn: EndNextFn<T>;
    nextFn: (node: T, beats: number) => T | false;
    resolveLastNode: (node: T) => T;
    header: T;
    tailer: T;
    array: (T[] | T)[];
    averageBeats: number;
    effectiveBeats: number;
    goPrev: (node: T) => T;
    /**
     *
     * @param head 链表头
     * @param tail 链表尾
     * @param originalListLength
     * @param effectiveBeats 有效拍数（等同于音乐拍数）
     * @param endNextFn 接收一个节点，返回该节点分管区段拍数，并给出下个节点。若抵达尾部，返回[null, null]（停止遍历的条件是抵达尾部而不是得到null）
     * @param nextFn 接收一个节点，返回下个节点。如果应当停止，返回false。
     */
    constructor(head: T, tail: T, originalListLength: number, effectiveBeats: number, endNextFn: EndNextFn<T>, nextFn: (node: T, beats: number) => T | false, resolveLastNode?: (node: T) => T);
    updateEffectiveBeats(val: number): void;
    updateAverageBeats(): void;
    /**
     *
     * @param firstNode 不含
     * @param lastNode 含
     */
    updateRange(firstNode: T, lastNode: T): void;
    getPreviousOf(node: T, beats: number): T;
    /**
     *
     * @param beats 拍数
     * @ param usePrev 可选，若设为true，则在取到事件头部时会返回前一个事件（即视为左开右闭）
     * @returns 时间索引链表的节点，一般不是head
     */
    getNodeAt(beats: number): T;
}
/**
 * @author Zes M Young
 */
declare const NNLIST_Y_OFFSET_HALF_SPAN = 100;
declare const node2string: (node: AnyNN) => string;
declare const notePropTypes: {
    above: string;
    alpha: string;
    endTime: string[];
    isFake: string;
    positionX: string;
    size: string;
    speed: string;
    startTime: string[];
    type: string;
    visibleTime: string;
    visibleBeats: string;
    yOffset: string;
    tint: string[];
    tintHitEffects: string[];
    judgeSize: string;
};
/**
 * 音符
 * Basic element in music game.
 * Has 4 types: tap, drag, flick and hold.
 * Only hold has endTime; others' endTime is equal to startTime.
 * For this reason, holds are store in a special list (HNList),
 * which is sorted by both startTime and endTime,
 * so that they are accessed correctly and rapidly in the renderer.
 * Note that Hold and HoldNode are not individually-declared classes.
 * Hold is a note with type being NoteType.hold,
 * while HoldNode is a node that contains holds.
 */
declare class Note {
    above: boolean;
    alpha: number;
    endTime: [number, number, number];
    isFake: boolean;
    /** x coordinate in the judge line */
    positionX: number;
    size: number;
    speed: number;
    startTime: [number, number, number];
    type: NoteType;
    visibleTime: number;
    visibleBeats: number;
    yOffset: number;
    parentNode: NoteNode;
    tint: HEX;
    tintHitEffects: HEX;
    judgeSize: number;
    constructor(data: NoteDataRPE);
    static fromKPAJSON(data: NoteDataKPA, timeCalculator: TimeCalculator): Note;
    computeVisibleBeats(timeCalculator: TimeCalculator): void;
    /**
     *
     * @param offset
     * @returns
     */
    clone(offset: TimeT): Note;
    dumpRPE(timeCalculator: TimeCalculator): NoteDataRPE;
    dumpKPA(): NoteDataKPA;
}
type Connectee = NoteNode | NNNode;
declare const enum NodeType {
    HEAD = 0,
    TAIL = 1,
    MIDDLE = 2
}
type NNOrHead = NoteNode | NoteNodeLike<NodeType.HEAD>;
type NNOrTail = NoteNode | NoteNodeLike<NodeType.TAIL>;
type AnyNN = NoteNode | NoteNodeLike<NodeType.HEAD> | NoteNodeLike<NodeType.TAIL>;
declare class NoteNodeLike<T extends NodeType> {
    type: T;
    next: NNOrTail;
    _previous: WeakRef<NNOrHead> | null;
    parentSeq: NNList;
    get previous(): NNOrHead;
    set previous(val: NNOrHead);
    constructor(type: T);
}
declare class NoteNode extends NoteNodeLike<NodeType.MIDDLE> implements TwoDirectionNode {
    totalNode: NNNode;
    readonly startTime: TimeT;
    /**
     * The notes it contains.
     * If they are holds, they are ordered by their endTime, from late to early.
     */
    readonly notes: Note[];
    parentSeq: NNList;
    chart: Chart;
    private static count;
    id: number;
    constructor(time: TimeT);
    static fromKPAJSON(data: NoteNodeDataKPA, timeCalculator: TimeCalculator): NoteNode;
    get isHold(): boolean;
    get endTime(): TimeT;
    add(note: Note): void;
    sort(note: Note): void;
    /**
     * 其他部分均已有序，通过冒泡排序把发生变更的NoteNode移动到正确的位置
     * @param index 待排序的Note的索引
     */
    sort(index: number): void;
    remove(note: Note): void;
    static disconnect(note1: NNOrHead, note2: NNOrTail): void;
    static connect(note1: NNOrHead, note2: NNOrTail): void;
    static insert(note1: NNOrHead, inserted: NoteNode, note2: NNOrTail): void;
    dump(): NoteNodeDataKPA;
}
declare class NNList {
    speed: number;
    medianYOffset: number;
    /** 格式为#xxoxx或$xxoxx，亦可自命名 */
    id: string;
    head: NoteNodeLike<NodeType.HEAD>;
    tail: NoteNodeLike<NodeType.TAIL>;
    currentPoint: NNOrHead;
    /** 定位上个Note头已过，本身未到的Note */
    jump: JumpArray<AnyNN>;
    timesWithNotes: number;
    timeRanges: [number, number][];
    effectiveBeats: number;
    parentLine: JudgeLine;
    constructor(speed: number, medianYOffset?: number, effectiveBeats?: number);
    /** 此方法永远用于最新KPAJSON */
    static fromKPAJSON<T extends boolean>(isHold: T, effectiveBeats: number, data: NNListDataKPA, nnnList: NNNList, timeCalculator: TimeCalculator): T extends true ? HNList : NNList;
    initJump(): void;
    /**
     *
     * @param beats 目标位置
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Node，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns
     */
    getNodeAt(beats: number, beforeEnd?: boolean): NNOrTail;
    /**
     * Get or create a node of given time
     * @param time
     * @returns
     */
    getNodeOf(time: TimeT): NoteNode;
    dumpKPA(): NNListDataKPA;
    getNodesFromOneAndRangeRight(node: NoteNode, rangeRight: TimeT): NoteNode[];
    getNodesAfterOne(node: NoteNode): NoteNode[];
    clearEmptyNodes(updatesJump?: boolean): void;
}
/**
 * HoldNode的链表
 * HN is the abbreviation of HoldNode, which is not individually declared.
 * A NN that contains holds (a type of note) is a HN.
 */
declare class HNList extends NNList {
    /**
     * 最早的还未结束Hold
     */
    holdTailJump: JumpArray<AnyNN>;
    constructor(speed: number, medianYOffset: number, effectiveBeats?: number);
    initJump(): void;
    getNodeAt(beats: number, beforeEnd?: boolean): NNOrTail;
    insertNoteJumpUpdater(note: NoteNode): () => void;
}
type NNNOrHead = NNNode | NNNodeLike<NodeType.HEAD>;
type NNNOrTail = NNNode | NNNodeLike<NodeType.TAIL>;
type AnyNNN = NNNode | NNNodeLike<NodeType.HEAD> | NNNodeLike<NodeType.TAIL>;
declare class NNNodeLike<T extends NodeType> {
    type: T;
    previous: NNNOrHead;
    next: NNNOrTail;
    startTime: TimeT;
    constructor(type: T);
}
declare class NNNode extends NNNodeLike<NodeType.MIDDLE> implements TwoDirectionNode {
    readonly noteNodes: NoteNode[];
    readonly holdNodes: NoteNode[];
    readonly startTime: TimeT;
    noteOfType: [number, number, number, number];
    constructor(time: TimeT);
    get endTime(): TimeT;
    add(node: NoteNode): void;
    static connect(note1: NNNOrHead, note2: NNNOrTail): void;
    static insert(note1: NNNOrHead, inserted: NNNode, note2: NNNOrTail): void;
}
/**
 * 二级音符节点链表
 * contains NNNs
 * NNN is the abbreviation of NoteNodeNode, which store note (an element in music game) nodes with same startTime
 * NN is the abbreviation of NoteNode, which stores the notes with the same startTime.
 */
declare class NNNList {
    jump: JumpArray<AnyNNN>;
    parentChart: Chart;
    head: NNNodeLike<NodeType.HEAD>;
    tail: NNNodeLike<NodeType.TAIL>;
    effectiveBeats: number;
    timesWithNotes: number;
    constructor(effectiveBeats: number);
    initJump(): void;
    getNodeAt(beats: number, beforeEnd?: boolean): NNNode | NNNodeLike<NodeType.TAIL>;
    getNode(time: TimeT): NNNode;
    addNoteNode(noteNode: NoteNode): void;
}
type ValueTypeOfEventType<T extends EventType> = [number, number, number, number, number, number, number, number, number, string, RGB][T];
/**
 * 奇谱发生器使用中心来表示一个NNList的y值偏移范围，这个函数根据yOffset算出对应中心值
 * @param yOffset
 * @returns
 */
declare const getRangeMedian: (yOffset: number) => number;
declare class JudgeLine {
    texture: string;
    group: JudgeLineGroup;
    cover: boolean;
    hnLists: Map<string, HNList>;
    nnLists: Map<string, NNList>;
    eventLayers: EventLayer[];
    extendedLayer: ExtendedLayer;
    father: JudgeLine;
    children: Set<JudgeLine>;
    moveX: number;
    moveY: number;
    rotate: number;
    alpha: number;
    transformedX: number;
    transformedY: number;
    optimized: boolean;
    zOrder: number;
    anchor: [number, number];
    hasAttachUI: boolean;
    /**
     * 每帧渲染时所用的变换矩阵，缓存下来用于之后的UI绑定渲染
     */
    renderMatrix: Matrix;
    rotatesWithFather: boolean;
    id: number;
    name: string;
    readonly chart: Chart;
    constructor(chart: Chart);
    static fromRPEJSON(chart: Chart, id: number, data: JudgeLineDataRPE, templates: TemplateEasingLib, timeCalculator: TimeCalculator): JudgeLine;
    static fromKPAJSON(isOld: boolean, chart: Chart, id: number, data: JudgeLineDataKPA, templates: TemplateEasingLib, timeCalculator: TimeCalculator): JudgeLine;
    getNNListFromOldKPAJSON(lists: Map<string, NNList>, namePrefix: string, isHold: boolean, effectiveBeats: number, listData: NNListDataKPA, nnnList: NNNList, timeCalculator: TimeCalculator): void;
    getLayer(index: "0" | "1" | "2" | "3" | "ex"): EventLayer | ExtendedLayer;
    updateSpeedIntegralFrom(beats: number, timeCalculator: TimeCalculator): void;
    /**
     * startY and endY must not be negative
     * @param beats
     * @param timeCalculator
     * @param startY
     * @param endY
     * @returns
     */
    computeTimeRange(beats: number, timeCalculator: TimeCalculator, startY: number, endY: number): [number, number][];
    /**
     *
     * @param beats
     * @param usePrev 如果取到节点，将使用EndNode的值。默认为FALSE
     * @returns
     */
    getValues(beats: number, usePrev?: boolean): [x: number, y: number, theta: number, alpha: number];
    getMatrix(beats: number, usePrev?: boolean): void;
    getStackedValue(type: keyof EventLayer, beats: number, usePrev?: boolean): number;
    getStackedIntegral(beats: number, timeCalculator: TimeCalculator): number;
    /**
     * 获取对应速度和类型的Note树,没有则创建
     */
    getNNList(speed: number, yOffset: number, isHold: boolean, initsJump: boolean): NNList;
    getNode(note: Note, initsJump: boolean): NoteNode;
    /**
     *
     * @param eventNodeSequences To Collect the sequences used in this line
     * @returns
     */
    dumpKPA(eventNodeSequences: Set<EventNodeSequence<any>>, judgeLineGroups: JudgeLineGroup[]): JudgeLineDataKPA;
    updateEffectiveBeats(EB: number): void;
    static checkinterdependency(judgeLine: JudgeLine, toBeFather: JudgeLine): boolean;
}
declare enum EventType {
    moveX = 0,
    moveY = 1,
    rotate = 2,
    alpha = 3,
    speed = 4,
    easing = 5,
    bpm = 6,
    scaleX = 7,
    scaleY = 8,
    text = 9,
    color = 10
}
declare enum NoteType {
    tap = 1,
    drag = 4,
    flick = 3,
    hold = 2
}
type BasicEventName = "moveX" | "moveY" | "rotate" | "alpha" | "speed";
interface EventLayer {
    moveX?: EventNodeSequence;
    moveY?: EventNodeSequence;
    rotate?: EventNodeSequence;
    alpha?: EventNodeSequence;
    speed?: EventNodeSequence;
}
interface ExtendedLayer {
    scaleX?: EventNodeSequence;
    scaleY?: EventNodeSequence;
    text?: EventNodeSequence<string>;
    color?: EventNodeSequence<RGB>;
}
type Plain<T> = {
    [k: string]: T;
};
/**
 * 相当于 Python 推导式
 * @param arr
 * @param expr
 * @param guard
 * @returns
 */
declare function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => boolean): RT[];
/**
 * 相当于 Python 推导式
 * @param obj
 * @param expr
 * @param guard
 * @returns
 */
declare function dictForIn<T, RT>(obj: Plain<T>, expr: (v: T) => RT, guard?: (v: T) => boolean): Plain<RT>;
type UIName = "combo" | "combonumber" | "score" | "pause" | "bar" | "name" | "level";
declare class Chart {
    judgeLines: JudgeLine[];
    bpmList: BPMSegmentData[];
    timeCalculator: TimeCalculator;
    orphanLines: JudgeLine[];
    name: string;
    level: string;
    composer: string;
    charter: string;
    illustrator: string;
    offset: number;
    templateEasingLib: TemplateEasingLib;
    sequenceMap: Map<string, EventNodeSequence<any>>;
    effectiveBeats: number;
    nnnList: NNNList;
    /**  */
    judgeLineGroups: JudgeLineGroup[];
    duration: number;
    chartingTime: number;
    rpeChartingTime: number;
    modified: boolean;
    maxCombo: number;
    pauseAttach: JudgeLine | null;
    combonumberAttach: JudgeLine | null;
    comboAttach: JudgeLine | null;
    barAttach: JudgeLine | null;
    scoreAttach: JudgeLine | null;
    nameAttach: JudgeLine | null;
    levelAttach: JudgeLine | null;
    constructor();
    getEffectiveBeats(): number;
    static fromRPEJSON(data: ChartDataRPE, duration: number): Chart;
    static fromKPAJSON(data: ChartDataKPA): Chart;
    updateCalculator(): void;
    updateEffectiveBeats(duration: number): void;
    dumpKPA(): Required<ChartDataKPA>;
    createNNNode(time: TimeT): NNNode;
    createEventNodeSequence<T extends EventType>(type: T, name: string): EventNodeSequence<ValueTypeOfEventType<T>>;
    countMaxCombo(): void;
    attachUIToLine(ui: UIName, judgeLine: JudgeLine): void;
    detachUI(ui: UIName): void;
    queryJudgeLineUI(judgeLine: JudgeLine): UIName[];
    scanAllTextures(): Set<string>;
}
declare class JudgeLineGroup {
    name: string;
    judgeLines: JudgeLine[];
    constructor(name: string);
    add(judgeLine: JudgeLine): void;
    remove(judgeLine: JudgeLine): void;
    isDefault(): boolean;
}
/**
 * To compare two arrays
 * @param arr1
 * @param arr2
 * @returns
 */
declare function arrEq<T>(arr1: Array<T>, arr2: Array<T>): boolean;
declare class EventNodeLike<T extends NodeType, VT = number> {
    type: T;
    /** 后一个事件节点 */
    next: [EventStartNode<VT>, null, ENOrTail<VT>][T] | null;
    /** 前一个事件节点 */
    previous: [null, EventStartNode<VT>, ENOrHead<VT>][T] | null;
    parentSeq: EventNodeSequence<VT>;
    constructor(type: T);
}
type ENOrTail<VT = number> = EventNode<VT> | EventNodeLike<NodeType.TAIL, VT>;
type ENOrHead<VT = number> = EventNode<VT> | EventNodeLike<NodeType.HEAD, VT>;
type AnyEN<VT = number> = EventNode<VT> | EventNodeLike<NodeType.HEAD, VT> | EventNodeLike<NodeType.TAIL, VT>;
type EvSoE<VT = number> = EventEndNode<VT> | EventStartNode<VT>;
/**
 * 事件节点基类
 * event node.
 * 用于代表事件的开始和结束。（EventStartNode表开始，EventEndNode表结束）
 * Used to represent the starts (EventStartNode) and ends (EventEndNode) of events.
 * 事件指的是判定线在某个时间段上的状态变化。
 * Events is the changing of judge line's state in a certain time.
 * 五种事件类型：移动X，移动Y，旋转，透明度，速度。
 * 5 basic types of events: moveX, moveY, rotate, alpha, speed.
 * 事件节点没有类型，类型由它所属的序列决定。
 * Type is not event nodes' property; it is the property of EventNodeSequence.
 * Events' type is determined by which sequence it belongs to.
 * 与RPE不同的是，KPA使用两个节点来表示一个事件，而不是一个对象。
 * Different from that in RPE, KPA uses two nodes rather than one object to represent an event.
 */
declare abstract class EventNode<VT = number> extends EventNodeLike<NodeType.MIDDLE, VT> {
    time: TimeT;
    value: VT;
    easing: Easing;
    constructor(time: TimeT, value: VT);
    clone(offset: TimeT): EventStartNode<VT> | EventEndNode<VT>;
    /**
     * gets the easing object from RPEEventData
     * @param data
     * @param left
     * @param right
     * @param templates
     * @returns
     */
    static getEasing(data: EventDataKPA<any>, left: number, right: number, templates: TemplateEasingLib): Easing;
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data
     * @param templates
     * @returns
     */
    static fromEvent<VT extends RGB | number>(data: EventDataRPELike<VT>, templates: TemplateEasingLib): [EventStartNode<VT>, EventEndNode<VT>];
    static fromTextEvent(data: EventDataRPELike<string>, templates: TemplateEasingLib): [EventStartNode<string>, EventEndNode<string>];
    static connect<VT>(node1: EventStartNode<VT>, node2: EventEndNode<VT> | EventNodeLike<NodeType.TAIL, VT>): void;
    static connect<VT>(node1: EventEndNode<VT> | EventNodeLike<NodeType.HEAD, VT>, node2: EventStartNode<VT>): void;
    /**
     *
     * @param endNode
     * @param startNode
     * @returns 应该在何范围内更新跳数组
     */
    static removeNodePair<VT>(endNode: EventEndNode<VT>, startNode: EventStartNode<VT>): [EventStartNode<VT> | EventNodeLike<NodeType.HEAD, VT>, EventStartNode<VT> | EventNodeLike<NodeType.TAIL, VT>];
    static insert<VT>(node: EventStartNode<VT>, tarPrev: EventStartNode<VT>): [EventNodeLike<NodeType.HEAD, VT> | EventStartNode<VT>, EventStartNode<VT> | EventNodeLike<NodeType.TAIL, VT>];
    /**
     *
     * @param node
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart<VT>(node: EventStartNode<VT>): EventStartNode<VT> | EventNodeLike<NodeType.TAIL, VT>;
    /**
     *
     * @param node
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd<VT>(node: EventEndNode<VT> | EventNodeLike<NodeType.TAIL, VT>): EventNodeLike<NodeType.TAIL, VT> | EventStartNode<VT>;
    static previousStartOfStart<VT>(node: EventStartNode<VT>): EventStartNode<VT> | EventNodeLike<NodeType.HEAD, VT>;
    /**
     * It does not return the start node which form an event with it.
     * @param node
     * @returns
     */
    static secondPreviousStartOfEnd<VT>(node: EventEndNode<VT>): EventStartNode<VT> | EventNodeLike<NodeType.HEAD, VT>;
    static nextStartInJumpArray<VT>(node: EventStartNode<VT>): EventStartNode<VT> | EventNodeLike<NodeType.TAIL, VT>;
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node
     * @returns
     */
    static getEndStart<VT>(node: EventStartNode<VT> | EventEndNode<VT>): [EventEndNode<VT>, EventStartNode<VT>];
    static getStartEnd<VT>(node: EventStartNode<VT> | EventEndNode<VT>): [EventStartNode<VT>, EventEndNode<VT>];
    static setToNewOrderedArray<VT>(dest: TimeT, set: Set<EventStartNode<VT>>): [EventStartNode<VT>[], EventStartNode<VT>[]];
    static belongToSequence(nodes: Set<EventStartNode>, sequence: EventNodeSequence): boolean;
    /**
     * 检验这些节点对是不是连续的
     * 如果不是不能封装为模板缓动
     * @param nodes 有序开始节点数组，必须都是带结束节点的（背靠背）（第一个除外）
     * @returns
     */
    static isContinuous(nodes: EventStartNode[]): boolean;
    get innerEasing(): Easing;
    /**
     * 设置easing，如果easing是分段缓动，则将分段缓动中的easing设置为innerEasing
     * 不可传入分段缓动，否则会出错
     */
    set innerEasing(easing: Exclude<Easing, SegmentedEasing>);
}
declare const getValueFns: readonly [(current: number, timeDelta: number, value: number, nextVal: number, easing: Easing) => number, (current: number, timeDelta: number, value: string, nextVal: string, easing: Easing, interpretedAs: InterpreteAs) => string, (current: number, timeDelta: number, value: RGB, nextValue: RGB, easing: Easing) => number[]];
declare enum InterpreteAs {
    str = 0,
    int = 1,
    float = 2
}
declare class EventStartNode<VT = number> extends EventNode<VT> {
    next: EventEndNode<VT> | EventNodeLike<NodeType.TAIL, VT>;
    previous: EventEndNode<VT> | EventNodeLike<NodeType.HEAD, VT>;
    /**
     * 对于速度事件，从计算时的时刻到此节点的总积分
     */
    cachedIntegral?: number;
    constructor(time: TimeT, value: VT);
    get easingIsSegmented(): boolean;
    parentSeq: EventNodeSequence<VT>;
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns
     */
    dump(): EventDataKPA<VT>;
    /**
     * 产生一个一拍长的短钩定事件
     * 仅用于编译至RPE时解决最后一个StartNode的问题
     * 限最后一个StartNode使用
     * @returns
     */
    dumpAsLast(): EventDataRPELike<VT>;
    interpretedAs: InterpreteAs;
    getValueAt(beats: number): VT;
    private getValueFn;
    getSpeedValueAt(this: EventStartNode<number>, beats: number): number;
    /**
     * 积分获取位移
     */
    getIntegral(this: EventStartNode<number>, beats: number, timeCalculator: TimeCalculator): number;
    getFullIntegral(this: EventStartNode<number>, timeCalculator: TimeCalculator): number;
    isFirstStart(): boolean;
    isLastStart(): boolean;
    clone(offset?: TimeT): EventStartNode<VT>;
    clonePair(offset: TimeT): EventStartNode<VT>;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, matrix: Matrix): void;
}
declare class EventEndNode<VT = number> extends EventNode<VT> {
    next: EventStartNode<VT>;
    previous: EventStartNode<VT>;
    get parentSeq(): EventNodeSequence<VT>;
    set parentSeq(_parent: EventNodeSequence<VT>);
    constructor(time: TimeT, value: VT);
    getValueAt(beats: number): VT;
    clone(offset?: TimeT): EventEndNode<VT>;
}
/**
 * 为一个链表结构。会有一个数组进行快跳。
 * is the list of event nodes, but not purely start nodes.
 * 结构如下：Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * The structure is like this: Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * 用括号标出的两个节点是一个事件，用方括号标出的两个节点是同一时间点的节点。
 * The each 2 nodes marked by parentheses is an event; the each 2 nodes marked by brackets have the same time.
 * 注意尾节点之前的节点不是一个结束节点，而是一个开始节点，其缓动无效。
 * Note that the node before the tailer is not an end node, but a start node whose easing is meaningless.
 * 就是说最后一个节点后取值，显然会取得这个节点的值，与缓动无关。
 * (i. e. the value after the last event node is its value, not subject to easing, obviously.)
 * 如果尾之前的节点是一个结束节点，那么取值会返回undefined，这是不期望的。
 * If so, the value after that will be undefined, which is not expected.
 * ("so" refers to the assumption that the node before the tailer is an end node)
 * 和NNList和NNNList一样，有跳数组以加速随机读取。
 * Like NNList and NNNList, it has a jump array to speed up random reading.
 * 插入或删除节点时，需要更新跳数组。
 * Remember to update the jump array when inserting or deleting nodes.
 */
declare class EventNodeSequence<VT = number> {
    type: EventType;
    effectiveBeats: number;
    chart: Chart;
    /** id follows the format `#${lineid}.${layerid}.${typename}` by default */
    id: string;
    /** has no time or value */
    head: EventNodeLike<NodeType.HEAD, VT>;
    /** has no time or value */
    tail: EventNodeLike<NodeType.TAIL, VT>;
    jump?: JumpArray<AnyEN<VT>>;
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    constructor(type: EventType, effectiveBeats: number);
    static getDefaultValueFromEventType(type: EventType): number[] | 0 | "" | 1 | 10;
    static fromRPEJSON<T extends EventType, VT = number>(type: T, data: EventDataRPELike<VT>[], chart: Chart, endValue?: number): EventNodeSequence<VT>;
    /**
     * 生成一个新的事件节点序列，仅拥有一个节点。
     * 需要分配ID！！！！！！
     * @param type
     * @param effectiveBeats
     * @returns
     */
    static newSeq<T extends EventType>(type: T, effectiveBeats: number): EventNodeSequence<ValueTypeOfEventType<T>>;
    /** validate() {
        /*
         * 奇谱发生器中事件都是首尾相连的
         //
        const length = this.endNodes.length;
        for (let index = 0; index < length; index++) {
            let end = this.endNodes[index];
            let start = this.startNodes[index + 1]
            if (!arrEq(end.time, start.time)) {
                start.time = end.time
            }
            start.previous = end;
            end.next = start;
            // 这个就是真的该这么写了（
        }
    }
    **/
    initJump(): void;
    updateJump(from: ENOrHead<VT>, to: ENOrTail<VT>): void;
    insert(): void;
    getNodeAt(beats: number, usePrev?: boolean): EventStartNode<VT>;
    getValueAt(beats: number, usePrev?: boolean): VT;
    getIntegral(this: EventNodeSequence<number>, beats: number, timeCalculator: TimeCalculator): number;
    updateNodesIntegralFrom(this: EventNodeSequence<number>, beats: number, timeCalculator: TimeCalculator): void;
    dump(): EventNodeSequenceDataKPA<VT>;
    getNodesFromOneAndRangeRight(node: EventStartNode<VT>, rangeRight: TimeT): any[];
    getNodesAfterOne(node: EventStartNode<VT>): any[];
}
/**
 *
 */
declare class BPMStartNode extends EventStartNode {
    spb: number;
    cachedStartIntegral?: number;
    cachedIntegral?: number;
    next: BPMEndNode | BPMNodeLike<NodeType.TAIL>;
    previous: BPMEndNode | BPMNodeLike<NodeType.HEAD>;
    constructor(startTime: TimeT, bpm: number);
    getIntegral(beats: number): number;
    /**
     * may only used with a startnode whose next is not tail
     * @returns
     */
    getFullIntegral(): number;
}
declare class BPMEndNode extends EventEndNode {
    spb: number;
    previous: BPMStartNode;
    next: BPMStartNode;
    constructor(endTime: TimeT);
    get value(): number;
    set value(val: number);
}
interface BPMNodeLike<T extends NodeType> extends EventNodeLike<T> {
    next: [BPMStartNode, null, BNOrTail][T] | null;
    previous: [null, BPMStartNode, BNOrHead][T] | null;
}
type BPMNode = BPMStartNode | BPMEndNode;
type AnyBN = (BPMNode | BPMNodeLike<NodeType.TAIL> | BPMNodeLike<NodeType.HEAD>);
type BNOrTail = BPMNode | BPMNodeLike<NodeType.TAIL>;
type BNOrHead = BPMNode | BPMNodeLike<NodeType.HEAD>;
/**
 * 拥有与事件类似的逻辑
 * 每对节点之间代表一个BPM相同的片段
 * 片段之间BPM可以发生改变
 */
declare class BPMSequence extends EventNodeSequence {
    duration: number;
    head: BPMNodeLike<NodeType.HEAD>;
    tail: BPMNodeLike<NodeType.TAIL>;
    /** 从拍数访问节点 */
    jump: JumpArray<AnyEN>;
    /** 以秒计时的跳数组，处理从秒访问节点 */
    secondJump: JumpArray<AnyBN>;
    constructor(bpmList: BPMSegmentData[], duration: number);
    initJump(): void;
    updateSecondJump(): void;
    updateJump(from: ENOrHead, to: ENOrTail): void;
    getNodeBySeconds(seconds: number): BPMStartNode;
    dumpBPM(): BPMSegmentData[];
}
/**
 * @alias TC
 */
declare class TimeCalculator {
    bpmList: BPMSegmentData[];
    bpmSequence: BPMSequence;
    duration: number;
    constructor();
    update(): void;
    toSeconds(beats: number): number;
    segmentToSeconds(beats1: number, beats2: number): number;
    secondsToBeats(seconds: number): number;
    static toBeats(beaT: TimeT): number;
    static getDelta(beaT1: TimeT, beaT2: TimeT): number;
    static eq(beaT1: TimeT, beaT2: TimeT): boolean;
    static gt(beaT1: TimeT, beaT2: TimeT): boolean;
    static lt(beaT1: TimeT, beaT2: TimeT): boolean;
    static ne(beaT1: TimeT, beaT2: TimeT): boolean;
    static add(beaT1: TimeT, beaT2: TimeT): TimeT;
    static sub(beaT1: TimeT, beaT2: TimeT): TimeT;
    static div(beaT1: TimeT, beaT2: TimeT): [number, number];
    static mul(beaT: TimeT, ratio: [number, number]): TimeT;
    /**
     * 原地规范化时间元组，但仍然返回这个元组，方便使用
     * validate TimeT in place
     * @param beaT
     */
    static validateIp(beaT: TimeT): TimeT;
    static vadd(beaT1: TimeT, beaT2: TimeT): TimeT;
    static vsub(beaT1: TimeT, beaT2: TimeT): TimeT;
    static vmul(beaT: TimeT, ratio: [number, number]): TimeT;
    static gcd(a: number, b: number): number;
    dump(): BPMSegmentData[];
}
declare const TC: typeof TimeCalculator;
declare const LONG_PRESS_THRESHOLD_MS = 400;
type CSSStyleName = Exclude<keyof CSSStyleDeclaration, "length" | "parentRule" | "item" | "getPropertyValue" | "getPropertyPriority" | "setProperty" | "removeProperty">;
type HTMLElementTagName = keyof HTMLElementTagNameMap;
/**
 * Z is just like jQuery, but it's much simpler.
 * It only contains one element, which is enough in most cases.
 * In contrast, jQuery can contain multiple elements, which makes the type inference miserable sometimes.
 * When you need to create a new element, unlike jQuery, you do not need to wrap the tag name with <>.
 * just use $("div"), for example.
 * The type parameter is the tagname instead of the class of the element,
 * which settles the problem that in jQuery the editor does not infer $("<tagName>") as a specific HTMLElement Type.
 * For example, $("<input>") in jQuery cannot be directly inferred as JQuery<HTMLInputElement>.
 * But $("input") in Z is obviously inferred as Z<"input">.
 * Supports chaining, like jQuery.
 */
declare class Z<K extends HTMLElementTagName> extends EventTarget {
    element: HTMLElementTagNameMap[K];
    registered: boolean;
    get parent(): Z<keyof HTMLElementTagNameMap>;
    constructor(type: K, newElement?: boolean);
    bindHandlers(): void;
    get clientWidth(): number;
    get clientHeight(): number;
    html(str: string): this;
    text(str: string): this;
    addClass(...classes: string[]): this;
    removeClass(...classes: string[]): void;
    release(): HTMLElementTagNameMap[K];
    attr(name: string): string;
    attr(name: string, value: string): this;
    css(name: CSSStyleName, value: string): this;
    append(...$elements: (Z<any> | HTMLElement)[]): this;
    after($e: Z<keyof HTMLElementTagNameMap>): void;
    before($e: Z<keyof HTMLElementTagNameMap>): void;
    insertAfter($e: Z<keyof HTMLElementTagNameMap>): void;
    insertBefore($e: Z<keyof HTMLElementTagNameMap>): void;
    appendTo(element: HTMLElement | Z<keyof HTMLElementTagNameMap>): this;
    onClick(callback: (e: Event) => any): this;
    onInput(callback: (e: Event) => any): this;
    /**
     * 用于绑定元素原生事件
     * @param eventType
     * @param callback
     * @returns
     */
    on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    show(): void;
    hide(): void;
    remove(): void;
    static from<K extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[K]): Z<K>;
    appendMass(callback: () => void): this;
    isFocused(): boolean;
    whenShortPressed(callback: (e: TouchOrMouseEvent) => any): this;
    whenLongPressed(callback: (e: TouchOrMouseEvent) => any): this;
}
declare const $: <K extends keyof HTMLElementTagNameMap>(strOrEle: K | HTMLElementTagNameMap[K]) => Z<K>;
type CommonPart<T, U> = {
    [K in keyof T & keyof U]: T[K] extends U[K] ? T[K] : never;
};
type ITouchOrMouseEvent = CommonPart<MouseEvent, TouchEvent>;
declare class TouchOrMouseEvent extends Event implements ITouchOrMouseEvent {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    detail: any;
    which: any;
    initUIEvent(): void;
    view: any;
    constructor(type: string, eventInitDict?: Partial<CommonPart<MouseEventInit, TouchEventInit>>);
}
interface ZButtonEventMap {
    "longpress": TouchOrMouseEvent;
    "shortpress": TouchOrMouseEvent;
}
declare class ZButton extends Z<"div"> {
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    constructor(text: string);
    onClick(callback: (e: Event) => any): this;
    whenShortPressed(callback: (e: TouchOrMouseEvent) => any): this;
    whenLongPressed(callback: (e: TouchOrMouseEvent) => any): this;
}
declare class ZSwitch extends ZButton {
    innerText: string;
    checkedText?: string;
    get checked(): boolean;
    set checked(val: boolean);
    constructor(innerText: string, checkedText?: string);
    whenClickChange(callback: (checked: boolean, e: Event) => any): this;
    setAsChecked(): this;
}
declare class ZValueChangeEvent extends Event {
    constructor();
}
declare class ZInputBox extends Z<"input"> {
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    constructor(defaultValue?: string);
    getValue(): string;
    lastInt: number;
    lastNum: number;
    getInt(): number;
    getNum(): number;
    setValue(val: string): this;
    private _lastValue;
    whenValueChange(callback: (content: string, e: Event) => any): this;
}
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
declare class ZArrowInputBox extends Z<"div"> {
    scale: number;
    $up: Z<"div">;
    $down: Z<"div">;
    $input: ZInputBox;
    constructor(defaultValue?: number);
    getValue(): number;
    setValue(val: number): this;
    whenValueChange(callback: (content: number, e: Event) => any): this;
}
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
declare class ZFractionInput extends Z<"span"> {
    $int: ZInputBox;
    $nume: ZInputBox;
    $deno: ZInputBox;
    constructor();
    getValue(): TimeT;
    setValue(time: TimeT): this;
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    onChange(callback: (result: TimeT) => void): void;
}
declare class BoxOption {
    onChangedTo?: (option: BoxOption) => void;
    onChanged?: (option: BoxOption) => void;
    $elementMap: Map<ZDropdownOptionBox, Z<"div">>;
    text: string;
    constructor(text: string, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void);
    getElement(box: ZDropdownOptionBox): Z<"div">;
}
declare class EditableBoxOption extends BoxOption {
    editsItself: boolean;
    onEdited: (option: BoxOption, text: string) => void;
    constructor(text: string, onEdited: (option: BoxOption, text: string) => void, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void, editsItself?: boolean);
    edit(text: string): void;
}
declare class ZDropdownOptionBox extends Z<"div"> {
    readonly options: BoxOption[];
    _value: BoxOption;
    $optionList: Z<"div">;
    get value(): BoxOption;
    set value(option: BoxOption);
    $value: Z<"div">;
    constructor(options: BoxOption[], up?: boolean);
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    whenValueChange(callback: (val: string) => any): this;
    appendOption(option: BoxOption): this;
    replaceWithOptions(options: BoxOption[]): this;
}
declare class ZEditableDropdownOptionBox extends Z<"div"> {
    $optionList: Z<"div">;
    readonly options: EditableBoxOption[];
    _value: EditableBoxOption;
    get value(): EditableBoxOption | undefined;
    set value(option: EditableBoxOption | undefined);
    $value: ZInputBox;
    /**
     *
     * @param options
     * @param up determine whether the dropdown is up or down
     */
    constructor(options: EditableBoxOption[], up?: boolean);
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    whenValueChange(callback: (val: string) => any): this;
    appendOption(option: EditableBoxOption): this;
    replaceWithOptions(options: EditableBoxOption[]): this;
}
declare class ZSearchBox extends Z<"div"> {
    count: number;
    readonly $value: ZInputBox;
    readonly $options: Z<"div">;
    lastFocusOutTime: number;
    constructor(searchable: (s: string) => (string[] | Promise<string[]>), up?: boolean);
    replaceWithOptions(strings: string[]): void;
    get value(): string;
    set value(value: string);
    whenValueChange(callback: (value: string, e: Event) => void): void;
    private _disabled;
    get disabled(): boolean;
    set disabled(disabled: boolean);
    wasInputing(): boolean;
}
declare class ZMemorableBox extends ZSearchBox {
    history: string[];
    maxHistory: number;
    constructor(options: string[], up?: boolean);
}
declare namespace EasingOptions {
    const IN: BoxOption;
    const OUT: BoxOption;
    const IO: BoxOption;
    const easeTypeOptions: BoxOption[];
    const easeTypeOptionsMapping: {
        in: BoxOption;
        out: BoxOption;
        inout: BoxOption;
    };
    const FIXED: BoxOption;
    const LINEAR: BoxOption;
    const SINE: BoxOption;
    const QUAD: BoxOption;
    const CUBIC: BoxOption;
    const QUART: BoxOption;
    const QUINT: BoxOption;
    const EXPO: BoxOption;
    const CIRC: BoxOption;
    const BACK: BoxOption;
    const ELASTIC: BoxOption;
    const BOUNCE: BoxOption;
    const funcTypeOptions: BoxOption[];
    const funcTypeOptionsMapping: {
        fixed: BoxOption;
        linear: BoxOption;
        sine: BoxOption;
        quad: BoxOption;
        cubic: BoxOption;
        quart: BoxOption;
        quint: BoxOption;
        expo: BoxOption;
        circ: BoxOption;
        back: BoxOption;
        elastic: BoxOption;
        bounce: BoxOption;
    };
}
/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
declare class ZEasingBox extends Z<"div"> {
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    value: number;
    constructor(dropdownUp?: boolean);
    update(): void;
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing: NormalEasing): void;
    onChange(callback: (value: number) => void): this;
}
declare class ZRadioBox extends Z<"div"> {
    $inputs: Z<"input">[];
    selectedIndex: number;
    _disabledIndexes: number[];
    get disabledIndexes(): number[];
    set disabledIndexes(value: number[]);
    constructor(name: string, options: string[], defaultIndex?: number);
    onChange(callback: (index: number) => void): this;
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index: number): this;
}
/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
declare class ZRadioTabs extends Z<"div"> {
    $radioBox: ZRadioBox;
    selectedIndex: number;
    $pages: Z<any>[];
    constructor(name: string, pages: Plain<Z<any>>, defaultIndex?: number);
    onChange(callback: (index: number) => void): this;
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index: number): this;
}
declare class ZDialog extends Z<"dialog"> {
    constructor();
    show(): this;
    bindDonePromise(promise: Promise<any>): this;
    whenClosed(callback: () => void): this;
    close(): void;
}
declare class ZNotification extends Z<"div"> {
    $text: Z<"span">;
    $close: Z<"span">;
    constructor(text: string, timeout?: number);
}
declare function notify(message: string): void;
declare class ZTextArea extends Z<"textarea"> {
    constructor(rows?: number, cols?: number);
    getValue(): string;
    setValue(value: string): this;
    get value(): string;
    set value(value: string);
}
interface IJSEditor {
    getValue(): string;
    setValue(value: string): void;
}
declare class JSEditor extends Z<"div"> {
    editor: ZTextArea;
    constructor();
    getValue(): string;
    setValue(value: string): this;
}
declare class ZCollapseController extends Z<"div"> {
    private _folded;
    targets: Z<HTMLElementTagName>[];
    constructor(_folded: boolean, stopsPropagation?: boolean);
    get folded(): boolean;
    set folded(value: boolean);
    attach(...arr$element: Z<HTMLElementTagName>[]): void;
}
interface ListNode<T> {
    next: ListNode<T> | null;
    value: T;
}
interface TwoDirectionNode {
    previous: TwoDirectionNode;
    next: TwoDirectionNode;
}
declare const connect: <T>(foreNode: ListNode<T>, lateNode: ListNode<T>) => void;
declare const rgba: (r: number, g: number, b: number, a: number) => string;
declare const rgb: (r: number, g: number, b: number) => string;
/** @deprecated */
declare const toTimeString: (beaT: TimeT) => string;
declare function drawLine(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
/**
 *
 * @param context
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @param cp1x control point 1
 * @param cp1y
 * @param cp2x
 * @param cp2y
 */
declare function drawBezierCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number): void;
/**
 * To assign the same handler for different event types on an element
 * @param eventTypes array of strings representing the types
 * @param element
 * @param handler
 */
declare function on<K extends keyof HTMLElementEventMap>(eventTypes: K[], element: HTMLElement, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
/**
 * to print a two-directional node list
 * @param list
 */
declare function printList<T extends TwoDirectionNode>(list: List<T>): void;
type Vector = [x: number, y: number];
/**
 * to compute the length of a vector
 * @param v
 * @returns length
 */
declare const absVector: (v: Vector) => number;
/**
 *
 * @param v1
 * @param v2
 * @returns
 */
declare const innerProduct: (v1: Vector, v2: Vector) => number;
declare const getOffset: (element: HTMLElement) => number[];
/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
declare const getOffsetCoordFromEvent: (event: MouseEvent | TouchEvent, element: HTMLElement) => [number, number];
declare function saveTextToFile(text: string, filename: string): void;
declare function shortenFloat(num: number, decimalPlaces: number): number;
declare function changeAudioTime(audio: HTMLAudioElement, delta: number): void;
/**
 * 获取一串数字的第？分位数
 */
declare function getPercentile(sorted: number[], percentile: number): number;
declare const isAllDigits: (str: string) => boolean;
declare const extend: <T>(target: Partial<T>, source: Partial<T>) => void;
/**
 * 检查值的类型
 * @param value
 * @param type 为字符串时，用typeof检测，为构造函数时，用instanceof检测，为数组时，识别为元组类型。
 */
declare const checkType: (value: any, type: string | (string | Function)[] | Function) => any;
declare const numNoun: (num: number, singular: string, plural?: string) => string;
declare const numNounWithoutZero: (num: number, singular: string, plural?: string) => string;
declare const bisearchInsertLeft: (arr: number[], target: number) => number;
declare const formatTime: (minutes: number, seconds: number) => string;
declare const rgb2hex: (rgb: RGB) => number;
declare const hex2rgb: (hex: number) => RGB;
declare const hex6StrToRgb: (hex: string) => RGB;
declare const hex3StrToRgb: (hex: string) => RGB;
declare const numberToRatio: (num: number) => [number, number];
declare class NeedsReflowEvent extends Event {
    condition: number;
    constructor(condition: number);
}
declare class OperationEvent extends Event {
    operation: Operation;
    constructor(t: string, operation: Operation);
}
declare class OperationErrorEvent extends OperationEvent {
    error: Error;
    constructor(operation: Operation, error: Error);
}
declare class OperationList extends EventTarget {
    chart: Chart;
    operations: Operation[];
    undoneOperations: Operation[];
    constructor(chart: Chart);
    undo(): void;
    redo(): void;
    do(operation: Operation): void;
    processFlags(operation: Operation): void;
    clear(): void;
}
declare abstract class Operation {
    ineffective: boolean;
    updatesEditor: boolean;
    reflows: number;
    needsComboRecount: boolean;
    constructor();
    abstract do(chart: Chart): void;
    abstract undo(chart: Chart): void;
    rewrite(op: typeof this): boolean;
    toString(): string;
    static lazy<C extends new (...args: any[]) => any = typeof this>(this: C, ...args: ConstructorParameters<C>): LazyOperation<C>;
}
/**
 * 懒操作，实例化的时候不记录任何数据，do的时候才执行真正实例化
 * 防止连续的操作中状态改变导致的错误
 */
declare class LazyOperation<C extends new (...args: any[]) => any> extends Operation {
    operationClass: C;
    args: ConstructorParameters<C>;
    operation: InstanceType<C> | null;
    constructor(operationClass: C, ...args: ConstructorParameters<C>);
    do(chart: Chart): void;
    undo(chart: Chart): void;
}
declare class ComplexOperation<T extends Operation[]> extends Operation {
    subOperations: T;
    length: number;
    constructor(...sub: T);
    do(chart?: Chart): void;
    undo(chart?: Chart): void;
}
type NotePropNamePhiZone = "judgeSize" | "tint" | "tintHitEffects";
type NotePropName = "speed" | "type" | "positionX" | "startTime" | "endTime" | "alpha" | "size" | "visibleBeats" | "yOffset" | "above" | "isFake" | NotePropNamePhiZone;
declare class NotePropChangeOperation<T extends NotePropName> extends Operation {
    field: T;
    note: Note;
    previousValue: Note[T];
    value: Note[T];
    updatesEditor: boolean;
    constructor(note: Note, field: T, value: Note[T]);
    do(): void;
    undo(): void;
    rewrite(operation: NotePropChangeOperation<T>): boolean;
}
declare class NoteRemoveOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    isHold: boolean;
    needsComboRecount: boolean;
    constructor(note: Note);
    do(): void;
    undo(): void;
}
/**
 * 删除一个note
 * 从语义上删除Note要用这个操作
 * 结果上，这个会更新编辑器
 */
declare class NoteDeleteOperation extends NoteRemoveOperation {
    updatesEditor: boolean;
}
declare class MultiNoteDeleteOperation extends ComplexOperation<NoteDeleteOperation[]> {
    updatesEditor: boolean;
    constructor(notes: Set<Note> | Note[]);
}
declare class NoteAddOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    isHold: boolean;
    updatesEditor: boolean;
    needsComboRecount: boolean;
    constructor(note: Note, node: NoteNode);
    do(): void;
    undo(): void;
}
declare class MultiNoteAddOperation extends ComplexOperation<NoteAddOperation[]> {
    updatesEditor: boolean;
    needsComboRecount: boolean;
    constructor(notes: Set<Note> | Note[], judgeLine: JudgeLine);
}
declare class NoteTimeChangeOperation extends ComplexOperation<[
    NoteRemoveOperation,
    NotePropChangeOperation<"startTime">,
    NoteAddOperation
] | [NoteRemoveOperation, NotePropChangeOperation<"startTime">, NoteAddOperation, NotePropChangeOperation<"endTime">]> {
    note: Note;
    constructor(note: Note, noteNode: NoteNode);
    rewrite(operation: NoteTimeChangeOperation): boolean;
}
declare class HoldEndTimeChangeOperation extends NotePropChangeOperation<"endTime"> {
    needsComboRecount: boolean;
    constructor(note: Note, value: TimeT);
    do(): void;
    undo(): void;
    rewrite(operation: HoldEndTimeChangeOperation): boolean;
}
declare class NoteSpeedChangeOperation extends ComplexOperation<[NotePropChangeOperation<"speed">, NoteRemoveOperation, NoteAddOperation]> {
    updatesEditor: boolean;
    originalTree: NNList;
    judgeLine: JudgeLine;
    targetTree: NNList;
    constructor(note: Note, value: number, line: JudgeLine);
}
declare class NoteYOffsetChangeOperation extends ComplexOperation<[NotePropChangeOperation<"yOffset">, NoteRemoveOperation, NoteAddOperation]> {
    updatesEditor: boolean;
    originalTree: NNList;
    judgeLine: JudgeLine;
    targetTree: NNList;
    constructor(note: Note, value: number, line: JudgeLine);
}
declare class NoteTypeChangeOperation extends ComplexOperation</*[NoteValueChangeOperation<"type">, NoteInsertOperation]*/ any> {
    constructor(note: Note, value: number);
}
declare class NoteTreeChangeOperation extends NoteAddOperation {
}
declare class EventNodePairRemoveOperation extends Operation {
    updatesEditor: boolean;
    endNode: EventEndNode<any>;
    startNode: EventStartNode<any>;
    sequence: EventNodeSequence<any>;
    originalPrev: EventStartNode<any>;
    constructor(node: EventStartNode<any>);
    do(): void;
    undo(): void;
}
/**
 * 将一对孤立的节点对插入到一个开始节点之后的操作。
 * 如果这个节点对的时刻与节点对的时刻相同，那么该节点对将不会被插入。
 * 而是把原来开始节点的值修改。
 */
declare class EventNodePairInsertOperation<VT> extends Operation {
    updatesEditor: boolean;
    node: EventStartNode<VT>;
    tarPrev: EventStartNode<VT>;
    originalSequence: EventNodeSequence<VT>;
    overlapped: boolean;
    originalValue: VT;
    value: VT;
    /**
     *
     * @param node the node to insert
     * @param targetPrevious The node to insert before, accessed through EventNodeSequence.getNodeAt(TC.toBeats(node))
     * If the targetPrevious's time is the same as node's time, the node will not be inserted,
     * and the targetPrevious' value will be replaced with the node's value.
     */
    constructor(node: EventStartNode<VT>, targetPrevious: EventStartNode<VT>);
    do(): void;
    undo(): void;
}
/**
 * Only used for new nodes
 * dynamically compute the targetPrevious
 * /
class EventNodePairAddOperation extends Operation {
    updatesEditor = true
    constructor(public node: EventStartNode, public targetSequence: EventNodeSequence) {
        super();
    }
    do() {
        const tarPrev = this.targetSequence.getNodeAt(this.node.start);
        const [endNode, startNode] =
    }
}
*/
/**
 * 批量添加节点对
 * 节点对需要有序的，且不能有重叠

 */
declare class MultiNodeAddOperation<VT> extends ComplexOperation<EventNodePairInsertOperation<VT>[]> {
    updatesEditor: boolean;
    nodes: EventStartNode<VT>[];
    constructor(nodes: EventStartNode<VT>[], seq: EventNodeSequence<VT>);
}
declare class MultiNodeDeleteOperation extends ComplexOperation<LazyOperation<typeof EventNodePairRemoveOperation>[]> {
    updatesEditor: boolean;
    constructor(nodes: EventStartNode<any>[]);
}
declare class EventNodeValueChangeOperation<VT> extends Operation {
    updatesEditor: boolean;
    node: EventNode<VT>;
    value: VT;
    originalValue: VT;
    constructor(node: EventNode<VT>, val: VT);
    do(): void;
    undo(): void;
    rewrite(operation: EventNodeValueChangeOperation<VT>): boolean;
}
declare class EventNodeTimeChangeOperation extends Operation {
    updatesEditor: boolean;
    sequence: EventNodeSequence;
    /**
     * 这里两个node不是面对面，而是背靠背
     * i. e. EndNode -> StartNode
     */
    startNode: EventStartNode<any>;
    endNode: EventEndNode<any>;
    value: TimeT;
    originalValue: TimeT;
    originalPrevious: EventStartNode<any>;
    newPrevious: EventStartNode<any>;
    constructor(node: EventStartNode<any> | EventEndNode<any>, val: TimeT);
    do(): void;
    undo(): void;
}
declare class EventNodeInnerEasingChangeOperation extends Operation {
    updatesEditor: boolean;
    startNode: EventStartNode<any>;
    value: Easing;
    originalValue: Easing;
    constructor(node: EventStartNode<any> | EventEndNode<any>, val: Easing);
    do(): void;
    undo(): void;
}
declare class EventNodeEasingChangeOperation extends Operation {
    updatesEditor: boolean;
    startNode: EventStartNode<any>;
    value: Easing;
    originalValue: Easing;
    constructor(node: EventStartNode<any> | EventEndNode<any>, val: Easing);
    do(): void;
    undo(): void;
}
declare class TextEventNodeInterpretationChangeOperation extends Operation {
    node: EventStartNode<string>;
    value: InterpreteAs;
    originalValue: InterpreteAs;
    constructor(node: EventStartNode<string>, value: InterpreteAs);
    do(): void;
    undo(): void;
}
declare class EventInterpolationOperation<VT> extends ComplexOperation<LazyOperation<typeof EventNodePairInsertOperation>[]> {
    eventStartNode: EventStartNode<VT>;
    step: TimeT;
    updatesEditor: boolean;
    constructor(eventStartNode: EventStartNode<VT>, step: TimeT);
}
declare const easingIsSegmented: (easing: Easing) => easing is SegmentedEasing;
declare class EventSubstituteOperation extends ComplexOperation<[...LazyOperation<typeof EventNodePairInsertOperation>[], EventNodeEasingChangeOperation, EventNodeValueChangeOperation<number>]> {
    node: EventStartNode<number>;
    updatesEditor: boolean;
    constructor(node: EventStartNode<number>);
}
declare class EncapsuleOperation extends ComplexOperation<[MultiNodeDeleteOperation, EventNodeEasingChangeOperation, EventNodeValueChangeOperation<number>]> {
    updatesEditor: boolean;
    constructor(nodes: EventStartNode[], easing: TemplateEasing);
}
declare enum EncapsuleErrorType {
    NotBelongToSourceSequence = 1,
    NotContinuous = 2,
    ZeroDelta = 3
}
/**
 * 将一些来自sourceSequence的节点打包为一个用于模板缓动的事件序列
 * 然后把sourceSequence中的源节点集合替换为单个使用了该模板的事件
 * @param sourceSequence
 * @param sourceNodes
 */
declare function encapsule(templateEasingLib: TemplateEasingLib, sourceSequence: EventNodeSequence, sourceNodes: Set<EventStartNode>, name: string): EncapsuleErrorType | EncapsuleOperation;
declare class JudgeLineInheritanceChangeOperation extends Operation {
    chart: Chart;
    judgeLine: JudgeLine;
    value: JudgeLine | null;
    originalValue: JudgeLine | null;
    updatesEditor: boolean;
    reflows: JudgeLinesEditorLayoutType;
    constructor(chart: Chart, judgeLine: JudgeLine, value: JudgeLine | null);
    do(): void;
    undo(): void;
}
declare class JudgeLineRenameOperation extends Operation {
    judgeLine: JudgeLine;
    value: string;
    updatesEditor: boolean;
    originalValue: string;
    constructor(judgeLine: JudgeLine, value: string);
    do(): void;
    undo(): void;
}
type JudgeLinePropName = "name" | "rotatesWithFather" | "anchor" | "texture" | "cover" | "zOrder";
declare class JudgeLinePropChangeOperation<T extends JudgeLinePropName> extends Operation {
    judgeLine: JudgeLine;
    field: T;
    value: JudgeLine[T];
    updatesEditor: boolean;
    originalValue: JudgeLine[T];
    constructor(judgeLine: JudgeLine, field: T, value: JudgeLine[T]);
    do(): void;
    undo(): void;
}
declare class JudgeLineRegroupOperation extends Operation {
    judgeLine: JudgeLine;
    value: JudgeLineGroup;
    updatesEditor: boolean;
    reflows: JudgeLinesEditorLayoutType;
    originalValue: JudgeLineGroup;
    constructor(judgeLine: JudgeLine, value: JudgeLineGroup);
    do(): void;
    undo(): void;
}
declare class JudgeLineCreateOperation extends Operation {
    chart: Chart;
    judgeLine: JudgeLine;
    reflows: number;
    constructor(chart: Chart, judgeLine: JudgeLine);
    do(): void;
    undo(): void;
}
declare class JudgeLineDeleteOperation extends Operation {
    chart: Chart;
    judgeLine: JudgeLine;
    readonly originalGroup: JudgeLineGroup;
    constructor(chart: Chart, judgeLine: JudgeLine);
    do(): void;
    undo(): void;
}
declare class JudgeLineENSChangeOperation extends Operation {
    judgeLine: JudgeLine;
    layerId: number;
    typeStr: BasicEventName;
    value: EventNodeSequence;
    originalValue: EventNodeSequence;
    constructor(judgeLine: JudgeLine, layerId: number, typeStr: BasicEventName, value: EventNodeSequence);
    do(): void;
    undo(): void;
}
type ENSOfTypeName<T extends ExtendedEventTypeName> = {
    "scaleX": EventNodeSequence<number>;
    "scaleY": EventNodeSequence<number>;
    "text": EventNodeSequence<string>;
    "color": EventNodeSequence<RGB>;
}[T];
declare class JudgeLineExtendENSChangeOperation<T extends ExtendedEventTypeName> extends Operation {
    judgeLine: JudgeLine;
    typeStr: T;
    value: ENSOfTypeName<T> | null;
    originalValue: ENSOfTypeName<T>;
    constructor(judgeLine: JudgeLine, typeStr: T, value: ENSOfTypeName<T> | null);
    do(): void;
    undo(): void;
}
declare class EventNodeSequenceRenameOperation extends Operation {
    sequence: EventNodeSequence;
    newName: string;
    updatesEditor: boolean;
    originalName: string;
    constructor(sequence: EventNodeSequence, newName: string);
    do(chart: Chart): void;
    undo(chart: Chart): void;
}
declare class AttachUIOperation extends Operation {
    chart: Chart;
    judgeLine: JudgeLine;
    ui: UIName;
    updatesEditor: boolean;
    constructor(chart: Chart, judgeLine: JudgeLine, ui: UIName);
    do(): void;
    undo(): void;
}
declare class DetachUIOperation extends Operation {
    chart: Chart;
    ui: UIName;
    updatesEditor: boolean;
    judgeLine: JudgeLine;
    constructor(chart: Chart, ui: UIName);
    do(): void;
    undo(): void;
}
declare class DetachJudgeLineOperation extends Operation {
    chart: Chart;
    judgeLine: JudgeLine;
    updatesEditor: boolean;
    uinames: UIName[];
    constructor(chart: Chart, judgeLine: JudgeLine);
    do(): void;
    undo(): void;
}
type ChartPropName = "name" | "level" | "composer" | "illustrator" | "charter" | "offset";
declare class ChartPropChangeOperation<T extends ChartPropName> extends Operation {
    chart: Chart;
    field: T;
    value: Chart[T];
    originalValue: Chart[T];
    constructor(chart: Chart, field: T, value: Chart[T]);
    do(): void;
    undo(): void;
}
type TimeRange = [TimeT, TimeT];
/**
 * 所有节点事件加上一个值。
 * 此操作假定了节点被偏移时不会产生“碰撞”。
 * 节点要有序
 * @private
 */
declare class MultiNodeOffsetOperation extends Operation {
    nodes: readonly EventStartNode<any>[];
    offset: TimeT;
    constructor(nodes: readonly EventStartNode<any>[], offset: TimeT);
    do(): void;
    undo(): void;
}
declare class ENSTimeRangeDeleteOperation extends ComplexOperation<[MultiNodeDeleteOperation, MultiNodeOffsetOperation]> {
    eventNodeSequence: EventNodeSequence<any>;
    timeRange: TimeRange;
    beforeToStart: EventStartNode<any> | EventNodeLike<NodeType.HEAD, any>;
    constructor(eventNodeSequence: EventNodeSequence<any>, timeRange: TimeRange);
    do(): void;
    undo(): void;
}
declare class ENSAddBlankOperation extends MultiNodeOffsetOperation {
    ens: EventNodeSequence<any>;
    updatesEditor: boolean;
    constructor(ens: EventNodeSequence<any>, pos: TimeT, length: TimeT);
    do(): void;
    undo(): void;
}
declare class MultiNoteOffsetOperation extends Operation {
    nnList: NNList;
    notes: readonly Note[];
    offset: TimeT;
    constructor(nnList: NNList, notes: readonly Note[], offset: TimeT);
    do(): void;
    undo(): void;
    private static lazy;
}
declare class NNListTimeRangeDeleteOperation extends ComplexOperation<[MultiNoteDeleteOperation, MultiNoteOffsetOperation]> {
    nnList: NNList;
    timeRange: TimeRange;
    updatesJump: boolean;
    constructor(nnList: NNList, timeRange: TimeRange, updatesJump?: boolean);
    do(): void;
    undo(): void;
}
declare class NNListAddBlankOperation extends MultiNoteOffsetOperation {
    updatesEditor: boolean;
    constructor(nnList: NNList, pos: TimeT, length: TimeT);
}
declare const BEZIER_POINT_SIZE = 20;
declare const HALF_BEZIER_POINT_SIZE: number;
declare enum BezierEditorState {
    select = 0,
    selectingStart = 1,
    selectingEnd = 2
}
/** 编辑三次贝塞尔曲线 */
declare class BezierEditor extends Z<"div"> {
    size: number;
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    selectionManager: SelectionManager<"end" | "start">;
    startPoint: Coordinate;
    endPoint: Coordinate;
    state: BezierEditorState;
    drawn: boolean;
    constructor(size: number);
    update(): void;
    matrix: Matrix;
    invertedMatrix: Matrix;
    updateMatrix(): void;
    downHandler(event: MouseEvent | TouchEvent): void;
    moveHandler(event: MouseEvent | TouchEvent): void;
    upHandler(event: TouchEvent | MouseEvent): void;
    getValue(): BezierEasing;
    setValue(easing: BezierEasing): void;
    whenValueChange(fn: () => void): void;
}
declare abstract class SideEditor extends Z<"div"> {
    element: HTMLDivElement;
    $title: Z<"div">;
    $body: Z<"div">;
    constructor();
    abstract update(): void;
}
declare abstract class SideEntityEditor<T extends object> extends SideEditor {
    _target: T extends Set<any> ? T : WeakRef<T>;
    get target(): T;
    set target(val: T);
    abstract update(): void;
    constructor();
}
declare class NoteEditor extends SideEntityEditor<Note> {
    noteTypeOptions: BoxOption[];
    $warning: Z<"span">;
    $time: ZFractionInput;
    $endTime: ZFractionInput;
    $type: ZDropdownOptionBox;
    $position: ZInputBox;
    $dir: ZSwitch;
    $speed: ZInputBox;
    $real: ZSwitch;
    $alpha: ZInputBox;
    $size: ZInputBox;
    $yOffset: ZInputBox;
    $visibleBeats: ZInputBox;
    $tint: ZInputBox;
    $tintHitEffect: ZInputBox;
    $judgeSize: ZInputBox;
    $setAsDefault: ZButton;
    $delete: ZButton;
    constructor();
    update(): void;
}
type CanRepresentTime = TimeT | number | string;
declare const processTimeArg: (time: CanRepresentTime) => number;
/**
 * 多音符编辑的辅助函数
 * @param note 原封不动传入音符
 * @param easingFunc 缓动函数（ease开头）
 * @param start 开始点
 * @param end 结束点
 * @returns
 */
declare const fillCurve: (note: Note | EventNode, easingFunc: ((t: number) => number) | Easing, start: [CanRepresentTime, number], end: [CanRepresentTime, number]) => number;
declare const snippets: {
    blank: string;
    "fillCurve (with comments)": string;
    fillCurve: string;
    help: string;
};
declare class MultiNoteEditor extends SideEntityEditor<Set<Note>> {
    readonly $reverse: ZButton;
    readonly $delete: ZButton;
    readonly $propOptionBox: ZDropdownOptionBox;
    readonly $code: JSEditor;
    readonly $execute: ZButton;
    readonly $snippets: ZDropdownOptionBox;
    readonly $fillDensityInput: ZFractionInput;
    readonly $fill: ZButton;
    readonly $fillWarning: Z<"span">;
    constructor();
    update(): void;
}
declare class MultiNodeEditor extends SideEntityEditor<Set<EventStartNode>> {
    readonly $reverse: ZButton;
    readonly $delete: ZButton;
    readonly $startEndOptionBox: ZDropdownOptionBox;
    readonly $propOptionBox: ZDropdownOptionBox;
    readonly $code: JSEditor;
    readonly $execute: ZButton;
    readonly $snippets: ZDropdownOptionBox;
    constructor();
    update(): void;
}
declare class EventEditor<VT extends number | string | RGB> extends SideEntityEditor<EventStartNode<VT> | EventEndNode<VT>> {
    $titleContent: Z<"span">;
    $goPrev: ZButton;
    $goNext: ZButton;
    $applyLast: ZButton;
    $warning: Z<"span">;
    $time: ZFractionInput;
    $value: ZInputBox;
    $normalOuter: Z<"div">;
    $normalLeft: ZInputBox;
    $normalRight: ZInputBox;
    $easing: ZEasingBox;
    $templateOuter: Z<"div">;
    $templateEasing: ZInputBox;
    $templateLeft: ZInputBox;
    $templateRight: ZInputBox;
    $parametricOuter: Z<"div">;
    $parametric: ZInputBox;
    $interpolationOuter: Z<"div">;
    $interpolationStep: ZFractionInput;
    $interpolateBtn: ZButton;
    $substitute: ZButton;
    $bezierEditor: BezierEditor;
    $interpreteAsSpanText: Z<"span">;
    $interpreteAsOptionBox: ZDropdownOptionBox;
    $colorNotation: Z<"span">;
    $delete: ZButton;
    $radioTabs: ZRadioTabs;
    constructor();
    setNormalEasing(id: number): void;
    setTemplateEasing(name: string): void;
    setBezierEasing(easing: BezierEasing): void;
    setParametricEasing(expression: string): void;
    update(): void;
}
declare function searchTexture(prefix: string): Promise<string[]>;
declare class JudgeLineInfoEditor extends SideEntityEditor<JudgeLine> {
    readonly $cover: ZSwitch;
    readonly $father: ZInputBox;
    readonly $texture: ZSearchBox;
    readonly $anchor: ZInputBox;
    readonly $group: ZDropdownOptionBox;
    readonly $newGroup: ZInputBox;
    readonly $zOrder: ZArrowInputBox;
    readonly $createGroup: ZButton;
    readonly $createLine: ZButton;
    readonly $attachUI: ZCollapseController;
    readonly $rotatesWithFather: ZSwitch;
    readonly $del: ZButton;
    readonly $setAsBindNote: ZButton;
    readonly $eventLayerIdInput: ZArrowInputBox;
    readonly $eventType: ZDropdownOptionBox;
    readonly $eventNodeSequence: Z<"div">;
    readonly $newEventSeqName: ZSearchBox;
    readonly map$uiAttach: Record<UIName, ZSwitch>;
    constructor();
    update(): void;
    updateGroups(groups: JudgeLineGroup[]): void;
    updateAttach(): void;
}
declare class UserScriptEditor extends SideEditor {
    $script: JSEditor;
    $runBtn: ZButton;
    constructor();
    update(): void;
}
declare class ChartInfoEditor extends SideEditor {
    $chartTitle: ZInputBox;
    $level: ZInputBox;
    $composer: ZInputBox;
    $charter: ZInputBox;
    $illustrator: ZInputBox;
    $chartingTime: Z<"span">;
    $rpeChartingTime: Z<"span">;
    constructor();
    update(): void;
}
type PositionEntity<T> = {
    target: T;
    left: number;
    top: number;
    height: number;
    width: number;
    priority: number;
} | {
    target: T;
    centerX: number;
    centerY: number;
    height: number;
    width: number;
    priority: number;
    rad?: number;
};
declare const pointIsInRect: (x: number, y: number, rectTop: number, rectLeft: number, width: number, height: number) => boolean;
declare class SelectionManager<T> {
    positions: PositionEntity<T>[];
    private basePriority;
    constructor();
    refresh(): void;
    /**
     *
     * @param entity 两种形态，一种通过左上角和宽高定义，需要选定区罩住整个矩形，另一种通过中心点、宽高和角度定义，只要罩住中心点
     * @returns
     */
    add(entity: PositionEntity<T>): {
        annotate: (context: CanvasRenderingContext2D, canvasX: number, canvasY: number) => void;
    };
    click(Coordinate: Coordinate): undefined | PositionEntity<T>;
    click(x: number, y: number): undefined | PositionEntity<T>;
    /**
     * For PositionEntities whose centerXY is given, this method only examine whether the center is in the rect.
     * For PositionEntities whose left, top is given, this method also examine whether the pos rect is in the rect.
     * @param top
     * @param left
     * @param right
     * @param bottom
     * @returns
     */
    selectScope(top: number, left: number, bottom: number, right: number): PositionEntity<T>[];
    setBasePriority(priority: number): void;
}
declare const SCOPING_COLOR = "#FAE";
declare const COLOR_INTERPOLATION_STEP = 0.05;
declare const COLOR_INTERPOLATION_MAX_STOPS = 20;
declare const eventTypeMap: {
    valueGridSpan: number;
    valueRange: [number, number];
}[];
type EventTypeName = "moveX" | "moveY" | "alpha" | "rotate" | "speed" | "easing" | "bpm" | "scaleX" | "scaleY" | "text" | "color";
type ExtendedEventTypeName = "scaleX" | "scaleY" | "text" | "color";
declare enum NewNodeState {
    controlsStart = 0,
    controlsEnd = 1,
    controlsBoth = 2
}
declare const eventTypeKeys: readonly ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm", "scaleX", "scaleY", "text", "color"];
declare const normalTypes: readonly ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"];
declare const extendedTypes: readonly ["scaleX", "scaleY", "text", "color"];
declare const numericEventTypeKeys: readonly ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm", "scaleX", "scaleY"];
declare class EventCurveEditors extends Z<"div"> {
    selectOptions: {
        none: BoxOption;
        extend: BoxOption;
        replace: BoxOption;
        exclude: BoxOption;
    };
    element: HTMLDivElement;
    $bar: Z<"div">;
    readonly normalOptions: BoxOption[];
    readonly extendedOptions: BoxOption[];
    readonly $typeSelect: ZDropdownOptionBox;
    readonly $layerSelect: ZDropdownOptionBox;
    readonly $timeSpanInput: ZInputBox;
    readonly $editSwitch: ZSwitch;
    readonly $easingBox: ZEasingBox;
    readonly $newNodeStateSelect: ZDropdownOptionBox;
    readonly $encapsuleBtn: ZButton;
    readonly $templateNameInput: ZInputBox;
    readonly $rangeInput: ZInputBox;
    readonly $selectOption: ZDropdownOptionBox;
    selectState: SelectState;
    moveX: EventCurveEditor;
    moveY: EventCurveEditor;
    alpha: EventCurveEditor;
    rotate: EventCurveEditor;
    speed: EventCurveEditor;
    easing: EventCurveEditor;
    bpm: EventCurveEditor;
    text: TextEventSequenceEditor;
    color: ColorEventSequenceEditor;
    scaleX: EventCurveEditor;
    scaleY: EventCurveEditor;
    lastBeats: number;
    easingBeats: number;
    clipboard: Set<EventStartNode<unknown>>;
    nodesSelection: Set<EventStartNode<unknown>>;
    constructor();
    init(): void;
    _selectedEditor: EventCurveEditor | TextEventSequenceEditor;
    get selectedEditor(): EventCurveEditor | TextEventSequenceEditor;
    set selectedEditor(val: EventCurveEditor | TextEventSequenceEditor);
    _selectedLayer: "0" | "1" | "2" | "3" | "ex";
    get selectedLayer(): "0" | "1" | "2" | "3" | "ex";
    set selectedLayer(val: "0" | "1" | "2" | "3" | "ex");
    draw(beats?: number): void;
    target: JudgeLine;
    changeTargetLine(target: JudgeLine): void;
    updateAdjustmentOptions(editor: EventCurveEditor): void;
}
type NodePosition = {
    node: EventNode;
    x: number;
    y: number;
};
declare enum EventCurveEditorState {
    select = 0,
    selecting = 1,
    edit = 2,
    flowing = 3,
    selectScope = 4,
    selectingScope = 5
}
declare const lengthOf: (range: readonly [number, number]) => number;
declare const medianOf: (range: readonly [number, number]) => number;
declare const percentileOf: (range: readonly [number, number], percent: number) => number;
/**
 * 对于一个值，在一系列可吸附值上寻找最接近的值
 * @param sortedAttachable
 * @param value
 * @returns
 */
declare const computeAttach: (sortedAttachable: number[], value: number) => number;
/**
 * 生成可吸附值
 * @param linear 一次函数的两个系数
 * @param range 显示范围
 */
declare function generateAttachable(linear: [k: number, b: number], range: readonly [number, number]): number[];
declare function divideOrMul(gridSpan: number, maximum: number): number;
declare class EventCurveEditor {
    type: Exclude<EventType, EventType.text | EventType.color>;
    target: EventNodeSequence<number>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;
    innerHeight: number;
    innerWidth: number;
    $element: Z<"div">;
    element: HTMLDivElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    valueRatio: number;
    timeRatio: number;
    valueRange: readonly [number, number];
    timeSpan: number;
    timeGridSpan: number;
    attachableValues: number[];
    timeGridColor: RGB;
    valueGridColor: RGB;
    padding: number;
    lastBeats: number;
    selectionManager: SelectionManager<EventStartNode | EventEndNode>;
    state: EventCurveEditorState;
    wasEditing: boolean;
    _selectedNode: WeakRef<EventStartNode | EventEndNode>;
    pointedValue: number;
    pointedTime: TimeT;
    easing: NormalEasing;
    newNodeState: NewNodeState;
    selectState: SelectState;
    lastSelectState: SelectState;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    get selectedNode(): EventStartNode | EventEndNode;
    set selectedNode(val: EventStartNode | EventEndNode);
    private _active;
    /** @deprecated use active instead */
    get displayed(): boolean;
    set displayed(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    constructor(type: Exclude<EventType, EventType.text | EventType.color>, height: number, width: number, parent: EventCurveEditors);
    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    appendTo(parent: HTMLElement): void;
    downHandler(event: MouseEvent | TouchEvent): void;
    upHandler(event: MouseEvent | TouchEvent): void;
    initContext(): void;
    drawCoordination(beats: number): void;
    draw(beats?: number): void;
    drawSequence(sequence: EventNodeSequence, valueArray: number[], beats: number, startBeats: number, endBeats: number, matrix: Matrix): void;
    autoRangeEnabled: boolean;
    adjust(values: number[]): void;
    changeTarget(line: JudgeLine, index: string): void;
    paste(): void;
    copy(): void;
}
declare class TextEventSequenceEditor {
    target: EventNodeSequence<string>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;
    innerHeight: number;
    innerWidth: number;
    $element: Z<"div">;
    element: HTMLDivElement;
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
    wasEditing: boolean;
    _selectedNode: WeakRef<EventStartNode<string> | EventEndNode<string>>;
    pointedTime: TimeT;
    easing: NormalEasing;
    selectState: SelectState;
    lastSelectState: SelectState;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    get selectedNode(): EventStartNode<string> | EventEndNode<string>;
    set selectedNode(val: EventStartNode<string> | EventEndNode<string>);
    private _active;
    /** @deprecated use active instead */
    get displayed(): boolean;
    set displayed(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    constructor(height: number, width: number, parent: EventCurveEditors);
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    appendTo(parent: HTMLElement): void;
    downHandler(event: MouseEvent | TouchEvent): void;
    upHandler(event: MouseEvent | TouchEvent): void;
    initContext(): void;
    drawCoordination(beats: number): void;
    draw(beats?: number): void;
    drawSequence(sequence: EventNodeSequence<string>, beats: number, startBeats: number, endBeats: number, index: number, total: number): void;
    changeTarget(line: JudgeLine, index: string): void;
    createTarget(line: JudgeLine): void;
    paste(): void;
    copy(): void;
}
declare class ColorEventSequenceEditor {
    target: EventNodeSequence<RGB>;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;
    innerHeight: number;
    innerWidth: number;
    $element: Z<"div">;
    element: HTMLDivElement;
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
    wasEditing: boolean;
    _selectedNode: WeakRef<EvSoE<RGB>>;
    pointedTime: TimeT;
    easing: NormalEasing;
    selectState: SelectState;
    lastSelectState: SelectState;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    get selectedNode(): EventStartNode<string> | EventEndNode<string>;
    set selectedNode(val: EventStartNode<string> | EventEndNode<string>);
    private _active;
    /** @deprecated use active instead */
    get displayed(): boolean;
    set displayed(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    constructor(height: number, width: number, parent: EventCurveEditors);
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    appendTo(parent: HTMLElement): void;
    downHandler(event: MouseEvent | TouchEvent): void;
    upHandler(event: MouseEvent | TouchEvent): void;
    initContext(): void;
    drawCoordination(beats: number): void;
    draw(beats?: number): void;
    drawSequence(sequence: EventNodeSequence<RGB>, beats: number, startBeats: number, endBeats: number, index: number, total: number): void;
    changeTarget(line: JudgeLine, index: string): void;
    createTarget(line: JudgeLine): void;
    paste(): void;
    copy(): void;
}
declare const DRAWS_NN = true;
declare const COLOR_1 = "#66ccff";
declare const COLOR_2 = "#ffcc66";
declare enum NotesEditorState {
    select = 0,
    selecting = 1,
    edit = 2,
    selectScope = 3,
    selectingScope = 4,
    flowing = 5
}
declare class HoldTail {
    note: Note;
    constructor(note: Note);
}
declare const timeToString: (time: TimeT) => string;
declare enum SelectState {
    none = 0,
    extend = 1,
    replace = 2,
    exclude = 3
}
declare class NotesEditor extends Z<"div"> {
    editor: Editor;
    $statusBar: Z<"div">;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    _target: JudgeLine;
    targetNNList?: NNList;
    positionBasis: number;
    positionRatio: number;
    positionGridSpan: number;
    positionSpan: number;
    timeRatio: number;
    timeGridSpan: number;
    timeSpan: number;
    padding: number;
    timeGridColor: RGB;
    positionGridColor: RGB;
    selectionManager: SelectionManager<Note | HoldTail>;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    notesSelection: Set<Note>;
    clipboard: Set<Note>;
    selectingTail: boolean;
    state: NotesEditorState;
    lastSelectState: SelectState;
    selectState: SelectState;
    wasEditing: boolean;
    pointedPositionX: number;
    noteType: NoteType;
    noteAbove: boolean;
    attachableTimes: number[];
    timeMap: Map<number, TimeT>;
    pointedTime: TimeT;
    showsNNNListAttachable: boolean;
    drawn: boolean;
    lastBeats: number;
    readonly selectOptions: {
        none: BoxOption;
        extend: BoxOption;
        replace: BoxOption;
        exclude: BoxOption;
    };
    readonly allOption: EditableBoxOption;
    readonly $listOption: ZEditableDropdownOptionBox;
    readonly $typeOption: ZDropdownOptionBox;
    readonly $noteAboveSwitch: ZSwitch;
    readonly $selectOption: ZDropdownOptionBox;
    readonly $editButton: ZSwitch;
    readonly $timeSpanInput: ZInputBox;
    readonly $xLineCountInput: ZArrowInputBox;
    readonly $showsNNNListAttachable: ZSwitch;
    mouseIn: boolean;
    defaultConfig: {
        alpha: number;
        isFake: number;
        size: number;
        speed: number;
        absoluteYOffset: number;
        visibleBeats: number;
    };
    get target(): JudgeLine;
    set target(line: JudgeLine);
    constructor(editor: Editor);
    downHandler(event: TouchEvent | MouseEvent): void;
    upHandler(event: any): void;
    _selectedNote: WeakRef<Note>;
    get selectedNote(): Note;
    set selectedNote(val: Note);
    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    init(width: number, height: number): void;
    drawCoordination(beats: number): void;
    lookList(nnnList: NNNList | NNList, startBeats: number, stopBeats: number, beats: number): void;
    draw(beats?: number): void;
    drawNNList(tree: NNList, beats: number, showsFrom?: boolean): void;
    drawNote(beats: number, note: Note, isTruck: boolean, nth: number, showsFrom: boolean): void;
    paste(): void;
    copy(): void;
}
declare const NODE_WIDTH = 20;
declare const NODE_HEIGHT = 20;
declare const NOTE_WIDTH = 54;
declare const NOTE_HEIGHT = 6;
declare enum JudgeLinesEditorLayoutType {
    ordered = 1,
    tree = 2,
    grouped = 4
}
declare class JudgeLinesEditor extends Z<"div"> {
    editor: Editor;
    chart: Chart;
    element: HTMLDivElement;
    editors: Map<JudgeLine, JudgeLineEditor>;
    metaLineAdded: boolean;
    layoutType: JudgeLinesEditorLayoutType;
    constructor(editor: Editor, element: HTMLDivElement);
    private _selectedLine;
    get selectedLine(): JudgeLine;
    set selectedLine(line: JudgeLine);
    private orderedLayout;
    private collapseStack;
    private treeLayout;
    private addIndentedLineEditor;
    private groupedLayout;
    private registerEditor;
    update(): void;
    reflow(type?: JudgeLinesEditorLayoutType): void;
}
declare class GroupEditor extends Z<"div"> {
    target: JudgeLineGroup;
    $collapse: ZCollapseController;
    constructor(target: JudgeLineGroup);
}
declare class JudgeLineEditor extends Z<"div"> {
    readonly linesEditor: JudgeLinesEditor;
    element: HTMLDivElement;
    judgeLine: JudgeLine;
    $id: Z<"div">;
    $name: ZInputBox;
    $xSpan: Z<"span">;
    $ySpan: Z<"span">;
    $thetaSpan: Z<"span">;
    $alphaSpan: Z<"span">;
    constructor(linesEditor: JudgeLinesEditor, judgeLine: JudgeLine, $collapse?: Z<"div">);
    update(): void;
}
declare class SaveDialog extends ZDialog {
    $message: ZInputBox;
    chartData: ChartDataKPA;
    $clearsOperationList: ZSwitch;
    constructor();
}
declare const tips: string[];
declare const generateTipsLabel: () => Z<"div">;
declare class Editor extends EventTarget {
    initialized: boolean;
    chartInitialized: boolean;
    audioInitialized: boolean;
    imageInitialized: boolean;
    player: Player;
    notesEditor: NotesEditor;
    chart: Chart;
    operationList?: OperationList;
    chartType: "rpejson" | "kpajson";
    chartData: ChartDataRPE | ChartDataKPA;
    readonly $progressBar: ZProgressBar;
    eventCurveEditors: EventCurveEditors;
    readonly $topbar: Z<"div">;
    readonly $preview: Z<"div">;
    readonly $noteInfo: Z<"div">;
    readonly $eventSequence: Z<"div">;
    readonly $playButton: ZSwitch;
    readonly lineInfoEle: HTMLDivElement;
    readonly $timeDivisor: ZArrowInputBox;
    timeDivisor: number;
    readonly $saveButton: ZButton;
    readonly $compileButton: ZButton;
    readonly $playbackRate: ZDropdownOptionBox;
    readonly $offsetInput: ZInputBox;
    readonly $switchButton: ZButton;
    readonly $judgeLinesEditorLayoutSelector: ZDropdownOptionBox;
    readonly $tipsLabel: Z<"div">;
    readonly $showsLineID: ZSwitch;
    readonly $showsUI: ZSwitch;
    judgeLinesEditor: JudgeLinesEditor;
    selectedLine: JudgeLine;
    noteEditor: NoteEditor;
    eventEditor: EventEditor;
    judgeLineInfoEditor: JudgeLineInfoEditor;
    userScriptEditor: UserScriptEditor;
    multiNoteEditor: MultiNoteEditor;
    multiNodeEditor: MultiNodeEditor;
    chartInfoEditor: ChartInfoEditor;
    lastMs: number;
    framesSinceLastUpdate: number;
    frameRate: number;
    $saveDialog: SaveDialog;
    constructor();
    shownSideEditor: SideEditor;
    switchSide(editr: SideEditor): void;
    checkAndInit(): void;
    addListenerForPlayer(): void;
    readChart(file: Blob): void;
    loadChart(): void;
    initFirstFrame(): void;
    readAudio(file: Blob): void;
    readImage(file: Blob): void;
    update(): void;
    updateEventSequences(): void;
    updateNotesEditor(): void;
    updateShownEditor(): void;
    get playing(): boolean;
    play(): void;
    pause(): void;
}
/**
 * 全生命周期只会编译一次，想多次就再构造一个
 */
declare class RPEChartCompiler {
    chart: Chart;
    sequenceMap: Map<EventNodeSequence<any>, EventNodeSequence<any>>;
    interpolationStep: TimeT;
    constructor(chart: Chart);
    compileChart(): ChartDataRPE;
    compileJudgeLine(judgeLine: JudgeLine): JudgeLineDataRPE;
    compileEvent<VT>(snode: EventStartNode<VT>, getValue: (node: EventStartNode<VT> | EventEndNode<VT>) => VT): EventDataRPELike<VT>;
    dumpEventNodeSequence<VT>(sequence: EventNodeSequence<VT>): EventDataRPELike<VT>[];
    compileNNLists(nnLists: NNList[], hnLists: HNList[]): NoteDataRPE[];
    /**
     * 倒序转换为数组
     * @param nnList
     * @returns 一个按照时间降序排列的数组
     */
    nnListToArray(nnList: NNList): NoteDataRPE[];
    /**
     * 将当前序列中所有通过模板缓动引用了其他序列的事件直接展开为被引用的序列内容
     * transform all events that reference other sequences by template easing
     * into the content of the referenced sequence
     * 有点类似于MediaWiki的{{subst:templateName}}
     * @param map 由TemplateEasingLib提供
     * @returns
     */
    substitute(seq: EventNodeSequence): EventNodeSequence;
}
declare class Coordinate {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    mul(matrix: Matrix): Coordinate;
    static from([x, y]: [number, number]): Coordinate;
}
declare class Matrix {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly e: number;
    readonly f: number;
    constructor(a: number, b: number, c: number, d: number, e: number, f: number);
    rotate(angle: number): Matrix;
    translate(x: number, y: number): Matrix;
    scale(x: number, y: number): Matrix;
    invert(): Matrix;
    xmul(x: number, y: number): number;
    ymul(x: number, y: number): number;
    static fromDOMMatrix({ a, b, c, d, e, f }: DOMMatrix): Matrix;
}
declare const identity: Matrix;
/**
 * 使用AudioBuffer加快播放
 */
declare class AudioProcessor {
    instance?: AudioProcessor;
    audioContext: AudioContext;
    initialized: boolean;
    tap: AudioBuffer;
    drag: AudioBuffer;
    flick: AudioBuffer;
    constructor();
    init(): void;
    fetchAudioBuffer(path: string): Promise<AudioBuffer>;
    play(buffer: AudioBuffer): void;
    playNoteSound(type: NoteType): void;
}
declare const HIT_FX_SIZE = 1024;
declare let TAP: HTMLImageElement | ImageBitmap;
declare let DRAG: HTMLImageElement | ImageBitmap;
declare let FLICK: HTMLImageElement | ImageBitmap;
declare let HOLD_HEAD: HTMLImageElement | ImageBitmap;
declare let HOLD_BODY: HTMLImageElement | ImageBitmap;
declare const DOUBLE: HTMLImageElement;
declare const BELOW: HTMLImageElement;
declare const ANCHOR: HTMLImageElement;
declare const NODE_START: HTMLImageElement;
declare const NODE_END: HTMLImageElement;
declare let HIT_FX: HTMLImageElement;
declare const SELECT_NOTE: HTMLImageElement;
declare const TRUCK: HTMLImageElement;
declare let fetched: boolean;
declare const fetchImage: () => void;
declare const drawNthFrame: (context: CanvasRenderingContext2D, source: CanvasImageSource, nth: number, dx: number, dy: number, dw: number, dh: number) => void;
declare const getImageFromType: (noteType: NoteType) => ImageBitmap | HTMLImageElement;
declare const ENABLE_PLAYER = true;
declare const DRAWS_NOTES = true;
declare const DEFAULT_ASPECT_RATIO: number;
declare const LINE_WIDTH = 6.75;
declare const LINE_COLOR = "#CCCC77";
declare const HIT_EFFECT_SIZE = 200;
declare const HALF_HIT: number;
declare const RENDER_SCOPE = 900;
declare const COMBO_TEXT = "KIPPHI";
declare const BASE_LINE_LENGTH = 4050;
declare const getVector: (theta: number) => [Vector, Vector];
type HEX = number;
declare class Player {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    hitCanvas: HTMLCanvasElement;
    hitContext: CanvasRenderingContext2D;
    chart: Chart;
    audio: HTMLAudioElement;
    audioProcessor: AudioProcessor;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;
    noteHeight: number;
    lastBeats: number;
    tintNotesMapping: Map<HEX, OffscreenCanvas | ImageBitmap>;
    tintEffectMapping: Map<HEX, OffscreenCanvas | ImageBitmap>;
    greenLine: number;
    currentCombo: number;
    lastUncountedNNN: NNNOrTail | null;
    lastUncountedTailNNN: NNNOrTail | null;
    lastCountedBeats: number;
    showsInfo: boolean;
    showsLineID: boolean;
    textureMapping: Map<string, ImageBitmap>;
    constructor(canvas: HTMLCanvasElement);
    get time(): number;
    get beats(): number;
    initCoordinate(): void;
    renderDropScreen(): void;
    renderGreyScreen(): void;
    initGreyScreen(): void;
    computeCombo(): void;
    render(): void;
    precalculate(matrix: Matrix, judgeLine: JudgeLine): void;
    renderLine(judgeLine: JudgeLine): void;
    lastUnplayedNNNode: NNNode | NNNodeLike<NodeType.TAIL>;
    playSounds(): void;
    renderHitEffects(matrix: Matrix, tree: NNList, startBeats: number, endBeats: number, timeCalculator: TimeCalculator): void;
    /**
     *
     * @param judgeLine
     * @param tree
     * @param beats 当前拍数
     * @param startBeats
     * @param endBeats 截止拍数
     * @param timeCalculator
     * @returns
     */
    renderHoldHitEffects(matrix: Matrix, tree: HNList, beats: number, startBeats: number, endBeats: number, timeCalculator: TimeCalculator): void;
    renderSameTimeNotes(noteNode: NoteNode, chord: boolean, judgeLine: JudgeLine, timeCalculator: TimeCalculator): void;
    renderNote(note: Note, chord: boolean, positionY: number, endpositionY?: number): void;
    getTintNote(tint: HEX, type: NoteType): OffscreenCanvas | ImageBitmap;
    getTintHitEffect(tint: HEX): OffscreenCanvas | ImageBitmap;
    private update;
    play(): void;
    pause(): void;
    receive(chart: Chart): void;
}
declare class ZProgressBar extends Z<"progress"> {
    target: HTMLAudioElement;
    constructor(target: HTMLAudioElement);
    update(): void;
}
declare class SoundEntity {
    type: NoteType;
    beats: number;
    seconds: number;
    constructor(type: NoteType, beats: number, timeCalculator: TimeCalculator);
}
declare const PROJECT_NAME = "kpa";
declare class ChartMetadata {
    name: string;
    song: string;
    picture: string;
    chart: string;
    constructor(name: string, song: string, picture: string, chart: string);
    static fromJson(json: any): ChartMetadata;
    toJson(): string;
}
declare class ServerApi extends EventTarget {
    supportsServer: boolean;
    statusPromise: Promise<boolean>;
    chartId: string;
    constructor();
    getChart(id: string): Promise<[chart: Blob, illustration: Blob, music: Blob]>;
    uploadChart(chart: ChartDataKPA, message: string): Promise<boolean>;
    autosave(chart: ChartDataKPA): Promise<boolean>;
    fetchVersion(versionId: string): Promise<ChartDataKPA>;
    resolvePath(path: string): string;
    fetchTexture(name: string): Promise<ImageBitmap>;
    queryTextures(): Promise<string[]>;
}
interface SettingEntries {
    lineColor: [number, number, number];
    playerShowInfo: boolean;
}
declare class Settings {
    cache: SettingEntries;
    constructor();
    get<K extends keyof SettingEntries>(item: K): SettingEntries[K];
    set<K extends keyof SettingEntries>(item: K, val: SettingEntries[K]): void;
}
type ImportFn = (name: string) => any;
type ModCode = (exports: any) => void | Promise<any>;
declare enum ModuleStatus {
    Unloaded = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
declare class Module {
    name: string;
    code: ModCode;
    usedBy: Module[];
    dependencies: string[];
    depMods: Module[];
    conflicts: string[];
    status: ModuleStatus;
    exports: any;
    constructor(name: string, code: ModCode);
}
declare class KPA {
    /** 所有魔改 */
    static readonly hacks: Map<string, Module>;
    /** 所有核心功能 */
    static readonly cores: Map<string, Module>;
    /** 所有扩展 */
    static readonly extensions: Map<string, Module>;
    /**
     * 定义一个魔改
     * @param name 标识符
     * @param dependencies 所依赖的魔改的标识符
     * @param conflicts 与之冲突的魔改的标识符
     * @param code 魔改所运行的函数
     */
    static hack(name: string, dependencies: string[], conflicts: string[], code: ModCode): void;
    /**
     * 定义一个扩展
     * @param name 标识符
     * @param dependencies 所依赖的扩展的标识符
     * @param conflicts 与之冲突的扩展的标识符
     * @param code 扩展所运行的函数
     */
    static ext(name: string, dependencies: string[], conflicts: string[], code: ModCode): void;
    /**
     * 定义一个核心功能
     * @param name 标识符
     * @param dependencies 所依赖的核心功能的标识符
     * @param code 核心功能所运行的函数
     */
    static main(name: string, dependencies: string[], code: ModCode): void;
    /**
     * 执行所有模组
     * 全生命周期只调用一次
     */
    static work(): Promise<void>;
    /**
     * 尝试加载模组，如果依赖尚未加载，则不会加载。
     * 加载完此模组后会尝试加载以来它的模组
     * @param mod
     * @returns
     */
    static tryLoad(mod: Module): Promise<void>;
    /**
     * 引用其他模组的导出内容
     * @param name
     * @returns
     */
    static require(name: string): any;
    static classBuffer: Function;
    /**
     * 强行修改一个脚本作用域中的类
     * @param con 类构造器
     * @param name 类名，默认从con.name获得
     */
    static hackClass(con: Function, name?: string): void;
}
declare var editor: Editor, settings: Settings, serverApi: ServerApi;

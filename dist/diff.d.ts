declare const VERSION = 180;
declare const VERSION_STRING = "1.8.0-alpha2";
/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */
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
declare const rgb2hex: (rgb: RGB) => number;
declare const hex2rgb: (hex: number) => RGB;
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
    static disconnect<T extends Connectee>(note1: T, note2: T): void;
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
    father: JudgeLine;
    children: Set<JudgeLine>;
    moveX: number;
    moveY: number;
    rotate: number;
    alpha: number;
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
    dumpKPA(eventNodeSequences: Set<EventNodeSequence>, judgeLineGroups: JudgeLineGroup[]): JudgeLineDataKPA;
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
    bpm = 6
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
    sequenceMap: Map<string, EventNodeSequence>;
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
    createEventNodeSequence(type: EventType, name: string): EventNodeSequence;
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
declare class EventNodeLike<T extends NodeType> {
    type: T;
    /** 后一个事件节点 */
    next: [EventStartNode, null, ENOrTail][T] | null;
    /** 前一个事件节点 */
    previous: [null, EventStartNode, ENOrHead][T] | null;
    parentSeq: EventNodeSequence;
    constructor(type: T);
}
type ENOrTail = EventNode | EventNodeLike<NodeType.TAIL>;
type ENOrHead = EventNode | EventNodeLike<NodeType.HEAD>;
type AnyEN = EventNode | EventNodeLike<NodeType.HEAD> | EventNodeLike<NodeType.TAIL>;
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
declare abstract class EventNode extends EventNodeLike<NodeType.MIDDLE> {
    time: TimeT;
    value: number;
    easing: Easing;
    constructor(time: TimeT, value: number);
    clone(offset: TimeT): EventStartNode | EventEndNode;
    /**
     * gets the easing object from RPEEventData
     * @param data
     * @param left
     * @param right
     * @param templates
     * @returns
     */
    static getEasing(data: EventDataKPA, left: number, right: number, templates: TemplateEasingLib): Easing;
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data
     * @param templates
     * @returns
     */
    static fromEvent(data: EventDataRPELike, templates: TemplateEasingLib): [EventStartNode, EventEndNode];
    static connect(node1: EventStartNode, node2: EventEndNode | EventNodeLike<NodeType.TAIL>): void;
    static connect(node1: EventEndNode | EventNodeLike<NodeType.HEAD>, node2: EventStartNode): void;
    static removeNodePair(endNode: EventEndNode, startNode: EventStartNode): [EventStartNode | EventNodeLike<NodeType.HEAD>, EventStartNode | EventNodeLike<NodeType.TAIL>];
    static insert(node: EventStartNode, tarPrev: EventStartNode): [EventNodeLike<NodeType.HEAD> | EventStartNode, EventStartNode | EventNodeLike<NodeType.TAIL>];
    /**
     *
     * @param node
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart(node: EventStartNode): EventStartNode | EventNodeLike<NodeType.TAIL>;
    /**
     *
     * @param node
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd(node: EventEndNode | EventNodeLike<NodeType.TAIL>): EventStartNode | EventNodeLike<NodeType.TAIL>;
    static previousStartOfStart(node: EventStartNode): EventStartNode | EventNodeLike<NodeType.HEAD>;
    /**
     * It does not return the start node which form an event with it.
     * @param node
     * @returns
     */
    static secondPreviousStartOfEnd(node: EventEndNode): EventStartNode | EventNodeLike<NodeType.HEAD>;
    static nextStartInJumpArray(node: EventStartNode): EventStartNode | EventNodeLike<NodeType.TAIL>;
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node
     * @returns
     */
    static getEndStart(node: EventStartNode | EventEndNode): [EventEndNode, EventStartNode];
    static getStartEnd(node: EventStartNode | EventEndNode): [EventStartNode, EventEndNode];
    static setToNewOrderedArray(dest: TimeT, set: Set<EventStartNode>): [EventStartNode[], EventStartNode[]];
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
declare class EventStartNode extends EventNode {
    next: EventEndNode | EventNodeLike<NodeType.TAIL>;
    previous: EventEndNode | EventNodeLike<NodeType.HEAD>;
    /**
     * 对于速度事件，从计算时的时刻到此节点的总积分
     */
    cachedIntegral?: number;
    constructor(time: TimeT, value: number);
    get easingIsSegmented(): boolean;
    parentSeq: EventNodeSequence;
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns
     */
    dump(): EventDataKPA;
    /**
     * 产生一个一拍长的短钩定事件
     * 仅用于编译至RPE时解决最后一个StartNode的问题
     * 限最后一个StartNode使用
     * @returns
     */
    dumpAsLast(): EventDataRPELike;
    getValueAt(beats: number): number;
    getSpeedValueAt(beats: number): number;
    /**
     * 积分获取位移
     */
    getIntegral(beats: number, timeCalculator: TimeCalculator): number;
    getFullIntegral(timeCalculator: TimeCalculator): number;
    isFirstStart(): boolean;
    isLastStart(): boolean;
    clone(offset?: TimeT): EventStartNode;
    clonePair(offset: TimeT): EventStartNode;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, matrix: Matrix): void;
}
declare class EventEndNode extends EventNode {
    next: EventStartNode;
    previous: EventStartNode;
    get parentSeq(): EventNodeSequence;
    set parentSeq(_parent: EventNodeSequence);
    constructor(time: TimeT, value: number);
    getValueAt(beats: number): number;
    clone(offset?: TimeT): EventEndNode;
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
declare class EventNodeSequence {
    type: EventType;
    effectiveBeats: number;
    chart: Chart;
    /** id follows the format `#${lineid}.${layerid}.${typename}` by default */
    id: string;
    /** has no time or value */
    head: EventNodeLike<NodeType.HEAD>;
    /** has no time or value */
    tail: EventNodeLike<NodeType.TAIL>;
    jump?: JumpArray<AnyEN>;
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    constructor(type: EventType, effectiveBeats: number);
    static fromRPEJSON<T extends EventType>(type: T, data: EventDataRPELike[], chart: Chart, endValue?: number): EventNodeSequence;
    /**
     * 生成一个新的事件节点序列，仅拥有一个节点。
     * 需要分配ID！！！！！！
     * @param type
     * @param effectiveBeats
     * @returns
     */
    static newSeq(type: EventType, effectiveBeats: number): EventNodeSequence;
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
    updateJump(from: ENOrHead, to: ENOrTail): void;
    insert(): void;
    getNodeAt(beats: number, usePrev?: boolean): EventStartNode;
    getValueAt(beats: number, usePrev?: boolean): number;
    getIntegral(beats: number, timeCalculator: TimeCalculator): number;
    updateNodesIntegralFrom(beats: number, timeCalculator: TimeCalculator): void;
    dump(): EventNodeSequenceDataKPA;
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
    callbacks: ((index: number) => void)[];
    $inputs: Z<"input">[];
    selectedIndex: number;
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
declare const ENABLE_PLAYER = true;
declare const DRAWS_NOTES = true;
declare const DEFAULT_ASPECT_RATIO: number;
declare const LINE_WIDTH = 10;
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
    renderLine(matrix: Matrix, judgeLine: JudgeLine): void;
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
declare class Comparer {
    $topBar: Z<"div">;
    $button: ZButton;
    player1: Player;
    player2: Player;
    progressBar: ZProgressBar;
    constructor();
    readImage(blob: Blob): void;
    readAudio(blob: Blob): void;
    loadChart(data: ChartDataKPA, data2: ChartDataKPA): void;
    get playing(): boolean;
    play(): void;
    pause(): void;
}
declare const serverApi: ServerApi;
declare let settings: Settings;

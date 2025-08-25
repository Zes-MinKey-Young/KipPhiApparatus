
const DEFAULT_TEMPLATE_LENGTH = 16;

const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

const easeOutBounce = (x: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

const easeOutExpo = (x: number): number =>{
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

const easeOutBack = (x: number): number =>{
    const c1 = 1.70158;
    const c3 = c1 + 1;
    
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const linear = (x: number): number => x
const linearLine: CurveDrawer = (context: CanvasRenderingContext2D, startX: number, startY: number, endX: number , endY: number) => 
    drawLine(context, startX, startY, endX, endY);



const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);


const easeInQuad = (x: number): number => Math.pow(x, 2)


const easeInCubic = (x: number): number => Math.pow(x, 3)


const easeInQuart = (x: number): number => Math.pow(x, 4)


const easeInQuint = (x: number): number => Math.pow(x, 5)


const easeInCirc = (x: number): number => 1 - Math.sqrt(1 - Math.pow(x, 2))


function mirror(easeOut: (x: number) => number) {
    return (x: number) => 1 - easeOut(1 - x);
}

function toEaseInOut(easeIn: (x: number) => number, easeOut: (x: number) => number) {
    return (x: number) => x < 0.5 ? easeIn(2 * x) / 2 : (1 + easeOut(2 * x - 1)) / 2
}

const easeOutQuad = mirror(easeInQuad);
const easeInSine = mirror(easeOutSine);
const easeOutQuart = mirror(easeInQuart);
const easeOutCubic = mirror(easeInCubic);
const easeOutQuint = mirror(easeInQuint);
const easeOutCirc = mirror(easeInCirc);
const easeInExpo = mirror(easeOutExpo);
const easeInElastic = mirror(easeOutElastic);
const easeInBounce = mirror(easeOutBounce);
const easeInBack = mirror(easeOutBack);
const easeInOutSine = toEaseInOut(easeInSine, easeOutSine);
const easeInOutQuad = toEaseInOut(easeInQuad, easeOutQuad);
const easeInOutCubic = toEaseInOut(easeInCubic, easeOutCubic);
const easeInOutQuart = toEaseInOut(easeInQuart, easeOutQuart);
const easeInOutQuint = toEaseInOut(easeInQuint, easeOutQuint);
const easeInOutExpo = toEaseInOut(easeInExpo, easeOutExpo);
const easeInOutCirc = toEaseInOut(easeInCirc, easeOutCirc);
const easeInOutBack = toEaseInOut(easeInBack, easeOutBack);
const easeInOutElastic = toEaseInOut(easeInElastic, easeOutElastic);
const easeInOutBounce = toEaseInOut(easeInBounce, easeOutBounce);

const easingFnMap = {
    "linear": [linear, linear, linear],
    "sine": [easeInSine, easeOutSine, toEaseInOut(easeInSine, easeOutSine)],
    "quad": [easeInQuad, easeOutQuad, toEaseInOut(easeInQuad, easeOutQuad)],
    "cubic": [easeInCubic, easeOutCubic, toEaseInOut(easeInCubic, easeOutCubic)],
    "quart": [easeInQuart, easeOutQuart, toEaseInOut(easeInQuart, easeOutQuart)],
    "quint": [easeInQuint, easeOutQuint, toEaseInOut(easeInQuint, easeOutQuint)],
    "expo": [easeInExpo, easeOutExpo, toEaseInOut(easeInExpo, easeOutExpo)],
    "circ": [easeInCirc, easeOutCirc, toEaseInOut(easeInCirc, easeOutCirc)],
    "back": [easeInBack, easeOutBack, toEaseInOut(easeInBack, easeOutBack)],
    "elastic": [easeInElastic, easeOutElastic, toEaseInOut(easeInElastic, easeOutElastic)],
    "bounce": [easeInBounce, easeOutBounce, toEaseInOut(easeInBounce, easeOutBounce)]
}
/**
 * 缓动基类
 * Easings are used to describe the rate of change of a parameter over time.
 * They are used in events, curve note filling, etc.
 */
abstract class Easing {
    constructor() {

    }
    /**
     * 返回当前变化量与变化量之比
     * 或者当前数值。（参数方程）
     * @param t 一个0-1的浮点数，代表当前经过时间与总时间之比
     */
    abstract getValue(t: number): number;
    segmentedValueGetter(easingLeft: number, easingRight: number) {
        const leftValue = this.getValue(easingLeft);
        const rightValue =  this.getValue(easingRight);
        const timeDelta = easingRight - easingLeft;
        const delta = rightValue - leftValue;
        console.log("lr", easingLeft, leftValue, easingRight, rightValue);
        return (t: number) => (this.getValue(easingLeft + timeDelta * t) - leftValue) / delta;
    }
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number , endY: number): void {
        const delta = endY - startY;
        const timeDelta = endX - startX;
        let last = startY;
        context.beginPath()
        context.moveTo(startX, last)
        for (let t = 4; t <= timeDelta; t += 4) {
            const ratio = t / timeDelta
            const curPosY = this.getValue(ratio) * delta + startY;
            context.lineTo(startX + t, curPosY);
            last = curPosY;
        }
        context.stroke();
    }
}

type TupleCoordinate = [number, number]

type CurveDrawer = (context: CanvasRenderingContext2D, startX: number, startY: number, endX: number , endY: number) => void


/**
 * @immutable
 */
class SegmentedEasing extends Easing {
    getter: (t: number) => number;
    constructor(public readonly easing: Easing, public readonly left: number, public readonly right: number) {
        super()
        this.getter = easing.segmentedValueGetter(left, right)
    }
    getValue(t: number): number {
        return this.getter(t)
    }
    replace(easing: Easing): Easing {
        return new SegmentedEasing(easing, this.left, this.right)
    }
}


/**
 * 普通缓动
 * See https://easings.net/zh-cn to learn about the basic types of easing.
 * 
 */
class NormalEasing extends Easing {
    rpeId: number;
    id: number;
    funcType: string;
    easeType: string;
    _getValue: (t: number) => number;
    _drawCurve: CurveDrawer;
    constructor(fn: (t: number) => number);
    constructor(fn: (t: number) => number, curveDrawer?: CurveDrawer);
    constructor(fn: (t: number) => number, curveDrawer?: CurveDrawer) {
        super()
        this._getValue = fn;
        if (curveDrawer) {
            this._drawCurve = curveDrawer;
        }
    }
    getValue(t: number): number {
        if (t > 1 || t < 0) {
            console.warn("缓动超出定义域！")
            // debugger;
        }
        // console.log("t:", t, "rat", this._getValue(t))
        return this._getValue(t)
    }
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number , endY: number) {
        if (this._drawCurve) {
            this._drawCurve(context, startX, startY, endX, endY)
        } else {
            super.drawCurve(context, startX, startY, endX, endY);
        }
    }
}

interface Coordinate {
    readonly x: number;
    readonly y: number;
}
/**
 * 贝塞尔曲线缓动
 * uses the Bezier curve formula to describe an easing.
 */
class BezierEasing extends Easing {
    cp1: Coordinate;
    cp2: Coordinate;
    constructor() {
        super()
    }
    getValue(t: number): number {
        // 问MDN AI Help搞的（

        // 使用贝塞尔曲线公式计算纵坐标
        // 具体计算方法可以参考数学相关的贝塞尔曲线公式
        // 这里只是一个示例，具体实现需要根据实际情况进行调整
        const startX = 0;
        const startY = 0;
        const endX = 1;
        const endY = 1;
        const para = (t - startX) / (endX - startX);
        const y = (1 - para) ** 3 * startY + 3 * (1 - para) ** 2 * para * this.cp1.y + 3 * (1 - para) * para ** 2 * this.cp2.y + para ** 3 * endY;
        return y;
    }
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number , endY: number): void {
        const {x: cp1x, y: cp1y} = this.cp1;
        const {x: cp2x, y: cp2y} = this.cp2
        const delta = endY - startY;
        const timeDelta = endX - startX;
        drawBezierCurve(
            context,
            startX, startY,
            endX, endY,
            startX + cp1x * timeDelta, startY + cp1y * delta,
            startX + cp2x * timeDelta, startY + cp2y * delta,
        )
    }
}

/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
class TemplateEasing extends Easing {
    eventNodeSequence: EventNodeSequence;
    name: string;
    constructor(name: string, sequence: EventNodeSequence) {
        super()
        this.eventNodeSequence = sequence;
        this.name = name;
    }
    getValue(t: number) {
        const seq = this.eventNodeSequence;
        let delta = this.valueDelta;
        const frac = seq.getValueAt(t * seq.effectiveBeats) - this.headValue
        return delta === 0 ? frac : frac / delta;
    }
    get valueDelta(): number {
        let seq = this.eventNodeSequence;
        return seq.tail.previous.value - seq.head.next.value;
    }
    get headValue(): number {
        return this.eventNodeSequence.head.next.value;
    }
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
class ParametricEquationEasing extends Easing {
    _getValue: (x: number) => number;
    constructor(public equation: string) {
        super()
        // @ts-ignore
        this._getValue = new Function("t", equation)
    }
    getValue(t: number): number {
        return this._getValue(t) ?? 0;
    }
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
class TemplateEasingLib {
    easings: {
        [name: string]: TemplateEasing
    }
    constructor() {
        this.easings = {};
    }
    getOrNew(name: string): TemplateEasing {
        if (this.easings[name]) {
            return this.easings[name];
        } else {
            const easing = new TemplateEasing(name, EventNodeSequence.newSeq(EventType.easing, DEFAULT_TEMPLATE_LENGTH));
            easing.eventNodeSequence.id = "*" + name;
            return this.easings[name] = easing;
        }
    }
    /**
     * 注册一个模板缓动，但不会实现它
     * register a template easing when reading eventNodeSequences, but does not implement it immediately
     */
    require(name: string) {
        this.easings[name] = new TemplateEasing(name, null);
    }
    implement(name: string, sequence: EventNodeSequence) {
        this.easings[name].eventNodeSequence = sequence;
    }
    /**
     * 检查所有模板缓动是否实现
     * check if all easings are implemented
     * 应当在读取完所有模板缓动后调用
     * should be invoked after all template easings are read
     */
    check() {
        for (let key in this.easings) {
            if (!this.easings[key].eventNodeSequence) {
                console.warn(`未实现的缓动：${key}`);
            }
        }
    }
    get(key: string): TemplateEasing | undefined {
        return this.easings[key];
    }
    
    dump(eventNodeSequences: Set<EventNodeSequence>): CustomEasingData[] {
        const customEasingDataList: CustomEasingData[] = [];
        for (let key in this.easings) {
            const templateEasing = this.easings[key];
            const eventNodeSequence = templateEasing.eventNodeSequence;
            if (eventNodeSequences.has(eventNodeSequence)) {
                continue;
            }
            eventNodeSequences.add(eventNodeSequence);
            customEasingDataList.push({
                name: key,
                content: eventNodeSequence.id, // 这里只存储编号，具体内容在保存时再编码
                usedBy: [],
                dependencies: []
            });
        }
        return customEasingDataList;
    }
}

const linearEasing = new NormalEasing(linear, linearLine);
const fixedEasing = new NormalEasing((x: number): number => (x === 1 ? 1 : 0));

const easingMap = {
    "fixed": {out: fixedEasing, in: fixedEasing, inout: fixedEasing},
    "linear": {out: linearEasing, in: linearEasing, inout: linearEasing},
    "sine": {in: new NormalEasing(easeInSine), out: new NormalEasing(easeOutSine), inout: new NormalEasing(easeInOutSine)},
    "quad": {in: new NormalEasing(easeInQuad), out: new NormalEasing(easeOutQuad), inout: new NormalEasing(easeInOutQuad)},
    "cubic": {in: new NormalEasing(easeInCubic), out: new NormalEasing(easeOutCubic), inout: new NormalEasing(easeInOutCubic)},
    "quart": {in: new NormalEasing(easeInQuart), out: new NormalEasing(easeOutQuart), inout: new NormalEasing(easeInOutQuart)},
    "quint": {in: new NormalEasing(easeInQuint), out: new NormalEasing(easeOutQuint), inout: new NormalEasing(easeInOutQuint)},
    "expo": {in: new NormalEasing(easeInExpo), out: new NormalEasing(easeOutExpo), inout: new NormalEasing(easeInOutExpo)},
    "circ": {in: new NormalEasing(easeInCirc), out: new NormalEasing(easeOutCirc), inout: new NormalEasing(easeInOutCirc)},
    "back": {in: new NormalEasing(easeInBack), out: new NormalEasing(easeOutBack), inout: new NormalEasing(easeInOutBack)},
    "elastic": {in: new NormalEasing(easeInElastic), out: new NormalEasing(easeOutElastic), inout: new NormalEasing(easeInOutElastic)},
    "bounce": {in: new NormalEasing(easeInBounce), out: new NormalEasing(easeOutBounce), inout: new NormalEasing(easeInOutBounce)}
}

for (let funcType in easingMap) {
    for (let easeType in easingMap[funcType]) {
        const easing = easingMap[funcType][easeType];
        easing.funcType = funcType;
        easing.easeType = easeType;
    }
}
fixedEasing.funcType = "fixed";
fixedEasing.easeType = "in"

/**
 * 按照KPA的编号
 */
const easingArray = [
    fixedEasing,
    linearEasing,
    easingMap.sine.out,
    easingMap.sine.in,
    easingMap.sine.inout,
    easingMap.quad.out,
    easingMap.quad.in,
    easingMap.quad.inout,
    easingMap.cubic.out,
    easingMap.cubic.in,
    easingMap.cubic.inout,
    easingMap.quart.out,
    easingMap.quart.in,
    easingMap.quart.inout,
    easingMap.quint.out,
    easingMap.quint.in,
    easingMap.quint.inout,
    easingMap.circ.out,
    easingMap.circ.in,
    easingMap.circ.inout,
    easingMap.expo.out,
    easingMap.expo.in,
    easingMap.expo.inout,
    easingMap.back.out,
    easingMap.back.in,
    easingMap.back.inout,
    easingMap.elastic.out,
    easingMap.elastic.in,
    easingMap.elastic.inout,
    easingMap.bounce.out,
    easingMap.bounce.in,
    easingMap.bounce.inout
]

easingArray.forEach((easing, index) => {
    easing.id = index;
})

const rpeEasingArray = [
    null,
    linearEasing, // 1
    easingMap.sine.out, // 2
    easingMap.sine.in, // 3
    easingMap.quad.out, // 4
    easingMap.quad.in, // 5
    easingMap.sine.inout, // 6
    easingMap.quad.inout, // 7
    easingMap.cubic.out, // 8
    easingMap.cubic.in, // 9
    easingMap.quart.out, // 10
    easingMap.quart.in, // 11
    easingMap.cubic.inout, // 12
    easingMap.quart.inout, // 13
    easingMap.quint.out, // 14
    easingMap.quint.in, // 15
    // easingMap.quint.inout,
    easingMap.expo.out, // 16
    easingMap.expo.in, // 17
    // easingMap.expo.inout,
    easingMap.circ.out, // 18
    easingMap.circ.in, // 19
    easingMap.back.out, // 20
    easingMap.back.in, // 21
    easingMap.circ.inout, // 22
    easingMap.back.inout, // 23
    easingMap.elastic.out, // 24
    easingMap.elastic.in, // 25
    easingMap.bounce.out, // 26
    easingMap.bounce.in, // 27
    easingMap.bounce.inout, //28
    easingMap.elastic.inout // 29
]

rpeEasingArray.forEach((easing, index) => {
    if (!easing) {
        return;
    }
    easing.rpeId = index;
})
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const VERSION = 180;
const VERSION_STRING = "1.8.0-alpha2";
/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */
var _a, _b, _c;
Set.prototype.union = (_a = Set.prototype.union) !== null && _a !== void 0 ? _a : function (other) {
    const it = other.keys();
    return new Set([...this, ...{ [Symbol.iterator]() { return it; } }]);
};
Set.prototype.intersection = (_b = Set.prototype.intersection) !== null && _b !== void 0 ? _b : function (other) {
    return new Set([...this].filter(x => other.has(x)));
};
Set.prototype.difference = (_c = Set.prototype.difference) !== null && _c !== void 0 ? _c : function (other) {
    return new Set([...this].filter(x => !other.has(x)));
};
/**
 * 使用AudioBuffer加快播放
 */
class AudioProcessor {
    constructor() {
        if (this.instance) {
            return this.instance;
        }
        this.audioContext = "AudioContext" in window ? new AudioContext() : new globalThis.webkitAudioContext();
        this.init();
    }
    init() {
        Promise.all([
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/tap.mp3")),
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/drag.mp3")),
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/flick.mp3"))
        ]).then(([T, D, F]) => {
            this.tap = T;
            this.drag = D;
            this.flick = F;
            this.initialized = true;
        });
    }
    fetchAudioBuffer(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(path);
            return this.audioContext.decodeAudioData(yield res.arrayBuffer());
        });
    }
    play(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
    }
    playNoteSound(type) {
        if (!this.initialized) {
            return;
        }
        this.play([this.tap, this.tap, this.flick, this.drag][type - 1]);
    }
}
const HIT_FX_SIZE = 1024;
let TAP = new Image(135);
let DRAG = new Image(135);
let FLICK = new Image(135);
let HOLD_HEAD = new Image(135);
let HOLD_BODY = new Image(135);
const DOUBLE = new Image(135);
const BELOW = new Image(135);
const ANCHOR = new Image(20, 20);
const NODE_START = new Image(20, 10);
const NODE_END = new Image(20, 10);
let HIT_FX = new Image(HIT_FX_SIZE, HIT_FX_SIZE);
const SELECT_NOTE = new Image(135);
const TRUCK = new Image(135);
let fetched = false;
const fetchImage = () => {
    if (fetched)
        return;
    fetched = true;
    TAP.src = serverApi.resolvePath("/img/tap.png");
    DRAG.src = serverApi.resolvePath("/img/drag.png");
    FLICK.src = serverApi.resolvePath("/img/flick.png");
    HOLD_HEAD.src = serverApi.resolvePath("/img/holdHead.png");
    HOLD_BODY.src = serverApi.resolvePath("/img/holdBody.png");
    TAP.onload = () => {
        createImageBitmap(TAP).then((bmp) => {
            TAP = bmp;
        });
    };
    DRAG.onload = () => {
        createImageBitmap(DRAG).then((bmp) => {
            DRAG = bmp;
        });
    };
    FLICK.onload = () => {
        createImageBitmap(FLICK).then((bmp) => {
            FLICK = bmp;
        });
    };
    HOLD_BODY.onload = () => {
        createImageBitmap(HOLD_BODY).then((bmp) => {
            HOLD_BODY = bmp;
        });
    };
    HOLD_HEAD.onload = () => {
        createImageBitmap(HOLD_HEAD).then((bmp) => {
            HOLD_HEAD = bmp;
        });
    };
    ANCHOR.src = serverApi.resolvePath("/img/anchor.png");
    BELOW.src = serverApi.resolvePath("/img/below.png");
    DOUBLE.src = serverApi.resolvePath("/img/double.png");
    NODE_START.src = serverApi.resolvePath("/img/south.png");
    NODE_END.src = serverApi.resolvePath("/img/north.png");
    HIT_FX.src = serverApi.resolvePath("/img/hit_fx.png");
    HIT_FX.onload = () => {
        createImageBitmap(HIT_FX).then((bmp) => {
            HIT_FX = bmp;
        });
    };
    SELECT_NOTE.src = serverApi.resolvePath("/img/selectNote.png");
    TRUCK.src = serverApi.resolvePath("/img/Truck.png");
};
const drawNthFrame = (context, source, nth, dx, dy, dw, dh) => {
    const x = nth % 4;
    const y = (nth - x) / 4;
    context.drawImage(source, x * 256, y * 256, 256, 256, dx, dy, dw, dh);
};
const getImageFromType = (noteType) => {
    switch (noteType) {
        case NoteType.tap:
            return TAP;
        case NoteType.drag:
            return DRAG;
        case NoteType.flick:
            return FLICK;
        case NoteType.hold:
            return HOLD_HEAD;
        default:
            return TAP;
    }
};
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    mul(matrix) {
        const { x, y } = this;
        return new Coordinate(x * matrix.a + y * matrix.c + matrix.e, x * matrix.b + y * matrix.d + matrix.f);
    }
    static from([x, y]) {
        return new Coordinate(x, y);
    }
}
class Matrix {
    constructor(a, b, c, d, e, f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
    rotate(angle) {
        const { a, b, c, d, e, f } = this;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Matrix(a * cos + c * sin, b * cos + d * sin, a * -sin + c * cos, b * -sin + d * cos, e, f);
    }
    translate(x, y) {
        const { a, b, c, d, e, f } = this;
        return new Matrix(a, b, c, d, a * x + c * y + e, b * x + d * y + f);
    }
    scale(x, y) {
        const { a, b, c, d, e, f } = this;
        return new Matrix(a * x, b * y, c * x, d * y, e, f);
    }
    invert() {
        const { a, b, c, d, e, f } = this;
        const det = a * d - b * c;
        return new Matrix(d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det);
    }
    xmul(x, y) {
        return x * this.a + y * this.c + this.e;
    }
    ymul(x, y) {
        return x * this.b + y * this.d + this.f;
    }
    static fromDOMMatrix({ a, b, c, d, e, f }) {
        return new Matrix(a, b, c, d, e, f);
    }
}
const identity = new Matrix(1, 0, 0, 1, 0, 0);
const DEFAULT_TEMPLATE_LENGTH = 16;
const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};
const easeOutBounce = (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
        return n1 * x * x;
    }
    else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    }
    else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    }
    else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
};
const easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const linear = (x) => x;
const linearLine = (context, startX, startY, endX, endY) => drawLine(context, startX, startY, endX, endY);
const easeOutSine = (x) => Math.sin((x * Math.PI) / 2);
const easeInQuad = (x) => Math.pow(x, 2);
const easeInCubic = (x) => Math.pow(x, 3);
const easeInQuart = (x) => Math.pow(x, 4);
const easeInQuint = (x) => Math.pow(x, 5);
const easeInCirc = (x) => 1 - Math.sqrt(1 - Math.pow(x, 2));
function mirror(easeOut) {
    return (x) => 1 - easeOut(1 - x);
}
function toEaseInOut(easeIn, easeOut) {
    return (x) => x < 0.5 ? easeIn(2 * x) / 2 : (1 + easeOut(2 * x - 1)) / 2;
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
};
/**
 * 缓动基类
 * Easings are used to describe the rate of change of a parameter over time.
 * They are used in events, curve note filling, etc.
 */
class Easing {
    constructor() {
    }
    segmentedValueGetter(easingLeft, easingRight) {
        const leftValue = this.getValue(easingLeft);
        const rightValue = this.getValue(easingRight);
        const timeDelta = easingRight - easingLeft;
        const delta = rightValue - leftValue;
        console.log("lr", easingLeft, leftValue, easingRight, rightValue);
        return (t) => (this.getValue(easingLeft + timeDelta * t) - leftValue) / delta;
    }
    drawCurve(context, startX, startY, endX, endY) {
        const delta = endY - startY;
        const timeDelta = endX - startX;
        let last = startY;
        context.beginPath();
        context.moveTo(startX, last);
        for (let t = 4; t <= timeDelta; t += 4) {
            const ratio = t / timeDelta;
            const curPosY = this.getValue(ratio) * delta + startY;
            context.lineTo(startX + t, curPosY);
            last = curPosY;
        }
        context.stroke();
    }
}
/**
 * @immutable
 */
class SegmentedEasing extends Easing {
    constructor(easing, left, right) {
        super();
        this.easing = easing;
        this.left = left;
        this.right = right;
        this.getter = easing.segmentedValueGetter(left, right);
    }
    getValue(t) {
        return this.getter(t);
    }
    replace(easing) {
        return new SegmentedEasing(easing, this.left, this.right);
    }
}
/**
 * 普通缓动
 * See https://easings.net/zh-cn to learn about the basic types of easing.
 *
 */
class NormalEasing extends Easing {
    constructor(fn, curveDrawer) {
        super();
        this._getValue = fn;
        if (curveDrawer) {
            this._drawCurve = curveDrawer;
        }
    }
    getValue(t) {
        if (t > 1 || t < 0) {
            console.warn("缓动超出定义域！");
            // debugger;
        }
        // console.log("t:", t, "rat", this._getValue(t))
        return this._getValue(t);
    }
    drawCurve(context, startX, startY, endX, endY) {
        if (this._drawCurve) {
            this._drawCurve(context, startX, startY, endX, endY);
        }
        else {
            super.drawCurve(context, startX, startY, endX, endY);
        }
    }
}
/**
 * 贝塞尔曲线缓动
 * uses the Bezier curve formula to describe an easing.
 */
class BezierEasing extends Easing {
    constructor() {
        super();
    }
    getValue(t) {
        // 问MDN AI Help搞的（
        // 使用贝塞尔曲线公式计算纵坐标
        // 具体计算方法可以参考数学相关的贝塞尔曲线公式
        // 这里只是一个示例，具体实现需要根据实际情况进行调整
        const startX = 0;
        const startY = 0;
        const endX = 1;
        const endY = 1;
        const para = (t - startX) / (endX - startX);
        const y = Math.pow((1 - para), 3) * startY + 3 * Math.pow((1 - para), 2) * para * this.cp1.y + 3 * (1 - para) * Math.pow(para, 2) * this.cp2.y + Math.pow(para, 3) * endY;
        return y;
    }
    drawCurve(context, startX, startY, endX, endY) {
        const { x: cp1x, y: cp1y } = this.cp1;
        const { x: cp2x, y: cp2y } = this.cp2;
        const delta = endY - startY;
        const timeDelta = endX - startX;
        drawBezierCurve(context, startX, startY, endX, endY, startX + cp1x * timeDelta, startY + cp1y * delta, startX + cp2x * timeDelta, startY + cp2y * delta);
    }
}
/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
class TemplateEasing extends Easing {
    constructor(name, sequence) {
        super();
        this.eventNodeSequence = sequence;
        this.name = name;
    }
    getValue(t) {
        const seq = this.eventNodeSequence;
        let delta = this.valueDelta;
        const frac = seq.getValueAt(t * seq.effectiveBeats) - this.headValue;
        return delta === 0 ? frac : frac / delta;
    }
    get valueDelta() {
        let seq = this.eventNodeSequence;
        return seq.tail.previous.value - seq.head.next.value;
    }
    get headValue() {
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
    constructor(equation) {
        super();
        this.equation = equation;
        // @ts-ignore
        this._getValue = new Function("t", equation);
    }
    getValue(t) {
        var _a;
        return (_a = this._getValue(t)) !== null && _a !== void 0 ? _a : 0;
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
    constructor() {
        this.easings = {};
    }
    getOrNew(name) {
        if (this.easings[name]) {
            return this.easings[name];
        }
        else {
            const easing = new TemplateEasing(name, EventNodeSequence.newSeq(EventType.easing, DEFAULT_TEMPLATE_LENGTH));
            easing.eventNodeSequence.id = "*" + name;
            return this.easings[name] = easing;
        }
    }
    /**
     * 注册一个模板缓动，但不会实现它
     * register a template easing when reading eventNodeSequences, but does not implement it immediately
     */
    require(name) {
        this.easings[name] = new TemplateEasing(name, null);
    }
    implement(name, sequence) {
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
    get(key) {
        return this.easings[key];
    }
    dump(eventNodeSequences) {
        const customEasingDataList = [];
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
const fixedEasing = new NormalEasing((x) => (x === 1 ? 1 : 0));
const easingMap = {
    "fixed": { out: fixedEasing, in: fixedEasing, inout: fixedEasing },
    "linear": { out: linearEasing, in: linearEasing, inout: linearEasing },
    "sine": { in: new NormalEasing(easeInSine), out: new NormalEasing(easeOutSine), inout: new NormalEasing(easeInOutSine) },
    "quad": { in: new NormalEasing(easeInQuad), out: new NormalEasing(easeOutQuad), inout: new NormalEasing(easeInOutQuad) },
    "cubic": { in: new NormalEasing(easeInCubic), out: new NormalEasing(easeOutCubic), inout: new NormalEasing(easeInOutCubic) },
    "quart": { in: new NormalEasing(easeInQuart), out: new NormalEasing(easeOutQuart), inout: new NormalEasing(easeInOutQuart) },
    "quint": { in: new NormalEasing(easeInQuint), out: new NormalEasing(easeOutQuint), inout: new NormalEasing(easeInOutQuint) },
    "expo": { in: new NormalEasing(easeInExpo), out: new NormalEasing(easeOutExpo), inout: new NormalEasing(easeInOutExpo) },
    "circ": { in: new NormalEasing(easeInCirc), out: new NormalEasing(easeOutCirc), inout: new NormalEasing(easeInOutCirc) },
    "back": { in: new NormalEasing(easeInBack), out: new NormalEasing(easeOutBack), inout: new NormalEasing(easeInOutBack) },
    "elastic": { in: new NormalEasing(easeInElastic), out: new NormalEasing(easeOutElastic), inout: new NormalEasing(easeInOutElastic) },
    "bounce": { in: new NormalEasing(easeInBounce), out: new NormalEasing(easeOutBounce), inout: new NormalEasing(easeInOutBounce) }
};
for (let funcType in easingMap) {
    for (let easeType in easingMap[funcType]) {
        const easing = easingMap[funcType][easeType];
        easing.funcType = funcType;
        easing.easeType = easeType;
    }
}
fixedEasing.funcType = "fixed";
fixedEasing.easeType = "in";
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
];
easingArray.forEach((easing, index) => {
    easing.id = index;
});
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
];
rpeEasingArray.forEach((easing, index) => {
    if (!easing) {
        return;
    }
    easing.rpeId = index;
});
// type EndBeats = number;
const MIN_LENGTH = 128;
const MAX_LENGTH = 1024;
const MINOR_PARTS = 16;
class JumpArray {
    /**
     *
     * @param head 链表头
     * @param tail 链表尾
     * @param originalListLength
     * @param effectiveBeats 有效拍数（等同于音乐拍数）
     * @param endNextFn 接收一个节点，返回该节点分管区段拍数，并给出下个节点。若抵达尾部，返回[null, null]（停止遍历的条件是抵达尾部而不是得到null）
     * @param nextFn 接收一个节点，返回下个节点。如果应当停止，返回false。
     */
    constructor(head, tail, originalListLength, effectiveBeats, endNextFn, nextFn, resolveLastNode = (node) => node
    // goPrev: (node: T) => T
    ) {
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        this.resolveLastNode = resolveLastNode;
        this.header = head;
        this.tailer = tail;
        // const originalListLength = this.listLength
        const listLength = Math.max(MIN_LENGTH, Math.min(originalListLength * 4, MAX_LENGTH));
        const averageBeats = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const exactLength = Math.ceil(effectiveBeats / averageBeats);
        // console.log(exactLength, listLength, averageBeats, exactLength)
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray = new Array(exactLength);
        this.array = jumpArray;
        this.averageBeats = averageBeats;
        this.effectiveBeats = exactLength * averageBeats;
        this.updateRange(head, tail);
    }
    updateEffectiveBeats(val) {
        this.effectiveBeats = val;
        const averageBeats = this.averageBeats;
        const exactLength = Math.ceil(val / averageBeats);
        const currentLength = this.array.length;
        if (exactLength < currentLength) {
            this.array.splice(exactLength, currentLength - exactLength);
        }
    }
    updateAverageBeats() {
        const length = this.array.length;
        if (length >= 1024) {
            return;
        }
        let crowded = 0;
        for (let i = 0; i < 50; i++) {
            const index = Math.floor(Math.random() * length);
            if (Array.isArray(this.array[index])) {
                crowded++;
            }
        }
        if (crowded > 30) {
            this.averageBeats /= 2;
            this.updateRange(this.header, this.tailer);
        }
    }
    /**
     *
     * @param firstNode 不含
     * @param lastNode 含
     */
    updateRange(firstNode, lastNode) {
        const { endNextFn, effectiveBeats, resolveLastNode } = this;
        lastNode = resolveLastNode(lastNode);
        // console.log(firstNode, lastNode)
        /**
         *
         * @param startTime
         * @param endTime 就是节点管辖范围的终止点，可以超过该刻度的最大值
         */
        const fillMinor = (startTime, endTime) => {
            const minorArray = jumpArray[jumpIndex];
            const currentJumpBeats = jumpIndex * averageBeats;
            const startsFrom = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats);
            const endsBefore = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats);
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
            // console.log(jumpIndex, arrayForIn(minorArray, (n) => node2string(n)).join("]["))
            // console.log("cur:", currentNode)
        };
        const jumpArray = this.array;
        const averageBeats = this.averageBeats;
        const minorBeats = averageBeats / MINOR_PARTS;
        let [previousEndTime, currentNode] = endNextFn(firstNode);
        let jumpIndex = Math.floor(previousEndTime / averageBeats); // 这里写漏了特此留念
        for (;;) {
            let [endTime, nextNode] = endNextFn(currentNode);
            // console.log("----Node:", currentNode, "next:", nextNode, "endTime:", endTime, "previousEndTime:", previousEndTime )
            if (endTime === null) {
                endTime = effectiveBeats;
            }
            // Hold树可能会不出现这种情况，故需特别考虑
            if (endTime >= previousEndTime) {
                while (endTime >= (jumpIndex + 1) * averageBeats) {
                    if (Array.isArray(jumpArray[jumpIndex])) {
                        fillMinor(previousEndTime, endTime);
                    }
                    else {
                        try {
                            // console.log(jumpIndex, currentNode)
                            jumpArray[jumpIndex] = currentNode;
                        }
                        catch (E) {
                            console.log(jumpIndex, jumpArray);
                            debugger;
                        }
                    }
                    jumpIndex++;
                }
                const currentJumpBeats = jumpIndex * averageBeats; // 放错了
                if (endTime > currentJumpBeats) {
                    let minor = jumpArray[jumpIndex];
                    if (!Array.isArray(minor)) {
                        jumpArray[jumpIndex] = new Array(MINOR_PARTS);
                    }
                    fillMinor(previousEndTime, endTime);
                }
                previousEndTime = endTime;
            }
            if (currentNode === lastNode) {
                currentNode = nextNode; // 为了后续可能的填充，防止刻度不满引发错误
                break;
            }
            currentNode = nextNode;
        }
        const minor = jumpArray[jumpIndex];
        if (Array.isArray(minor)) {
            // console.log("minor", arrayForIn(minor, (n) => node2string(n)))
            if (!minor[MINOR_PARTS - 1]) {
                if (!currentNode) {
                    currentNode = this.tailer;
                    fillMinor(previousEndTime, effectiveBeats);
                    return;
                }
                do {
                    let [endTime, nextNode] = endNextFn(currentNode);
                    if (endTime === null) {
                        endTime = this.effectiveBeats;
                    }
                    if (endTime > previousEndTime) {
                        fillMinor(previousEndTime, endTime);
                        previousEndTime = endTime;
                    }
                    currentNode = nextNode;
                } while (previousEndTime < (jumpIndex + 1) * averageBeats);
            }
        }
    }
    getPreviousOf(node, beats) {
        const jumpAverageBeats = this.averageBeats;
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        for (let i = jumpPos; i >= 0; i--) {
            let canBeNodeOrArray = this.array[i];
            if (Array.isArray(canBeNodeOrArray)) {
                const minorIndex = Math.floor(rest / (jumpAverageBeats / MINOR_PARTS)) - 1;
                for (let j = minorIndex; j >= 0; j--) {
                    const minorNode = canBeNodeOrArray[j];
                    if (minorNode !== node) {
                        return minorNode;
                    }
                }
            }
        }
        return this.header;
    }
    /**
     *
     * @param beats 拍数
     * @ param usePrev 可选，若设为true，则在取到事件头部时会返回前一个事件（即视为左开右闭）
     * @returns 时间索引链表的节点，一般不是head
     */
    getNodeAt(beats) {
        if (beats < 0) {
            return this.header.next;
        }
        if (beats >= this.effectiveBeats) {
            return this.tailer;
        }
        const jumpAverageBeats = this.averageBeats;
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        const nextFn = this.nextFn;
        let canBeNodeOrArray = this.array[jumpPos];
        let node = Array.isArray(canBeNodeOrArray)
            ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))]
            : canBeNodeOrArray;
        if (node.type === 1 /* NodeType.TAIL */) {
            return node;
        }
        // console.log(this, node, jumpPos, beats)
        if (!node) {
            console.warn("No node:", node, beats);
            debugger;
        }
        let next;
        // console.log(this)
        while (next = nextFn(node, beats)) {
            node = next;
            if (node.type === 1 /* NodeType.TAIL */) {
                break;
            }
        }
        return node;
    }
}
/**
 * @author Zes M Young
 */
const NNLIST_Y_OFFSET_HALF_SPAN = 100;
const node2string = (node) => {
    if (!node) {
        return "" + node;
    }
    if (node.type === 0 /* NodeType.HEAD */ || node.type === 1 /* NodeType.TAIL */) {
        return node.type === 0 /* NodeType.HEAD */ ? "H" : node.type === 1 /* NodeType.TAIL */ ? "T" : "???";
    }
    if (!node.notes) {
        return "EventNode";
    }
    return `NN(${node.notes.length}) at ${node.startTime}`;
};
const rgb2hex = (rgb) => {
    return rgb[0] << 16 | rgb[1] << 8 | rgb[2];
};
const hex2rgb = (hex) => {
    return [hex >> 16, hex >> 8 & 0xFF, hex & 0xFF];
};
const notePropTypes = {
    above: "boolean",
    alpha: "number",
    endTime: ["number", "number", "number"],
    isFake: "boolean",
    positionX: "number",
    size: "number",
    speed: "number",
    startTime: ["number", "number", "number"],
    type: "number",
    visibleTime: "number",
    visibleBeats: "number",
    yOffset: "number",
    tint: ["number", "number", "number"],
    tintHitEffects: ["number", "number", "number"],
    judgeSize: "number"
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
class Note {
    // readonly chart: Chart;
    // readonly judgeLine: JudgeLine
    // posPrevious?: Note;
    // posNext?: Note;
    // posPreviousSibling?: Note;
    // posNextSibling: Note;
    constructor(data) {
        var _a, _b, _c, _d, _e;
        this.above = data.above === 1;
        this.alpha = (_a = data.alpha) !== null && _a !== void 0 ? _a : 255;
        this.endTime = data.type === NoteType.hold ? TimeCalculator.validateIp(data.endTime) : TimeCalculator.validateIp([...data.startTime]);
        this.isFake = Boolean(data.isFake);
        this.positionX = data.positionX;
        this.size = (_b = data.size) !== null && _b !== void 0 ? _b : 1.0;
        this.speed = (_c = data.speed) !== null && _c !== void 0 ? _c : 1.0;
        this.startTime = TimeCalculator.validateIp(data.startTime);
        this.type = data.type;
        this.visibleTime = data.visibleTime;
        // @ts-expect-error
        this.yOffset = (_d = data.absoluteYOffset) !== null && _d !== void 0 ? _d : data.yOffset * this.speed;
        // @ts-expect-error 若data是RPE数据，则为undefined，无影响。
        // 当然也有可能是KPA数据但是就是没有给
        this.visibleBeats = data.visibleBeats;
        this.tint = data.tint ? rgb2hex(data.tint) : undefined;
        this.tintHitEffects = data.tintHitEffects ? rgb2hex(data.tintHitEffects) : undefined;
        this.judgeSize = (_e = data.judgeSize) !== null && _e !== void 0 ? _e : this.size;
        /*
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
        */
    }
    static fromKPAJSON(data, timeCalculator) {
        const note = new Note(data);
        if (!note.visibleBeats) {
            note.computeVisibleBeats(timeCalculator);
        }
        return note;
    }
    computeVisibleBeats(timeCalculator) {
        if (!this.visibleTime || this.visibleTime >= 90000) {
            this.visibleBeats = Infinity;
            return;
        }
        const hitBeats = TimeCalculator.toBeats(this.startTime);
        const hitSeconds = timeCalculator.toSeconds(hitBeats);
        const visabilityChangeSeconds = hitSeconds - this.visibleTime;
        const visabilityChangeBeats = timeCalculator.secondsToBeats(visabilityChangeSeconds);
        this.visibleBeats = hitBeats - visabilityChangeBeats;
    }
    /**
     *
     * @param offset
     * @returns
     */
    clone(offset) {
        const data = this.dumpKPA();
        data.startTime = TimeCalculator.add(data.startTime, offset);
        data.endTime = TimeCalculator.add(data.endTime, offset); // 踩坑
        return new Note(data);
    }
    /*
    static connectPosSibling(note1: Note, note2: Note) {
        note1.posNextSibling = note2;
        note2.posPreviousSibling = note1;
    }
    static connectPos(note1: Note, note2: Note) {
        note1.posNext = note2;
        note2.posPrevious = note1;
    }
    */
    dumpRPE(timeCalculator) {
        let visibleTime;
        if (this.visibleBeats !== Infinity) {
            const beats = TimeCalculator.toBeats(this.startTime);
            this.visibleBeats = timeCalculator.segmentToSeconds(beats - this.visibleBeats, beats);
        }
        else {
            visibleTime = 99999.0;
        }
        return {
            above: this.above ? 1 : 0,
            alpha: this.alpha,
            endTime: this.endTime,
            isFake: this.isFake ? 1 : 0,
            positionX: this.positionX,
            size: this.size,
            startTime: this.startTime,
            type: this.type,
            visibleTime: visibleTime,
            yOffset: this.yOffset / this.speed,
            speed: this.speed,
            tint: this.tint !== undefined ? hex2rgb(this.tint) : undefined,
            tintHitEffects: this.tint !== undefined ? hex2rgb(this.tintHitEffects) : undefined
        };
    }
    dumpKPA() {
        return {
            above: this.above ? 1 : 0,
            alpha: this.alpha,
            endTime: this.endTime,
            isFake: this.isFake ? 1 : 0,
            positionX: this.positionX,
            size: this.size,
            startTime: this.startTime,
            type: this.type,
            visibleBeats: this.visibleBeats,
            yOffset: this.yOffset / this.speed,
            /** 新KPAJSON认为YOffset就应该是个绝对的值，不受速度影响 */
            /** 但是有历史包袱，所以加字段 */
            absoluteYOffset: this.yOffset,
            speed: this.speed,
            tint: this.tint !== undefined ? hex2rgb(this.tint) : undefined,
            tintHitEffects: this.tint !== undefined ? hex2rgb(this.tintHitEffects) : undefined,
            judgeSize: this.judgeSize && this.judgeSize !== 1.0 ? this.judgeSize : undefined,
        };
    }
}
class NoteNodeLike {
    get previous() {
        if (!this._previous)
            return null;
        return this._previous.deref();
    }
    set previous(val) {
        if (!val) {
            this._previous = null;
            return;
        }
        this._previous = new WeakRef(val);
    }
    constructor(type) {
        this._previous = null;
        this.type = type;
    }
}
class NoteNode extends NoteNodeLike {
    constructor(time) {
        super(2 /* NodeType.MIDDLE */);
        this.startTime = TimeCalculator.validateIp([...time]);
        this.notes = [];
        this.id = NoteNode.count++;
    }
    static fromKPAJSON(data, timeCalculator) {
        const node = new NoteNode(data.startTime);
        for (let noteData of data.notes) {
            const note = Note.fromKPAJSON(noteData, timeCalculator);
            node.add(note);
        }
        return node;
    }
    get isHold() {
        return this.parentSeq instanceof HNList;
    }
    get endTime() {
        if (this.notes.length === 0) {
            return this.startTime; // 改了半天这个逻辑本来就是对的()
        }
        return (this.notes.length === 0 || this.notes[0].type !== NoteType.hold) ? this.startTime : this.notes[0].endTime;
    }
    add(note) {
        if (!TimeCalculator.eq(note.startTime, this.startTime)) {
            console.warn("Wrong addition!");
        }
        this.notes.push(note);
        note.parentNode = this;
        this.sort(this.notes.length - 1);
    }
    sort(index) {
        if (typeof index !== "number") {
            index = this.notes.indexOf(index);
            if (index === -1) {
                return;
            }
        }
        if (!this.isHold) {
            return;
        }
        const { notes } = this;
        const note = notes[index];
        for (let i = index; i > 0; i--) {
            const prev = notes[i - 1];
            if (TimeCalculator.lt(prev.endTime, note.endTime)) {
                // swap
                notes[i] = prev;
                notes[i - 1] = note;
            }
            else {
                break;
            }
        }
        for (let i = index; i < notes.length - 1; i++) {
            const next = notes[i + 1];
            if (TimeCalculator.gt(next.endTime, note.endTime)) {
                // swap
                notes[i] = next;
                notes[i + 1] = note;
            }
            else {
                break;
            }
        }
    }
    remove(note) {
        this.notes.splice(this.notes.indexOf(note), 1);
        note.parentNode = null;
    }
    static disconnect(note1, note2) {
        if (note1) {
            note1.next = null;
        }
        if (note2) {
            note2.previous = null;
        }
    }
    static connect(note1, note2) {
        if (note1) {
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
        if (note1 && note2) {
            note2.parentSeq = note1.parentSeq;
        }
    }
    static insert(note1, inserted, note2) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
    dump() {
        return {
            notes: this.notes.map(note => note.dumpKPA()),
            startTime: this.startTime
        };
    }
}
NoteNode.count = 0;
class NNList {
    constructor(speed, medianYOffset = 0, effectiveBeats) {
        this.speed = speed;
        this.medianYOffset = medianYOffset;
        this.head = new NoteNodeLike(0 /* NodeType.HEAD */);
        this.head.parentSeq = this;
        this.currentPoint = this.head;
        // this.currentBranchPoint = <NoteNode>{startTime: [-1, 0, 1]}
        this.tail = new NoteNodeLike(1 /* NodeType.TAIL */);
        this.tail.parentSeq = this;
        this.timesWithNotes = 0;
        this.effectiveBeats = effectiveBeats;
    }
    /** 此方法永远用于最新KPAJSON */
    static fromKPAJSON(isHold, effectiveBeats, data, nnnList, timeCalculator) {
        const list = isHold ? new HNList(data.speed, data.medianYOffset, effectiveBeats) : new NNList(data.speed, data.medianYOffset, effectiveBeats);
        const nnlength = data.noteNodes.length;
        let cur = list.head;
        for (let i = 0; i < nnlength; i++) {
            const nnData = data.noteNodes[i];
            const nn = NoteNode.fromKPAJSON(nnData, timeCalculator);
            NoteNode.connect(cur, nn);
            cur = nn;
            nnnList.addNoteNode(nn);
        }
        NoteNode.connect(cur, list.tail);
        list.initJump();
        return list;
    }
    initJump() {
        const originalListLength = this.timesWithNotes;
        if (!this.effectiveBeats) {
            const prev = this.tail.previous;
            if (prev.type === 0 /* NodeType.HEAD */) {
                return;
            }
            this.effectiveBeats = TimeCalculator.toBeats(prev.endTime);
        }
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if (node.type === 1 /* NodeType.TAIL */) {
                return [null, null];
            }
            const nextNode = node.next;
            const startTime = (node.type === 0 /* NodeType.HEAD */) ? 0 : TimeCalculator.toBeats(node.startTime);
            return [startTime, nextNode];
        }, 
        // @ts-ignore
        (note, beats) => {
            return TimeCalculator.toBeats(note.startTime) >= beats ? false : note.next; // getNodeAt有guard
        });
    }
    /**
     *
     * @param beats 目标位置
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Node，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns
     */
    getNodeAt(beats, beforeEnd = false) {
        return this.jump.getNodeAt(beats);
    }
    /**
     * Get or create a node of given time
     * @param time
     * @returns
     */
    getNodeOf(time) {
        var _a;
        let node = this.getNodeAt(TimeCalculator.toBeats(time), false)
            .previous;
        let isEqual = node.type !== 0 /* NodeType.HEAD */ && TimeCalculator.eq(node.startTime, time);
        if (node.next.type !== 1 /* NodeType.TAIL */ && TimeCalculator.eq(node.next.startTime, time)) {
            isEqual = true;
            node = node.next;
        }
        if (!isEqual) {
            const newNode = new NoteNode(time);
            const next = node.next;
            NoteNode.insert(node, newNode, next);
            // console.log("created:", node2string(newNode))
            this.jump.updateRange(node, next);
            // console.log("pl", this.parentLine)
            if ((_a = this.parentLine) === null || _a === void 0 ? void 0 : _a.chart) {
                this.parentLine.chart.nnnList.getNode(time).add(newNode);
            }
            return newNode;
        }
        else {
            return node;
        }
    }
    dumpKPA() {
        const nodes = [];
        let node = this.head.next;
        while (node.type !== 1 /* NodeType.TAIL */) {
            nodes.push(node.dump());
            node = node.next;
        }
        return {
            speed: this.speed,
            medianYOffset: this.medianYOffset,
            noteNodes: nodes
        };
    }
}
/**
 * HoldNode的链表
 * HN is the abbreviation of HoldNode, which is not individually declared.
 * A NN that contains holds (a type of note) is a HN.
 */
class HNList extends NNList {
    constructor(speed, medianYOffset, effectiveBeats) {
        super(speed, medianYOffset, effectiveBeats);
    }
    initJump() {
        super.initJump();
        const originalListLength = this.timesWithNotes;
        const effectiveBeats = this.effectiveBeats;
        this.holdTailJump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if (node.type === 1 /* NodeType.TAIL */) {
                return [null, null];
            }
            if (!node)
                debugger;
            const nextNode = node.next;
            const endTime = node.type === 0 /* NodeType.HEAD */ ? 0 : TimeCalculator.toBeats(node.endTime);
            return [endTime, nextNode];
        }, 
        // @ts-ignore
        (node, beats) => {
            return TimeCalculator.toBeats(node.endTime) >= beats ? false : node.next; // getNodeAt有guard
        });
    }
    getNodeAt(beats, beforeEnd = false) {
        return beforeEnd ? this.holdTailJump.getNodeAt(beats) : this.jump.getNodeAt(beats);
    }
    // unused
    insertNoteJumpUpdater(note) {
        const { previous, next } = note;
        return () => {
            this.jump.updateRange(previous, next);
            this.holdTailJump.updateRange(previous, next);
        };
    }
}
class NNNodeLike {
    constructor(type) {
        this.type = type;
        if (type === 0 /* NodeType.HEAD */) {
            this.startTime = [0, 0, 1];
        }
        else if (type === 1 /* NodeType.TAIL */) {
            this.startTime = [Infinity, 0, 1];
        }
    }
}
class NNNode extends NNNodeLike {
    constructor(time) {
        super(2 /* NodeType.MIDDLE */);
        this.noteNodes = [];
        this.holdNodes = [];
        this.startTime = TimeCalculator.validateIp([...time]);
    }
    get endTime() {
        let latest = this.startTime;
        for (let index = 0; index < this.holdNodes.length; index++) {
            const element = this.holdNodes[index];
            if (TC.gt(element.endTime, latest)) {
                latest = element.endTime;
            }
        }
        return latest;
    }
    add(node) {
        if (node.isHold) {
            this.holdNodes.push(node);
        }
        else {
            this.noteNodes.push(node);
        }
        node.totalNode = this;
    }
    static connect(note1, note2) {
        if (note1) {
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
    }
    static insert(note1, inserted, note2) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
}
/**
 * 二级音符节点链表
 * contains NNNs
 * NNN is the abbreviation of NoteNodeNode, which store note (an element in music game) nodes with same startTime
 * NN is the abbreviation of NoteNode, which stores the notes with the same startTime.
 */
class NNNList {
    constructor(effectiveBeats) {
        this.effectiveBeats = effectiveBeats;
        this.head = new NNNodeLike(0 /* NodeType.HEAD */);
        this.tail = new NNNodeLike(1 /* NodeType.TAIL */);
        NNNode.connect(this.head, this.tail);
        this.initJump();
    }
    initJump() {
        const originalListLength = this.timesWithNotes || 512;
        /*
        if (!this.effectiveBeats) {
            this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.endTime)
        }
        */
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if (node.type === 1 /* NodeType.TAIL */) {
                return [null, null];
            }
            const nextNode = node.next;
            const startTime = node.type === 0 /* NodeType.HEAD */ ? 0 : TimeCalculator.toBeats(node.startTime);
            return [startTime, nextNode];
        }, 
        // @ts-ignore
        (note, beats) => {
            return TimeCalculator.toBeats(note.startTime) >= beats ? false : note.next; // getNodeAt有guard
        }
        /*,
        (note: Note) => {
            const prev = note.previous;
            return prev.type === NodeType.HEAD ? note : prev
        })*/ );
    }
    getNodeAt(beats, beforeEnd = false) {
        return this.jump.getNodeAt(beats);
    }
    getNode(time) {
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false).previous;
        if (node.type === 0 /* NodeType.HEAD */ || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NNNode(time);
            const next = node.next;
            NNNode.insert(node, newNode, next);
            this.jump.updateRange(node, next);
            return newNode;
        }
        else {
            return node;
        }
    }
    addNoteNode(noteNode) {
        this.getNode(noteNode.startTime).add(noteNode);
    }
}
/**
 * 奇谱发生器使用中心来表示一个NNList的y值偏移范围，这个函数根据yOffset算出对应中心值
 * @param yOffset
 * @returns
 */
const getRangeMedian = (yOffset) => {
    return (Math.floor((Math.abs(yOffset) - NNLIST_Y_OFFSET_HALF_SPAN) / NNLIST_Y_OFFSET_HALF_SPAN / 2) * (NNLIST_Y_OFFSET_HALF_SPAN * 2) + NNLIST_Y_OFFSET_HALF_SPAN * 2) * Math.sign(yOffset);
};
class JudgeLine {
    constructor(chart) {
        this.hnLists = new Map();
        this.nnLists = new Map();
        this.eventLayers = [];
        this.children = new Set();
        this.anchor = [0.5, 0.5];
        this.hasAttachUI = false;
        this.rotatesWithFather = false;
        this.name = "Untitled";
        //this.notes = [];
        this.chart = chart;
        this.texture = "line.png";
        this.cover = true;
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(chart, id, data, templates, timeCalculator) {
        var _a;
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        chart.judgeLineGroups[data.Group].add(line);
        line.cover = Boolean(data.isCover);
        line.rotatesWithFather = data.rotateWithFather;
        line.anchor = (_a = data.anchor) !== null && _a !== void 0 ? _a : [0.5, 0.5];
        // Process UI
        if (data.attachUI) {
            // Must use template string, otherwise TypeScript would not recognize it as `keyof Chart`
            // because the type is broadened to `string`
            // And you cannot assign it to a variable
            chart[`${data.attachUI}Attach`] = line;
            line.hasAttachUI = true;
        }
        const noteNodeTree = chart.nnnList;
        if (data.notes) {
            const holdLists = line.hnLists;
            const noteLists = line.nnLists;
            let notes = data.notes;
            notes.sort((n1, n2) => {
                if (TimeCalculator.ne(n1.startTime, n2.startTime)) {
                    return TimeCalculator.gt(n1.startTime, n2.startTime) ? 1 : -1;
                }
                return TimeCalculator.gt(n1.endTime, n2.endTime) ? -1 : 1; // 这里曾经排反了（
            });
            const len = notes.length;
            let lastTime = [-1, 0, 1];
            // let comboInfoEntity: ComboInfoEntity;
            for (let i = 0; i < len; i++) {
                const note = new Note(notes[i]);
                note.computeVisibleBeats(timeCalculator);
                const tree = line.getNNList(note.speed, note.yOffset, note.type === NoteType.hold, false);
                const cur = tree.currentPoint;
                const lastHoldTime = cur.type === 0 /* NodeType.HEAD */ ? [-1, 0, 1] : cur.startTime;
                if (TimeCalculator.eq(lastHoldTime, note.startTime)) {
                    tree.currentPoint.add(note);
                }
                else {
                    const node = new NoteNode(note.startTime);
                    node.add(note); // 这里之前没写，特此留念！
                    NoteNode.connect(tree.currentPoint, node);
                    tree.currentPoint = node;
                    noteNodeTree.addNoteNode(node);
                }
                tree.timesWithNotes++;
            }
            for (let trees of [holdLists, noteLists]) {
                for (const [_, list] of trees) {
                    NoteNode.connect(list.currentPoint, list.tail);
                    list.initJump();
                    // tree.initPointers()
                }
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        const createSequence = (type, events, index) => {
            if (events) {
                const sequence = EventNodeSequence.fromRPEJSON(type, events, chart);
                sequence.id = `#${id}.${index}.${EventType[type]}`;
                chart.sequenceMap.set(sequence.id, sequence);
                return sequence;
            }
        };
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            if (!layerData) {
                continue;
            }
            const layer = {
                moveX: createSequence(EventType.moveX, layerData.moveXEvents, index),
                moveY: createSequence(EventType.moveY, layerData.moveYEvents, index),
                rotate: createSequence(EventType.rotate, layerData.rotateEvents, index),
                alpha: createSequence(EventType.alpha, layerData.alphaEvents, index),
                speed: createSequence(EventType.speed, layerData.speedEvents, index)
            };
            line.eventLayers[index] = layer;
        }
        // line.updateNoteSpeeds();
        // line.computeNotePositionY(timeCalculator);
        return line;
    }
    static fromKPAJSON(isOld, chart, id, data, templates, timeCalculator) {
        var _a, _b;
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        line.rotatesWithFather = data.rotatesWithFather;
        line.anchor = (_a = data.anchor) !== null && _a !== void 0 ? _a : [0.5, 0.5];
        line.texture = data.Texture || "line.png";
        line.cover = (_b = data.cover) !== null && _b !== void 0 ? _b : true;
        chart.judgeLineGroups[data.group].add(line);
        const nnnList = chart.nnnList;
        for (let isHold of [false, true]) {
            const key = `${isHold ? "hn" : "nn"}Lists`;
            const lists = data[key];
            for (let name in lists) {
                const listData = lists[name];
                if (!isOld) {
                    const list = NNList.fromKPAJSON(isHold, chart.effectiveBeats, listData, nnnList, timeCalculator);
                    list.parentLine = line;
                    list.id = name;
                    line[key].set(name, list);
                }
                else {
                    line.getNNListFromOldKPAJSON(line[key], name, isHold, chart.effectiveBeats, listData, nnnList, timeCalculator);
                }
            }
        }
        for (let child of data.children) {
            line.children.add(JudgeLine.fromKPAJSON(isOld, chart, child.id, child, templates, timeCalculator));
        }
        for (let eventLayerData of data.eventLayers) {
            let eventLayer = {};
            for (let key in eventLayerData) {
                // use "fromRPEJSON" for they have the same logic
                eventLayer[key] = chart.sequenceMap.get(eventLayerData[key]);
            }
            line.eventLayers.push(eventLayer);
        }
        chart.judgeLines.push(line);
        return line;
    }
    getNNListFromOldKPAJSON(lists, namePrefix, isHold, effectiveBeats, listData, nnnList, timeCalculator) {
        const speed = listData.speed;
        const constructor = isHold ? HNList : NNList;
        const createdLists = new Set();
        const getOrCreateNNList = (median, name) => {
            if (lists.has(name)) {
                return lists.get(name);
            }
            const list = new constructor(speed, median, effectiveBeats);
            list.id = name;
            list.parentLine = this;
            lists.set(name, list);
            createdLists.add(list);
            return list;
        };
        const nns = listData.noteNodes;
        const len = nns.length;
        for (let i = 0; i < len; i++) {
            const nodeData = nns[i];
            const l = nodeData.notes.length;
            for (let j = 0; j < l; j++) {
                const noteData = nodeData.notes[j];
                const note = new Note(noteData);
                const median = getRangeMedian(note.yOffset);
                const list = getOrCreateNNList(median, namePrefix + "o" + median);
                const cur = list.currentPoint;
                if (!note.visibleBeats) {
                    note.computeVisibleBeats(timeCalculator);
                }
                if (!(cur.type === 0 /* NodeType.HEAD */) && TC.eq(noteData.startTime, cur.startTime)) {
                    cur.add(note);
                }
                else {
                    const node = new NoteNode(noteData.startTime);
                    node.add(note);
                    NoteNode.connect(cur, node);
                    nnnList.addNoteNode(node);
                    list.currentPoint = node;
                }
            }
        }
        for (const list of createdLists) {
            NoteNode.connect(list.currentPoint, list.tail);
            list.initJump();
        }
    }
    updateSpeedIntegralFrom(beats, timeCalculator) {
        var _a;
        for (let eventLayer of this.eventLayers) {
            (_a = eventLayer === null || eventLayer === void 0 ? void 0 : eventLayer.speed) === null || _a === void 0 ? void 0 : _a.updateNodesIntegralFrom(beats, timeCalculator);
        }
    }
    /**
     * startY and endY must not be negative
     * @param beats
     * @param timeCalculator
     * @param startY
     * @param endY
     * @returns
     */
    computeTimeRange(beats, timeCalculator, startY, endY) {
        console.log("invoked");
        //return [[0, Infinity]]
        //*
        // 提取所有有变化的时间点
        let times = [];
        let result = [];
        for (let eventLayer of this.eventLayers) {
            const sequence = eventLayer === null || eventLayer === void 0 ? void 0 : eventLayer.speed;
            if (!sequence) {
                continue;
            }
            let node = sequence.getNodeAt(beats);
            let endNode;
            while (true) {
                times.push(TimeCalculator.toBeats(node.time));
                if ((endNode = node.next).type === 1 /* NodeType.TAIL */) {
                    break;
                }
                node = endNode.next;
            }
        }
        times = [...new Set(times)].sort((a, b) => a - b);
        const len = times.length;
        let nextTime = times[0];
        let nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
        let nextSpeed = this.getStackedValue("speed", nextTime, true);
        let range = [undefined, undefined];
        // console.log(times)
        const computeTime = (speed, currentPos, fore) => timeCalculator.secondsToBeats(currentPos / (speed * 120) + timeCalculator.toSeconds(fore));
        for (let i = 0; i < len - 1;) {
            const thisTime = nextTime;
            const thisPosY = nextPosY;
            let thisSpeed = this.getStackedValue("speed", thisTime);
            if (Math.abs(thisSpeed) < 1e-8) {
                thisSpeed = 0; // 不这样做可能导致下面异号判断为真从而死循环
            }
            nextTime = times[i + 1];
            nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
            nextSpeed = this.getStackedValue("speed", nextTime, true);
            // console.log(thisSpeed, nextSpeed, thisSpeed * nextSpeed < 0, i, [...result])
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                //debugger;
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0;
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
                //debugger
            }
            else {
                // console.log("i++")
                i++;
            }
            if (range[0] === undefined) {
                // 变速区间直接全部囊括，匀速要算一下，因为好算
                /*
                设两个时间点的位置为a,b
                开始结束点为s,e
                选中小段一部分在区间内：
                a < s <= b
                或a > e >= b
                全部在区间内
                s <= a <= b
                */
                if (thisPosY < startY && startY <= nextPosY
                    || thisPosY > endY && endY >= nextPosY) {
                    range[0] = thisSpeed !== nextSpeed ? thisTime : computeTime(thisSpeed, (thisPosY < nextPosY ? startY : endY) - thisPosY, thisTime);
                }
                else if (startY <= thisPosY && thisPosY <= endY) {
                    range[0] = thisTime;
                }
            }
            // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
            if (range[0] !== undefined) {
                if (thisPosY < endY && endY <= nextPosY || thisPosY > startY && startY >= nextPosY) {
                    range[1] = thisSpeed !== nextSpeed ? nextTime : computeTime(thisSpeed, (thisPosY > nextPosY ? startY : endY) - thisPosY, thisTime);
                    if (range[0] > range[1]) {
                        console.error("range start should be smaller than range end.");
                        console.log("\nRange is:", range, "thisTime:", thisTime, "thisSpeed:", thisSpeed, "thisPosY:", thisPosY, "\nstartY:", startY, "endY:", endY, "nextTime:", nextTime, "nextPosY:", nextPosY, "nextSpeed:", nextSpeed, "\njudgeLine:", this);
                    }
                    result.push(range);
                    range = [undefined, undefined];
                }
            }
        }
        const thisPosY = nextPosY;
        const thisTime = nextTime;
        const thisSpeed = this.getStackedValue("speed", thisTime);
        const inf = thisSpeed > 0 ? Infinity : (thisSpeed < 0 ? -Infinity : thisPosY);
        if (range[0] === undefined) {
            // 变速区间直接全部囊括，匀速要算一下，因为好算
            if (thisPosY < startY && startY <= inf || thisPosY >= endY && endY > inf) {
                range[0] = computeTime(thisSpeed, (thisPosY < inf ? startY : endY) - thisPosY, thisTime);
            }
            else if (thisSpeed === 0) {
                range[0] = 0;
            }
        }
        // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
        if (range[0] !== undefined) {
            if (thisPosY < endY && endY <= inf || thisPosY >= startY && startY > inf) {
                range[1] = computeTime(thisSpeed, (thisPosY > inf ? startY : endY) - thisPosY, thisTime);
                result.push(range);
            }
            else if (thisSpeed === 0) {
                range[1] = Infinity;
                result.push(range);
            }
        }
        return result;
        //*/
    }
    /*
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    */
    /**
     *
     * @param beats
     * @param usePrev 如果取到节点，将使用EndNode的值。默认为FALSE
     * @returns
     */
    getValues(beats, usePrev = false) {
        return [
            this.getStackedValue("moveX", beats, usePrev),
            this.getStackedValue("moveY", beats, usePrev),
            this.getStackedValue("rotate", beats, usePrev) / 180 * Math.PI, // 转换为弧度制
            this.getStackedValue("alpha", beats, usePrev),
        ];
    }
    getMatrix(beats, usePrev = false) {
        const base = this.father.getMatrix(beats, usePrev);
        const x = this;
    }
    getStackedValue(type, beats, usePrev = false) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer || !layer[type]) {
                break;
            }
            current += layer[type].getValueAt(beats, usePrev);
        }
        return current;
    }
    getStackedIntegral(beats, timeCalculator) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer || !layer.speed) {
                break;
            }
            current += layer.speed.getIntegral(beats, timeCalculator);
        }
        // console.log("integral", current)
        return current;
    }
    /**
     * 获取对应速度和类型的Note树,没有则创建
     */
    getNNList(speed, yOffset, isHold, initsJump) {
        const lists = isHold ? this.hnLists : this.nnLists;
        const medianYOffset = getRangeMedian(yOffset);
        for (const [_, list] of lists) {
            if (list.speed === speed && list.medianYOffset === medianYOffset) {
                return list;
            }
        }
        const list = isHold ? new HNList(speed, medianYOffset, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration)) : new NNList(speed, medianYOffset, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration));
        list.parentLine = this;
        NoteNode.connect(list.head, list.tail);
        if (initsJump)
            list.initJump();
        const id = (isHold ? "$" : "#") + speed + "o" + medianYOffset;
        lists.set(id, list);
        list.id = id;
        return list;
    }
    getNode(note, initsJump) {
        const speed = note.speed;
        const yOffset = note.yOffset;
        const isHold = note.type === NoteType.hold;
        const tree = this.getNNList(speed, yOffset, isHold, initsJump);
        return tree.getNodeOf(note.startTime);
    }
    /**
     *
     * @param eventNodeSequences To Collect the sequences used in this line
     * @returns
     */
    dumpKPA(eventNodeSequences, judgeLineGroups) {
        const children = [];
        for (let line of this.children) {
            children.push(line.dumpKPA(eventNodeSequences, judgeLineGroups));
        }
        const eventLayers = [];
        for (let i = 0; i < this.eventLayers.length; i++) {
            const layer = this.eventLayers[i];
            if (!layer)
                continue;
            let layerData = {};
            for (let type in layer) {
                const sequence = layer[type];
                if (!sequence)
                    continue;
                eventNodeSequences.add(sequence);
                layerData[type] = sequence.id;
            }
            eventLayers.push(layerData);
        }
        const hnListsData = {};
        const nnListsData = {};
        for (let [id, list] of this.hnLists) {
            hnListsData[id] = list.dumpKPA();
        }
        for (let [id, list] of this.nnLists) {
            nnListsData[id] = list.dumpKPA();
        }
        return {
            group: judgeLineGroups.indexOf(this.group),
            id: this.id,
            Name: this.name,
            Texture: this.texture,
            anchor: this.anchor,
            rotatesWithFather: this.rotatesWithFather,
            children: children,
            eventLayers: eventLayers,
            hnLists: hnListsData,
            nnLists: nnListsData,
            cover: this.cover
        };
    }
    updateEffectiveBeats(EB) {
        for (let i = 0; i < this.eventLayers.length; i++) {
            const layer = this.eventLayers[i];
            for (let type in layer) {
                const sequence = layer[type];
                sequence.effectiveBeats = EB;
            }
        }
        for (let lists of [this.nnLists, this.hnLists]) {
            for (let [_, list] of lists) {
                list.effectiveBeats = EB;
            }
        }
    }
    static checkinterdependency(judgeLine, toBeFather) {
        let descendantsAndSelf = new Set();
        const add = (line) => {
            descendantsAndSelf.add(line);
            for (let child of line.children) {
                add(child);
            }
        };
        add(judgeLine);
        return descendantsAndSelf.has(toBeFather);
    }
}
var EventType;
(function (EventType) {
    EventType[EventType["moveX"] = 0] = "moveX";
    EventType[EventType["moveY"] = 1] = "moveY";
    EventType[EventType["rotate"] = 2] = "rotate";
    EventType[EventType["alpha"] = 3] = "alpha";
    EventType[EventType["speed"] = 4] = "speed";
    EventType[EventType["easing"] = 5] = "easing";
    EventType[EventType["bpm"] = 6] = "bpm";
})(EventType || (EventType = {}));
var NoteType;
(function (NoteType) {
    NoteType[NoteType["tap"] = 1] = "tap";
    NoteType[NoteType["drag"] = 4] = "drag";
    NoteType[NoteType["flick"] = 3] = "flick";
    NoteType[NoteType["hold"] = 2] = "hold";
})(NoteType || (NoteType = {}));
/**
 * 相当于 Python 推导式
 * @param arr
 * @param expr
 * @param guard
 * @returns
 */
function arrayForIn(arr, expr, guard) {
    let ret = [];
    for (let each of arr) {
        if (!guard || guard && guard(each)) {
            ret.push(expr(each));
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
function dictForIn(obj, expr, guard) {
    let ret = {};
    for (let key in obj) {
        const each = obj[key];
        if (!guard || guard && guard(each)) {
            ret[key] = expr(each);
        }
    }
    return ret;
}
class Chart {
    constructor() {
        this.judgeLines = [];
        this.bpmList = [];
        this.timeCalculator = new TimeCalculator();
        this.orphanLines = [];
        // comboMapping: ComboMapping;
        this.name = "unknown";
        this.level = "unknown";
        this.composer = "unknown";
        this.charter = "unknown";
        this.illustrator = "unknown";
        this.offset = 0;
        this.templateEasingLib = new TemplateEasingLib;
        this.sequenceMap = new Map();
        /**  */
        this.judgeLineGroups = [];
        this.modified = false;
        this.maxCombo = 0;
        this.pauseAttach = null;
        this.combonumberAttach = null;
        this.comboAttach = null;
        this.barAttach = null;
        this.scoreAttach = null;
        this.nameAttach = null;
        this.levelAttach = null;
    }
    getEffectiveBeats() {
        const effectiveBeats = this.timeCalculator.secondsToBeats(this.duration);
        console.log(effectiveBeats);
        this.effectiveBeats = effectiveBeats;
        return this.effectiveBeats;
    }
    static fromRPEJSON(data, duration) {
        var _a, _b, _c;
        const chart = new Chart();
        chart.judgeLineGroups = data.judgeLineGroup.map(group => new JudgeLineGroup(group));
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.composer = (_a = data.META.composer) !== null && _a !== void 0 ? _a : "unknown";
        chart.charter = (_b = data.META.charter) !== null && _b !== void 0 ? _b : "unknown";
        chart.illustrator = (_c = data.META.illustration) !== null && _c !== void 0 ? _c : "unknown";
        chart.duration = duration;
        chart.chartingTime = data.kpaChartTime;
        chart.rpeChartingTime = data.chartTime ? Math.round(data.chartTime / 60) : 0;
        chart.chartingTime = 0;
        chart.updateCalculator();
        console.log(chart, chart.getEffectiveBeats());
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        // let line = data.judgeLineList[0];
        const judgeLineDataList = data.judgeLineList;
        const judgeLineList = judgeLineDataList.map((lineData, id) => JudgeLine.fromRPEJSON(chart, id, lineData, chart.templateEasingLib, chart.timeCalculator));
        const length = judgeLineList.length;
        chart.judgeLines = judgeLineList;
        for (let i = 0; i < length; i++) {
            const data = judgeLineDataList[i];
            const line = judgeLineList[i];
            const father = data.father === -1 ? null : judgeLineList[data.father];
            if (father) {
                father.children.add(line);
            }
            else {
                chart.orphanLines.push(line);
            }
        }
        chart.countMaxCombo();
        return chart;
    }
    static fromKPAJSON(data) {
        var _a, _b, _c, _d, _e;
        const chart = new Chart();
        chart.bpmList = data.bpmList;
        chart.duration = data.duration;
        chart.name = data.info.name;
        chart.level = data.info.level;
        chart.illustrator = (_a = data.info.illustrator) !== null && _a !== void 0 ? _a : "unknown";
        chart.composer = (_b = data.info.composer) !== null && _b !== void 0 ? _b : "unknown";
        chart.charter = (_c = data.info.charter) !== null && _c !== void 0 ? _c : "unknown";
        chart.offset = data.offset;
        chart.judgeLineGroups = data.judgeLineGroups.map(group => new JudgeLineGroup(group));
        chart.chartingTime = (_d = data.chartTime) !== null && _d !== void 0 ? _d : 0;
        chart.rpeChartingTime = (_e = data.rpeChartTime) !== null && _e !== void 0 ? _e : 0;
        chart.updateCalculator();
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        const envEasings = data.envEasings;
        const len = envEasings.length;
        for (let i = 0; i < len; i++) {
            const easingData = envEasings[i];
            chart.templateEasingLib.require(easingData.name);
        }
        const sequences = data.eventNodeSequences;
        const length = data.eventNodeSequences.length;
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
        chart.templateEasingLib.check();
        const isOld = !data.version || data.version < 150;
        for (let lineData of data.orphanLines) {
            const line = JudgeLine.fromKPAJSON(isOld, chart, lineData.id, lineData, chart.templateEasingLib, chart.timeCalculator);
            chart.orphanLines.push(line);
        }
        chart.judgeLines.sort((a, b) => a.id - b.id);
        chart.countMaxCombo();
        const ui = data.ui;
        if (ui)
            for (const uiname of ["combo", "combonumber", "score", "pause", "bar", "name", "level"]) {
                if (typeof ui[uiname] === "number") { // 踩坑，线号可为0
                    const line = chart.judgeLines[ui[uiname]];
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
        this.timeCalculator.update();
    }
    updateEffectiveBeats(duration) {
        const EB = this.timeCalculator.secondsToBeats(duration);
        for (let i = 0; i < this.judgeLines.length; i++) {
            const judgeLine = this.judgeLines[i];
            judgeLine.updateEffectiveBeats(EB);
        }
    }
    dumpKPA() {
        var _a, _b, _c, _d, _e, _f, _g;
        const eventNodeSequences = new Set();
        const orphanLines = [];
        for (let line of this.orphanLines) {
            orphanLines.push(line.dumpKPA(eventNodeSequences, this.judgeLineGroups));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData = [];
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
                combo: (_a = this.comboAttach) === null || _a === void 0 ? void 0 : _a.id,
                combonumber: (_b = this.combonumberAttach) === null || _b === void 0 ? void 0 : _b.id,
                score: (_c = this.scoreAttach) === null || _c === void 0 ? void 0 : _c.id,
                pause: (_d = this.pauseAttach) === null || _d === void 0 ? void 0 : _d.id,
                bar: (_e = this.barAttach) === null || _e === void 0 ? void 0 : _e.id,
                name: (_f = this.nameAttach) === null || _f === void 0 ? void 0 : _f.id,
                level: (_g = this.levelAttach) === null || _g === void 0 ? void 0 : _g.id
            },
            offset: this.offset,
            orphanLines: orphanLines,
            judgeLineGroups: this.judgeLineGroups.map(g => g.name),
            chartTime: this.chartingTime,
            rpeChartTime: this.rpeChartingTime
        };
    }
    createNNNode(time) {
        return new NNNode(time);
    }
    createEventNodeSequence(type, name) {
        if (this.sequenceMap.has(name)) {
            throw new Error(`The name ${name} is occupied.`);
        }
        const seq = EventNodeSequence.newSeq(type, this.getEffectiveBeats());
        seq.id = name;
        this.sequenceMap.set(name, seq);
        return seq;
    }
    countMaxCombo() {
        let combo = 0;
        const nnnlist = this.nnnList;
        for (let node = nnnlist.head.next; node.type !== 1 /* NodeType.TAIL */; node = node.next) {
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
    attachUIToLine(ui, judgeLine) {
        const key = `${ui}Attach`;
        if (this[key]) {
            throw new Error(`UI ${ui} is occupied`);
        }
        this[key] = judgeLine;
        judgeLine.hasAttachUI = true;
    }
    detachUI(ui) {
        const key = `${ui}Attach`;
        const judgeLine = this[key];
        if (!judgeLine) {
            return;
        }
        this[key] = null;
        if (![
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
    queryJudgeLineUI(judgeLine) {
        const arr = [];
        for (const ui of ["combo", "combonumber", "score", "pause", "bar", "name", "level"]) {
            if (this[`${ui}Attach`] === judgeLine) {
                arr.push(ui);
            }
        }
        return arr;
    }
    scanAllTextures() {
        const textures = new Set;
        for (const line of this.judgeLines) {
            textures.add(line.texture);
        }
        return textures;
    }
}
class JudgeLineGroup {
    constructor(name) {
        this.name = name;
        this.judgeLines = [];
    }
    add(judgeLine) {
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
    remove(judgeLine) {
        const index = this.judgeLines.indexOf(judgeLine);
        if (index !== -1) {
            this.judgeLines.splice(index, 1);
        }
    }
    isDefault() {
        return this.name.toLowerCase() === "default";
    }
}
// interface TemplateEasingLib {[name: string]: TemplateEasing}
/**
 * To compare two arrays
 * @param arr1
 * @param arr2
 * @returns
 */
function arrEq(arr1, arr2) {
    let length;
    if ((length = arr1.length) !== arr2.length) {
        return false;
    }
    for (let i = 0; i < length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
class EventNodeLike {
    constructor(type) {
        /** 后一个事件节点 */
        this.next = null;
        /** 前一个事件节点 */
        this.previous = null;
        this.type = type;
    }
}
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
class EventNode extends EventNodeLike {
    constructor(time, value) {
        super(2 /* NodeType.MIDDLE */);
        this.time = TimeCalculator.validateIp(time);
        this.value = value !== null && value !== void 0 ? value : 0;
        this.easing = linearEasing;
    }
    clone(offset) {
        const ret = new this.constructor(offset ? TimeCalculator.add(this.time, offset) : this.time, this.value);
        ret.easing = this.easing;
        return ret;
    }
    //#region 
    /**
     * gets the easing object from RPEEventData
     * @param data
     * @param left
     * @param right
     * @param templates
     * @returns
     */
    static getEasing(data, left, right, templates) {
        if ((left && right) && (left !== 0.0 || right !== 1.0)) {
            return new SegmentedEasing(EventNode.getEasing(data, 0.0, 1.0, templates), left, right);
        }
        if (data.bezier) {
            let bp = data.bezierPoints;
            let easing = new BezierEasing();
            easing.cp1 = new Coordinate(bp[0], bp[1]);
            easing.cp2 = new Coordinate(bp[2], bp[3]);
            return easing;
        }
        else if (typeof data.easingType === "string") {
            return templates.get(data.easingType);
        }
        else if (typeof data.easingType === "number" && data.easingType !== 0) {
            return rpeEasingArray[data.easingType];
        }
        else if (data.start === data.end) {
            return fixedEasing;
        }
        else {
            return linearEasing;
        }
    }
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data
     * @param templates
     * @returns
     */
    static fromEvent(data, templates) {
        let start = new EventStartNode(data.startTime, data.start);
        let end = new EventEndNode(data.endTime, data.end);
        start.easing = EventNode.getEasing(data, data.easingLeft, data.easingRight, templates);
        EventNode.connect(start, end);
        if (!start.easing) {
            start.easing = linearEasing;
            console.error("No easing found for event:", data, start, "will use linear by default");
        }
        return [start, end];
    }
    static connect(node1, node2) {
        node1.next = node2;
        node2.previous = node1;
        if (node1 && node2) {
            node2.parentSeq = node1.parentSeq;
        }
    }
    /*
    static disconnectStart(node: EventStartNode) {
        (node.previous.previous).next = node.next;
        node.previous.previous = null;
        node.next = null;
    }
    */
    static removeNodePair(endNode, startNode) {
        const prev = endNode.previous;
        const next = startNode.next;
        prev.next = next;
        next.previous = prev;
        endNode.previous = null;
        startNode.next = null;
        return [this.previousStartOfStart(prev), this.nextStartOfEnd(next)];
    }
    static insert(node, tarPrev) {
        const tarNext = tarPrev.next;
        if (node.previous.type === 0 /* NodeType.HEAD */) {
            throw new Error("Cannot insert a head node before any node");
        }
        this.connect(tarPrev, node.previous);
        node.parentSeq = node.previous.parentSeq;
        this.connect(node, tarNext);
        return [this.previousStartOfStart(tarPrev), this.nextStartOfEnd(tarNext)];
    }
    /**
     *
     * @param node
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart(node) {
        return node.next.type === 1 /* NodeType.TAIL */ ? node.next : node.next.next;
    }
    /**
     *
     * @param node
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd(node) {
        return node.type === 1 /* NodeType.TAIL */ ? node : node.next;
    }
    static previousStartOfStart(node) {
        return node.previous.type === 0 /* NodeType.HEAD */ ? node.previous : node.previous.previous;
    }
    /**
     * It does not return the start node which form an event with it.
     * @param node
     * @returns
     */
    static secondPreviousStartOfEnd(node) {
        return this.previousStartOfStart(node.previous);
    }
    static nextStartInJumpArray(node) {
        if (node.next.next.isLastStart()) {
            return node.next.next.next;
        }
        else {
            return node.next.next;
        }
    }
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node
     * @returns
     */
    static getEndStart(node) {
        if (node instanceof EventStartNode) {
            if (node.isFirstStart()) {
                throw new Error("Cannot get previous start node of the first start node");
            }
            return [node.previous, node];
        }
        else if (node instanceof EventEndNode) {
            return [node, node.next];
        }
    }
    static getStartEnd(node) {
        if (node instanceof EventStartNode) {
            return [node, node.next];
        }
        else if (node instanceof EventEndNode) {
            return [node.previous, node];
        }
        else {
            throw new Error("Invalid node type");
        }
    }
    static setToNewOrderedArray(dest, set) {
        const nodes = [...set];
        nodes.sort((a, b) => TimeCalculator.gt(a.time, b.time) ? 1 : -1);
        const offset = TimeCalculator.sub(dest, nodes[0].time);
        return [nodes, nodes.map(node => node.clonePair(offset))];
    }
    static belongToSequence(nodes, sequence) {
        for (let each of nodes) {
            if (each.parentSeq !== sequence) {
                return false;
            }
        }
        return true;
    }
    /**
     * 检验这些节点对是不是连续的
     * 如果不是不能封装为模板缓动
     * @param nodes 有序开始节点数组，必须都是带结束节点的（背靠背）（第一个除外）
     * @returns
     */
    static isContinuous(nodes) {
        const l = nodes.length;
        let nextNode = nodes[0];
        for (let i = 0; i < l - 1; i++) {
            const node = nextNode;
            nextNode = nodes[i + 1];
            if (node.next !== nextNode.previous) {
                return false;
            }
        }
        return true;
    }
    get innerEasing() {
        return this.easing instanceof SegmentedEasing ?
            this.easing.easing :
            this.easing;
    }
    /**
     * 设置easing，如果easing是分段缓动，则将分段缓动中的easing设置为innerEasing
     * 不可传入分段缓动，否则会出错
     */
    set innerEasing(easing) {
        if (this.easing instanceof SegmentedEasing) {
            this.easing.replace(easing);
        }
        else {
            this.easing = easing;
        }
    }
}
class EventStartNode extends EventNode {
    constructor(time, value) {
        super(time, value);
    }
    get easingIsSegmented() {
        return this.easing instanceof SegmentedEasing;
    }
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns
     */
    dump() {
        var _a;
        const endNode = this.next;
        const isSegmented = this.easingIsSegmented;
        const easing = isSegmented ? this.easing.easing : this.easing;
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: isSegmented ? this.easing.left : 0.0,
            easingRight: isSegmented ? this.easing.right : 1.0,
            // @ts-expect-error
            easingType: easing instanceof TemplateEasing ?
                (easing.name) :
                easing instanceof NormalEasing ?
                    (_a = easing.rpeId) !== null && _a !== void 0 ? _a : 1 :
                    null,
            end: easing === fixedEasing ? this.value : endNode.value,
            endTime: endNode.time,
            linkgroup: 0, // 假设默认值为 0
            start: this.value,
            startTime: this.time,
        };
    }
    /**
     * 仅用于编译至RPE时解决最后一个StartNode的问题
     * 限最后一个StartNode使用
     * @returns
     */
    dumpAsLast() {
        const isSegmented = this.easingIsSegmented;
        const easing = isSegmented ? this.easing.easing : this.easing;
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: isSegmented ? this.easing.left : 0.0,
            easingRight: isSegmented ? this.easing.right : 1.0,
            // @ts-expect-error
            easingType: easing instanceof TemplateEasing ?
                (easing.name) :
                easing instanceof NormalEasing ?
                    easing.rpeId :
                    null,
            end: this.value,
            endTime: TimeCalculator.add(this.time, [1, 0, 1]),
            linkgroup: 0, // 假设默认值为 0
            start: this.value,
            startTime: this.time,
        };
    }
    getValueAt(beats) {
        // 除了尾部的开始节点，其他都有下个节点
        // 钩定型缓动也有
        if (this.next.type === 1 /* NodeType.TAIL */) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time);
        let current = beats - TimeCalculator.toBeats(this.time);
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats);
        }
        // 参数方程型缓动无需指定首尾数值
        if (this.easing instanceof ParametricEquationEasing) {
            return this.easing.getValue(current / timeDelta);
        }
        let valueDelta = this.next.value - this.value;
        if (valueDelta === 0) {
            return this.value;
        }
        if (!this.easing) {
            debugger;
        }
        // 其他类型，包括普通缓动和非钩定模板缓动
        return this.value + this.easing.getValue(current / timeDelta) * valueDelta;
    }
    getSpeedValueAt(beats) {
        if (this.next.type === 1 /* NodeType.TAIL */) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time);
        let valueDelta = this.next.value - this.value;
        let current = beats - TimeCalculator.toBeats(this.time);
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats);
            // debugger
        }
        return this.value + linearEasing.getValue(current / timeDelta) * valueDelta;
    }
    /**
     * 积分获取位移
     */
    getIntegral(beats, timeCalculator) {
        return timeCalculator.segmentToSeconds(TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120; // 每单位120px
    }
    getFullIntegral(timeCalculator) {
        if (this.next.type === 1 /* NodeType.TAIL */) {
            console.log(this);
            throw new Error("getFullIntegral不可用于尾部节点");
        }
        let end = this.next;
        let endBeats = TimeCalculator.toBeats(end.time);
        let startBeats = TimeCalculator.toBeats(this.time);
        // 原来这里写反了，气死偶咧！
        return timeCalculator.segmentToSeconds(startBeats, endBeats) * (this.value + end.value) / 2 * 120;
    }
    isFirstStart() {
        return this.previous && this.previous.type === 0 /* NodeType.HEAD */;
    }
    isLastStart() {
        return this.next && this.next.type === 1 /* NodeType.TAIL */;
    }
    clone(offset) {
        return super.clone(offset);
    }
    ;
    clonePair(offset) {
        const endNode = this.previous.type !== 0 /* NodeType.HEAD */ ? this.previous.clone(offset) : new EventEndNode(this.time, this.value);
        const startNode = this.clone(offset);
        EventNode.connect(endNode, startNode);
        return startNode;
    }
    ;
    drawCurve(context, startX, startY, endX, endY, matrix) {
        if (!(this.easing instanceof ParametricEquationEasing)) {
            return this.easing.drawCurve(context, startX, startY, endX, endY);
        }
        const getValue = (ratio) => {
            return matrix.ymul(0, this.easing.getValue(ratio));
        };
        const timeDelta = endX - startX;
        let last = startY;
        context.beginPath();
        context.moveTo(startX, last);
        for (let t = 4; t <= timeDelta; t += 4) {
            const ratio = t / timeDelta;
            const curPosY = getValue(ratio);
            context.lineTo(startX + t, curPosY);
            last = curPosY;
        }
        context.stroke();
    }
}
class EventEndNode extends EventNode {
    get parentSeq() { var _a; return ((_a = this.previous) === null || _a === void 0 ? void 0 : _a.parentSeq) || null; }
    set parentSeq(_parent) { }
    constructor(time, value) {
        super(time, value);
    }
    getValueAt(beats) {
        return this.previous.getValueAt(beats);
    }
    clone(offset) {
        return super.clone(offset);
    }
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
class EventNodeSequence {
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(type, effectiveBeats) {
        this.type = type;
        this.effectiveBeats = effectiveBeats;
        this.head = new EventNodeLike(0 /* NodeType.HEAD */);
        this.tail = new EventNodeLike(1 /* NodeType.TAIL */);
        this.head.parentSeq = this.tail.parentSeq = this;
        this.listLength = 1;
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON(type, data, chart, endValue) {
        var _a, _b, _c;
        const { templateEasingLib: templates, timeCalculator } = chart;
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type, type === EventType.easing ? TimeCalculator.toBeats(data[length - 1].endTime) : chart.effectiveBeats);
        let listLength = length;
        let lastEnd = seq.head;
        let lastIntegral = 0;
        for (let index = 0; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if (lastEnd.type === 0 /* NodeType.HEAD */) {
                EventNode.connect(lastEnd, start);
            }
            else if (lastEnd.value === lastEnd.previous.value && lastEnd.previous.easing instanceof NormalEasing) {
                lastEnd.time = start.time;
                EventNode.connect(lastEnd, start);
            }
            else if (TimeCalculator.toBeats(lastEnd.time) !== TimeCalculator.toBeats(start.time)) {
                let val = lastEnd.value;
                let midStart = new EventStartNode(lastEnd.time, val);
                let midEnd = new EventEndNode(start.time, val);
                midStart.easing = lastEnd.previous.easing;
                EventNode.connect(lastEnd, midStart);
                EventNode.connect(midStart, midEnd);
                EventNode.connect(midEnd, start);
                // seq.startNodes.push(midStart);
                // seq.endNodes.push(midEnd);
                listLength++;
            }
            else {
                EventNode.connect(lastEnd, start);
            }
            // seq.startNodes.push(start);
            // seq.endNodes.push(end);
            lastEnd = end;
            // seq.nodes.push(start, end);
        }
        const last = lastEnd;
        const tail = new EventStartNode((_a = last.time) !== null && _a !== void 0 ? _a : [0, 0, 1], endValue !== null && endValue !== void 0 ? endValue : last.value);
        EventNode.connect(last, tail);
        // last can be a header, in which case easing is undefined.
        // then we use the easing that initialized in the EventStartNode constructor.
        tail.easing = (_c = (_b = last.previous) === null || _b === void 0 ? void 0 : _b.easing) !== null && _c !== void 0 ? _c : tail.easing;
        tail.cachedIntegral = lastIntegral;
        EventNode.connect(tail, seq.tail);
        seq.listLength = listLength;
        seq.initJump();
        return seq;
    }
    /**
     * 生成一个新的事件节点序列，仅拥有一个节点。
     * 需要分配ID！！！！！！
     * @param type
     * @param effectiveBeats
     * @returns
     */
    static newSeq(type, effectiveBeats) {
        const sequence = new EventNodeSequence(type, effectiveBeats);
        const node = new EventStartNode([0, 0, 1], type === EventType.speed ? 10 : 0);
        EventNode.connect(sequence.head, node);
        EventNode.connect(node, sequence.tail);
        sequence.initJump();
        return sequence;
    }
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
    /*update() {
        let {startNodes, endNodes} = this;
        startNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time))
        endNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time))
        const length = this.endNodes.length;
        // this.nodes = new Array(length * 2 + 1);
        let eventTime: Float64Array;
        this.eventTime = eventTime = new Float64Array(length);
        for (let i = 0; i < length; i++) {
            eventTime[i] = TimeCalculator.getDelta(endNodes[i].time, startNodes[i].time);
        }
    }*/
    initJump() {
        const originalListLength = this.listLength;
        const effectiveBeats = this.effectiveBeats;
        if (this.head.next === this.tail.previous) {
            return;
        }
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            // console.log(node)
            if (node.type === 1 /* NodeType.TAIL */) {
                return [null, null];
            }
            if (node.type === 0 /* NodeType.HEAD */) {
                if (node.next.next.type === 1 /* NodeType.TAIL */) {
                    return [0, node.next.next];
                }
                return [0, node.next];
            }
            const endNode = node.next;
            const time = TimeCalculator.toBeats(endNode.time);
            const nextNode = endNode.next;
            if (nextNode.next.type === 1 /* NodeType.TAIL */) {
                return [time, nextNode.next]; // Tailer代替最后一个StartNode去占位
            }
            else {
                return [time, nextNode];
            }
        }, (node, beats) => {
            return TimeCalculator.toBeats(node.next.time) > beats ? false : EventNode.nextStartInJumpArray(node);
        }, (node) => {
            return node.next && node.next.type === 1 /* NodeType.TAIL */ ? node.next : node;
        }
        /*(node: EventStartNode) => {
            const prev = node.previous;
            return prev.type === NodeType.HEAD ? node : prev.previous;
        }*/
        );
    }
    updateJump(from, to) {
        if (!this.jump || this.effectiveBeats !== this.jump.effectiveBeats) {
            this.initJump();
        }
        this.jump.updateRange(from, to);
    }
    insert() {
    }
    getNodeAt(beats, usePrev = false) {
        var _a;
        let node = ((_a = this.jump) === null || _a === void 0 ? void 0 : _a.getNodeAt(beats)) || this.head.next;
        if (node.type === 1 /* NodeType.TAIL */) {
            if (usePrev) {
                return node.previous.previous.previous;
            }
            // 最后一个事件节点本身具有无限延伸的特性
            return node.previous;
        }
        if (usePrev && TimeCalculator.toBeats(node.time) === beats) {
            const prev = node.previous;
            if (!(prev.type === 0 /* NodeType.HEAD */)) {
                node = prev.previous;
            }
        }
        if (TimeCalculator.toBeats(node.time) > beats && beats >= 0) {
            console.warn("Got a node after the given beats. This would only happen when the given beats is negative. Beats and Node:", beats, node);
        }
        return node;
    }
    getValueAt(beats, usePrev = false) {
        return this.getNodeAt(beats, usePrev).getValueAt(beats);
    }
    getIntegral(beats, timeCalculator) {
        const node = this.getNodeAt(beats);
        return node.getIntegral(beats, timeCalculator) + node.cachedIntegral;
    }
    updateNodesIntegralFrom(beats, timeCalculator) {
        let previousStartNode = this.getNodeAt(beats);
        previousStartNode.cachedIntegral = -previousStartNode.getIntegral(beats, timeCalculator);
        let totalIntegral = previousStartNode.cachedIntegral;
        let endNode;
        while ((endNode = previousStartNode.next).type !== 1 /* NodeType.TAIL */) {
            const currentStartNode = endNode.next;
            totalIntegral += previousStartNode.getFullIntegral(timeCalculator);
            currentStartNode.cachedIntegral = totalIntegral;
            previousStartNode = currentStartNode;
        }
    }
    dump() {
        const nodes = [];
        let currentNode = this.head.next;
        while (currentNode && !(currentNode.next.type === 1 /* NodeType.TAIL */)) {
            const eventData = currentNode.dump();
            nodes.push(eventData);
            currentNode = currentNode.next.next;
        }
        return {
            type: this.type,
            events: nodes,
            id: this.id,
            endValue: currentNode.value
        };
    }
}
/**
 *
 */
class BPMStartNode extends EventStartNode {
    constructor(startTime, bpm) {
        super(startTime, bpm);
        this.spb = 60 / bpm;
    }
    getIntegral(beats) {
        return (beats - TimeCalculator.toBeats(this.time)) * 60 / this.value;
    }
    /**
     * may only used with a startnode whose next is not tail
     * @returns
     */
    getFullIntegral() {
        return (TimeCalculator.toBeats(this.next.time) - TimeCalculator.toBeats(this.time)) * 60 / this.value;
    }
}
class BPMEndNode extends EventEndNode {
    constructor(endTime) {
        super(endTime, null);
    }
    // @ts-expect-error
    get value() {
        return this.previous.value;
    }
    set value(val) { }
}
/**
 * 拥有与事件类似的逻辑
 * 每对节点之间代表一个BPM相同的片段
 * 片段之间BPM可以发生改变
 */
class BPMSequence extends EventNodeSequence {
    constructor(bpmList, duration) {
        super(EventType.bpm, null);
        this.duration = duration;
        let curPos = this.head;
        let next = bpmList[0];
        this.listLength = bpmList.length;
        for (let i = 1; i < bpmList.length; i++) {
            const each = next;
            next = bpmList[i];
            const startNode = new BPMStartNode(each.startTime, each.bpm);
            const endNode = new BPMEndNode(next.startTime);
            BPMStartNode.connect(startNode, endNode);
            BPMStartNode.connect(curPos, startNode);
            curPos = endNode;
        }
        const last = new BPMStartNode(next.startTime, next.bpm);
        BPMStartNode.connect(curPos, last);
        BPMStartNode.connect(last, this.tail);
        this.initJump();
    }
    initJump() {
        console.log(this);
        this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.time);
        if (this.effectiveBeats !== 0) {
            super.initJump(); // 为0可以跳过jumpArray，用不到
            // 只有一个BPM片段就会这样
        }
        this.updateSecondJump();
    }
    updateSecondJump() {
        let integral = 0;
        // 计算积分并缓存到BPMNode
        let node = this.head.next;
        while (true) {
            node.cachedStartIntegral = integral;
            if (node.next.type === 1 /* NodeType.TAIL */) {
                break;
            }
            const endNode = node.next;
            integral += node.getFullIntegral();
            node.cachedIntegral = integral;
            node = endNode.next;
        }
        node.cachedStartIntegral = integral;
        if (this.effectiveBeats === 0) {
            return;
        }
        const originalListLength = this.listLength;
        this.secondJump = new JumpArray(this.head, this.tail, originalListLength, this.duration, (node) => {
            if (node.type === 1 /* NodeType.TAIL */) {
                return [null, null];
            }
            if (node.type === 0 /* NodeType.HEAD */) {
                return [0, node.next];
            }
            const endNode = node.next;
            const time = node.cachedIntegral;
            const nextNode = endNode.next;
            if (nextNode.next.type === 1 /* NodeType.TAIL */) {
                return [time, nextNode.next]; // Tailer代替最后一个StartNode去占位
            }
            else {
                return [time, nextNode];
            }
        }, 
        // @ts-expect-error
        (node, seconds) => {
            return node.cachedIntegral > seconds ? false : node.next.next;
        });
    }
    updateJump(from, to) {
        super.updateJump(from, to);
        this.updateSecondJump();
    }
    getNodeBySeconds(seconds) {
        if (this.effectiveBeats === 0) {
            return this.tail.previous;
        }
        const node = this.secondJump.getNodeAt(seconds);
        if (node.type === 1 /* NodeType.TAIL */) {
            return node.previous;
        }
        return node;
    }
    dumpBPM() {
        let cur = this.head.next;
        const ret = [];
        while (true) {
            ret.push({
                bpm: cur.value,
                startTime: cur.time
            });
            const end = cur.next;
            if (end.type === 1 /* NodeType.TAIL */) {
                break;
            }
            cur = end.next;
        }
        return ret;
    }
}
/**
 * @alias TC
 */
class TimeCalculator {
    constructor() {
    }
    update() {
        let bpmList = this.bpmList;
        this.bpmSequence = new BPMSequence(bpmList, this.duration);
    }
    toSeconds(beats) {
        const node = this.bpmSequence.getNodeAt(beats);
        return node.cachedStartIntegral + node.getIntegral(beats);
    }
    segmentToSeconds(beats1, beats2) {
        let ret = this.toSeconds(beats2) - this.toSeconds(beats1);
        if (ret < 0) {
            console.warn("segmentToSeconds的第二个参数需大于第一个！", "得到的参数：", arguments);
        }
        return ret;
    }
    secondsToBeats(seconds) {
        const node = this.bpmSequence.getNodeBySeconds(seconds);
        // console.log("node:", node)
        const beats = (seconds - node.cachedStartIntegral) / node.spb;
        return TimeCalculator.toBeats(node.time) + beats;
    }
    static toBeats(beaT) {
        if (!beaT)
            debugger;
        return beaT[0] + beaT[1] / beaT[2];
    }
    static getDelta(beaT1, beaT2) {
        return this.toBeats(beaT1) - this.toBeats(beaT2);
    }
    static eq(beaT1, beaT2) {
        return beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] === beaT1[2] * beaT2[1]; // 这里曾经把两个都写成beaT1，特此留念（
    }
    static gt(beaT1, beaT2) {
        return beaT1[0] > beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] > beaT1[2] * beaT2[1];
    }
    static lt(beaT1, beaT2) {
        return beaT1[0] < beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] < beaT1[2] * beaT2[1];
    }
    static ne(beaT1, beaT2) {
        return beaT1[0] !== beaT2[0] || beaT1[1] * beaT2[2] !== beaT1[2] * beaT2[1];
    }
    static add(beaT1, beaT2) {
        return [beaT1[0] + beaT2[0], beaT1[1] * beaT2[2] + beaT1[2] * beaT2[1], beaT1[2] * beaT2[2]];
    }
    static sub(beaT1, beaT2) {
        return [beaT1[0] - beaT2[0], beaT1[1] * beaT2[2] - beaT1[2] * beaT2[1], beaT1[2] * beaT2[2]];
    }
    static div(beaT1, beaT2) {
        return [(beaT1[0] * beaT1[2] + beaT1[1]) * beaT2[2], (beaT2[0] * beaT2[2] + beaT2[1]) * beaT1[2]];
    }
    static mul(beaT, ratio) {
        // 将带分数beaT: TimeT乘一个分数[number, number]得到一个新的带分数returnval: TimeT，不要求这个带分数分子不超过分母，但所有的数都是整数
        // （输入的两个元组都是整数元组）
        const [numerator, denominator] = ratio;
        const b0nume = beaT[0] * numerator;
        const remainder = b0nume % denominator;
        if (remainder === 0) {
            return [b0nume / denominator, beaT[1] * numerator, beaT[2] * denominator];
        }
        else {
            return [Math.floor(b0nume / denominator), beaT[1] * numerator + remainder * beaT[2], beaT[2] * denominator];
        }
    }
    /**
     * 原地规范化时间元组，但仍然返回这个元组，方便使用
     * validate TimeT in place
     * @param beaT
     */
    static validateIp(beaT) {
        if (beaT === undefined || beaT[2] === 0) {
            throw new Error("Invalid time" + beaT.valueOf());
        }
        if (beaT[1] >= beaT[2]) {
            const quotient = Math.floor(beaT[1] / beaT[2]);
            const remainder = beaT[1] % beaT[2];
            beaT[0] += quotient;
            beaT[1] = remainder;
        }
        else if (beaT[1] < 0) {
            const quotient = Math.floor(beaT[1] / beaT[2]);
            const remainder = beaT[2] + beaT[1] % beaT[2];
            beaT[0] += quotient;
            beaT[1] = remainder;
        }
        if (beaT[1] === 0) {
            beaT[2] = 1;
            return beaT;
        }
        const gcd = this.gcd(beaT[2], beaT[1]);
        if (gcd > 1) {
            beaT[1] /= gcd;
            beaT[2] /= gcd;
        }
        return beaT;
    }
    static gcd(a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }
        while (b !== 0) {
            const r = a % b;
            a = b;
            b = r;
        }
        return a;
    }
    dump() {
        return this.bpmSequence.dumpBPM();
    }
}
const TC = TimeCalculator;
/*
when和on开头的方法都可以绑定监听器

when的监听器绑定的是Z本身的事件

on的绑定的是Z所含的DOM元素事件

*/
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
class Z extends EventTarget {
    get parent() {
        return Z.from(this.element.parentElement);
    }
    constructor(type, newElement = true) {
        super();
        if (newElement)
            this.element = document.createElement(type);
    }
    get clientWidth() {
        return this.element.clientWidth;
    }
    get clientHeight() {
        return this.element.clientHeight;
    }
    html(str) {
        this.element.innerHTML = str;
        return this;
    }
    text(str) {
        const childNodes = this.element.childNodes;
        if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
            childNodes[0].nodeValue = str;
        }
        else {
            this.element.replaceChildren(str);
        }
        return this;
    }
    addClass(...classes) {
        this.element.classList.add(...classes);
        return this;
    }
    removeClass(...classes) {
        this.element.classList.remove(...classes);
    }
    release() {
        return this.element;
    }
    attr(name, value) {
        if (value) {
            this.element.setAttribute(name, value);
            return this;
        }
        else {
            return this.element.getAttribute(name);
        }
    }
    css(name, value) {
        if (value) {
            this.element.style[name] = value;
        }
        return this;
    }
    append(...$elements) {
        const elements = new Array($elements.length);
        for (let index = 0; index < $elements.length; index++) {
            const $element = $elements[index];
            elements[index] = $element instanceof Z ? $element.release() : $element;
        }
        this.element.append(...elements);
        return this;
    }
    after($e) {
        this.parent.element.insertBefore($e.element, this.element.nextSibling);
    }
    before($e) {
        this.parent.element.insertBefore($e.element, this.element);
    }
    insertAfter($e) {
        this.parent.element.insertBefore(this.element, $e.element.nextSibling);
    }
    insertBefore($e) {
        this.parent.element.insertBefore(this.element, $e.element);
    }
    appendTo(element) {
        element.append(this.element);
        return this;
    }
    onClick(callback) {
        this.element.addEventListener("click", callback);
        return this;
    }
    onInput(callback) {
        this.element.addEventListener("input", callback);
        return this;
    }
    on(eventType, callback) {
        this.element.addEventListener(eventType, callback);
        return this;
    }
    show() {
        this.element.style.display = "";
    }
    hide() {
        this.element.style.display = "none";
    }
    remove() {
        this.element.remove();
    }
    static from(element) {
        const $ele = new Z(element.localName);
        $ele.element = element;
        return $ele;
    }
    appendMass(callback) {
        const fragment = document.createDocumentFragment();
        this.append = (...$elements) => {
            fragment.append(...$elements.map(element => element instanceof Z ? element.element : element));
            return this;
        };
        callback();
        delete this.append;
        this.element.append(fragment);
        return this;
    }
    isFocused() {
        return this.element === document.activeElement;
    }
}
const $ = (strOrEle) => typeof strOrEle === "string" ? new Z(strOrEle) : Z.from(strOrEle);
/*
 * The classes below encapsulate some common UI Gadgets in KPA.
 */
class ZButton extends Z {
    get disabled() { return this._disabled; }
    set disabled(val) {
        if (val !== this._disabled) {
            this._disabled = val;
            if (val) {
                this.addClass("disabled");
            }
            else {
                this.removeClass("disabled");
            }
        }
    }
    constructor(text) {
        super("div");
        this.addClass("button");
        this.text(text);
    }
    onClick(callback) {
        this.element.addEventListener("click", (e) => {
            if (this.disabled) {
                return;
            }
            callback(e);
        });
        return this;
    }
}
class ZSwitch extends ZButton {
    get checked() {
        return this.element.classList.contains("checked");
    }
    set checked(val) {
        val = !!val;
        if (val !== this.checked) {
            this.element.classList.toggle("checked", val);
            this.text(val ? this.checkedText || this.innerText : this.innerText);
            this.dispatchEvent(new ZValueChangeEvent());
        }
    }
    constructor(innerText, checkedText) {
        super(innerText);
        this.innerText = innerText;
        this.checkedText = checkedText;
        this.addClass("switch");
        this.onClick(() => {
            this.checked = !this.checked;
            this.dispatchEvent(new Event("clickChange"));
        });
    }
    whenClickChange(callback) {
        this.addEventListener("clickChange", (event) => {
            callback(this.checked, event);
        });
        return this;
    }
    setAsChecked() {
        this.checked = true;
        return this;
    }
}
class ZValueChangeEvent extends Event {
    constructor() {
        super("valueChange");
    }
}
class ZInputBox extends Z {
    get disabled() { return this.element.disabled; }
    set disabled(val) {
        this.element.disabled = val;
    }
    constructor(defaultValue) {
        super("input");
        this.addClass("input-box");
        this.attr("type", "text");
        this.element.addEventListener("focusout", () => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        if (defaultValue)
            this.element.value = defaultValue;
    }
    getValue() {
        return this.element.value;
    }
    getInt() {
        if (!this.element.value) {
            this.element.value = this.lastInt + "";
            return this.lastInt;
        }
        return this.lastInt = parseInt(this.element.value);
    }
    getNum() {
        if (!this.element.value) {
            this.element.value = this.lastNum + "";
            return this.lastNum;
        }
        return this.lastNum = parseFloat(this.element.value);
    }
    setValue(val) {
        this.element.value = val;
        return this;
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", (event) => {
            const changesValue = callback(this.getValue(), event) !== false;
            if (!changesValue) {
                this.element.value = this._lastValue;
            }
            else {
                this._lastValue = this.element.value;
            }
        });
        return this;
    }
}
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
class ZArrowInputBox extends Z {
    constructor(defaultValue) {
        super("div");
        this.scale = 1;
        this.$input = new ZInputBox();
        this.$up = $("div")
            .addClass("arrow-up")
            .onClick(() => {
            this.setValue(this.getValue() + this.scale);
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$down = $("div")
            .addClass("arrow-down")
            .onClick(() => {
            console.log(this.getValue());
            this.setValue(this.getValue() - this.scale);
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.addClass("arrow-input-box");
        this.append(this.$up, this.$down, this.$input);
        this.$input.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        if (defaultValue) {
            this.setValue(defaultValue);
        }
    }
    getValue() {
        return this.$input.getNum();
    }
    setValue(val) {
        this.$input.setValue(val + "");
        return this;
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", (e) => callback(this.getValue(), e));
        return this;
    }
}
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
class ZFractionInput extends Z {
    constructor() {
        super("span");
        this.addClass("fraction-input");
        this.$int = new ZInputBox().addClass("integer");
        this.$nume = new ZInputBox().addClass("nume");
        this.$deno = new ZInputBox().addClass("deno");
        this.$deno.whenValueChange(() => {
            if (this.$deno.getValue() == "0") {
                this.$deno.setValue("1");
            }
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$int.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$nume.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.append(this.$int, this.$nume, $("div").addClass("line"), this.$deno);
    }
    getValue() {
        return [this.$int.getInt() || 0, this.$nume.getInt() || 0, this.$deno.getInt() || 1];
    }
    setValue(time) {
        this.$int.setValue(time[0] + "");
        this.$nume.setValue(time[1] + "");
        this.$deno.setValue(time[2] + "");
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        this._disabled = val;
        [this.$int, this.$deno, this.$nume].forEach(($e) => $e.disabled = val);
    }
    onChange(callback) {
        this.addEventListener("valueChange", (e) => {
            callback(this.getValue());
        });
    }
}
class BoxOption {
    constructor(text, onChangedTo, onChanged) {
        this.onChangedTo = onChangedTo;
        this.onChanged = onChanged;
        this.$elementMap = new Map();
        this.text = text;
    }
    getElement(box) {
        if (!this.$elementMap.has(box)) {
            this.$elementMap.set(box, $("div").addClass("box-option").text(this.text));
        }
        return this.$elementMap.get(box);
    }
}
class EditableBoxOption extends BoxOption {
    constructor(text, onEdited, onChangedTo, onChanged, editsItself) {
        super(text, onChangedTo, onChanged);
        this.onEdited = onEdited;
        this.editsItself = editsItself === undefined ? true : editsItself;
    }
    edit(text) {
        this.onEdited(this, text);
        if (this.editsItself) {
            this.text = text;
        }
    }
}
class ZDropdownOptionBox extends Z {
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.text(option.text);
        this._value = option;
    }
    constructor(options, up = false) {
        super("div");
        this.addClass("dropdown-option-box");
        if (up) {
            this.addClass("up");
        }
        this.$value = $("div");
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList;
        span.append(optionList);
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this);
            optionList.append($element);
        }
        optionList.onClick((event) => {
            const target = event.target;
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.getElement(this).release()) {
                    let option;
                    for (let i = 0; i < options.length; i++) {
                        option = options[i];
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option);
                    this.value = option;
                    this.dispatchEvent(new ZValueChangeEvent());
                }
            }
        });
        this.value = options[0];
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled");
        }
        else {
            this.removeClass("disabled");
        }
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", () => {
            callback(this.value.text);
        });
        return this;
    }
    appendOption(option) {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options) {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove());
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this));
        }
        return this;
    }
}
class ZEditableDropdownOptionBox extends Z {
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.setValue(option.text);
        this._value = option;
    }
    /**
     *
     * @param options
     * @param up determine whether the dropdown is up or down
     */
    constructor(options, up = false) {
        super("div");
        this.addClass("dropdown-option-box");
        if (up) {
            this.addClass("up");
        }
        this.$value = new ZInputBox();
        this.$value.onInput(() => {
            var _a;
            (_a = this.value) === null || _a === void 0 ? void 0 : _a.edit(this.$value.getValue());
        });
        this.$value.css("width", "100%");
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList;
        span.append(optionList);
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this);
            optionList.append($element);
        }
        optionList.onClick((event) => {
            var _a;
            const target = event.target;
            if (target instanceof HTMLDivElement) {
                if (target !== ((_a = this.value) === null || _a === void 0 ? void 0 : _a.getElement(this).release())) {
                    let option;
                    for (let i = 0; i < options.length; i++) {
                        option = options[i];
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option);
                    this.value = option;
                    this.dispatchEvent(new ZValueChangeEvent());
                }
            }
        });
        if (options.length > 0)
            this.value = options[0];
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled");
        }
        else {
            this.removeClass("disabled");
        }
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", () => {
            callback(this.value.text);
        });
        return this;
    }
    appendOption(option) {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options) {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove());
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this));
        }
        return this;
    }
}
const THRESHOLD = 100;
class ZSearchBox extends Z {
    constructor(searchable, up = false) {
        super("div");
        this.count = 5;
        this.$value = new ZInputBox("");
        this.$options = $("div").addClass("dropdown-option-list");
        this.lastFocusOutTime = 0;
        this._disabled = false;
        this.addClass("search-box");
        this.append($("span").append(this.$options));
        this.append(this.$value);
        this.$value.onInput(() => {
            const optionStrings = searchable(this.$value.getValue());
            if (Array.isArray(optionStrings)) {
                this.replaceWithOptions(optionStrings.slice(0, this.count));
            }
            else {
                optionStrings.then(strings => {
                    this.replaceWithOptions(strings.slice(0, this.count));
                });
            }
        });
        // 如果直接点下拉提示选项，直接判定focusout了，还没有修改值就触发监听器了
        // 所以不去直接监听输入框，而是监听输入框等50ms后再触发事件。
        this.$value.whenValueChange(() => {
            setTimeout(() => {
                this.dispatchEvent(new ZValueChangeEvent());
            }, 50);
            this.lastFocusOutTime = performance.now();
        });
    }
    replaceWithOptions(strings) {
        this.$options.html("");
        this.$options.appendMass(() => {
            for (const string of strings) {
                const $option = $("div").addClass("box-option").text(string);
                $option.onClick(() => {
                    this.value = string;
                    // 点击的时候focused已经没了，不能用这个作为依据判断
                    if (!this.wasInputing()) {
                        this.dispatchEvent(new ZValueChangeEvent());
                    }
                    else {
                        // 输入的时候点和鼠标悬浮时点是不一样的，
                        // 输入时点不应该保持下拉框，所以强行关掉，100ms后恢复可见性
                        // 但这时是需要重新悬浮的。
                        this.$options.hide();
                        setTimeout(() => this.$options.show(), 100);
                    }
                });
                this.$options.append($option);
            }
        });
    }
    get value() {
        return this.$value.getValue();
    }
    set value(value) {
        this.$value.setValue(value);
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", (event) => {
            callback(this.value, event);
        });
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(disabled) {
        if (this._disabled === disabled) {
            return;
        }
        this._disabled = disabled;
        this.$value.disabled = disabled;
    }
    wasInputing() {
        return performance.now() - this.lastFocusOutTime < 100;
    }
}
class ZMemorableBox extends ZSearchBox {
    constructor(options, up = false) {
        super((prefix) => this.history.filter((s) => s.startsWith(prefix)), up);
        this.history = [];
        this.maxHistory = 10;
        this.history = [...options];
        this.whenValueChange(() => {
            this.history.unshift(this.value);
            if (this.history.length > this.maxHistory) {
                this.history.pop();
            }
        });
    }
}
var EasingOptions;
(function (EasingOptions) {
    EasingOptions.IN = new BoxOption("in");
    EasingOptions.OUT = new BoxOption("out");
    EasingOptions.IO = new BoxOption("inout");
    EasingOptions.easeTypeOptions = [EasingOptions.IN, EasingOptions.OUT, EasingOptions.IO];
    EasingOptions.easeTypeOptionsMapping = { in: EasingOptions.IN, out: EasingOptions.OUT, inout: EasingOptions.IO };
    EasingOptions.FIXED = new BoxOption("fixed");
    EasingOptions.LINEAR = new BoxOption("linear");
    EasingOptions.SINE = new BoxOption("sine");
    EasingOptions.QUAD = new BoxOption("quad");
    EasingOptions.CUBIC = new BoxOption("cubic");
    EasingOptions.QUART = new BoxOption("quart");
    EasingOptions.QUINT = new BoxOption("quint");
    EasingOptions.EXPO = new BoxOption("expo");
    EasingOptions.CIRC = new BoxOption("circ");
    EasingOptions.BACK = new BoxOption("back");
    EasingOptions.ELASTIC = new BoxOption("elastic");
    EasingOptions.BOUNCE = new BoxOption("bounce");
    EasingOptions.funcTypeOptions = [EasingOptions.FIXED, EasingOptions.LINEAR, EasingOptions.SINE, EasingOptions.QUAD, EasingOptions.CUBIC, EasingOptions.QUART, EasingOptions.QUINT, EasingOptions.EXPO, EasingOptions.CIRC, EasingOptions.BACK, EasingOptions.ELASTIC, EasingOptions.BOUNCE];
    EasingOptions.funcTypeOptionsMapping = { fixed: EasingOptions.FIXED, linear: EasingOptions.LINEAR, sine: EasingOptions.SINE, quad: EasingOptions.QUAD, cubic: EasingOptions.CUBIC, quart: EasingOptions.QUART, quint: EasingOptions.QUINT, expo: EasingOptions.EXPO, circ: EasingOptions.CIRC, back: EasingOptions.BACK, elastic: EasingOptions.ELASTIC, bounce: EasingOptions.BOUNCE };
})(EasingOptions || (EasingOptions = {}));
/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
class ZEasingBox extends Z {
    constructor(dropdownUp = false) {
        super("div");
        this.$input = new ZArrowInputBox()
            .whenValueChange((num) => {
            const easing = easingArray[num];
            this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
            this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
            this.value = num;
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$easeType = new ZDropdownOptionBox(EasingOptions.easeTypeOptions, dropdownUp).whenValueChange(() => this.update());
        this.$funcType = new ZDropdownOptionBox(EasingOptions.funcTypeOptions, dropdownUp).whenValueChange(() => this.update());
        this.addClass("flex-row")
            .append(this.$input, $("span").text("Ease"), this.$easeType, this.$funcType);
    }
    update() {
        this.value = easingMap[this.$funcType.value.text][this.$easeType.value.text].id;
        this.$input.setValue(this.value);
        this.dispatchEvent(new ZValueChangeEvent());
    }
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing) {
        this.value = easing.id;
        this.$input.setValue(this.value);
        this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
        this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
    }
    onChange(callback) {
        this.addEventListener("valueChange", () => {
            callback(this.value);
        });
        return this;
    }
}
class ZRadioBox extends Z {
    constructor(name, options, defaultIndex = 0) {
        super("div");
        this.callbacks = [];
        this.$inputs = [];
        this.addClass("radio-box");
        for (let i = 0; i < options.length; i++) {
            const $input = $("input").attr("type", "radio").attr("name", name);
            this.$inputs.push($input);
            const $label = $("label").text(options[i]);
            this.append($input, $label);
            $input.on("change", () => {
                if (this.selectedIndex === i) {
                    return;
                }
                this.selectedIndex = i;
                this.callbacks.forEach(f => f(i));
            });
            if (i === defaultIndex) {
                $input.attr("checked", "true");
            }
        }
        this.selectedIndex = defaultIndex;
    }
    onChange(callback) {
        this.callbacks.push(callback);
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index) {
        if (this.selectedIndex === index) {
            return;
        }
        this.$inputs[this.selectedIndex].element.checked = false;
        this.$inputs[index].element.checked = true;
        this.selectedIndex = index;
        return this;
    }
}
/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
class ZRadioTabs extends Z {
    constructor(name, pages, defaultIndex = 0) {
        super("div");
        this.$pages = [];
        this.addClass("radio-tabs");
        const keys = Object.keys(pages);
        this.$radioBox = new ZRadioBox(name, keys, defaultIndex);
        this.append(this.$radioBox);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.append(pages[key]);
            this.$pages.push(pages[key]);
            if (i !== defaultIndex) {
                pages[key].hide();
            }
        }
        this.selectedIndex = defaultIndex;
        this.$radioBox.onChange((index) => {
            if (this.selectedIndex === index) {
                return;
            }
            pages[keys[this.selectedIndex]].hide();
            pages[keys[index]].show();
            this.selectedIndex = index;
        });
    }
    onChange(callback) {
        this.$radioBox.onChange(callback);
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index) {
        this.$radioBox.switchTo(index);
        this.$pages[this.selectedIndex].hide();
        this.$pages[index].show();
        this.selectedIndex = index;
        return this;
    }
}
class ZDialog extends Z {
    constructor() {
        super("dialog");
    }
    show() {
        this.element.show();
        return this;
    }
    bindDonePromise(promise) {
        promise.then(() => {
            this.element.close();
        });
        return this;
    }
    whenClosed(callback) {
        this.element.addEventListener("close", callback);
        return this;
    }
    close() {
        this.element.close();
    }
}
class ZNotification extends Z {
    constructor(text, timeout = 8000) {
        super("div");
        this.addClass("notification");
        setTimeout(() => this.addClass("fade-in"), 50);
        this.onClick(() => {
            this.removeClass("fade-in");
        });
        setTimeout(() => {
            this.removeClass("fade-in");
            setTimeout(() => {
                this.remove();
            }, 1000);
        }, timeout);
        this.$text = $("span").text(text);
        this.append(this.$text);
    }
}
function notify(message) {
    $(document.body).append(new ZNotification(message));
}
class ZTextArea extends Z {
    constructor(rows = 20, cols = 40) {
        super("textarea");
        this.attr("rows", rows + "");
        this.attr("cols", cols + "");
        this.attr("spellcheck", "false");
    }
    getValue() {
        return this.element.value;
    }
    setValue(value) {
        this.element.value = value;
        return this;
    }
    get value() {
        return this.element.value;
    }
    set value(value) {
        this.element.value = value;
    }
}
class JSEditor extends Z {
    constructor() {
        super("div");
        this.editor = new ZTextArea();
    }
    getValue() {
        return this.editor.getValue();
    }
    setValue(value) {
        this.editor.setValue(value);
        return this;
    }
}
class ZCollapseController extends Z {
    constructor(_folded, stopsPropagation = true) {
        super("div");
        this._folded = _folded;
        this.targets = [];
        if (_folded) {
            this.addClass("collapse-folded");
        }
        else {
            this.addClass("collapse-unfolded");
        }
        this.onClick((e) => {
            if (stopsPropagation)
                e.stopPropagation();
            this.folded = !this.folded;
        });
    }
    get folded() {
        return this._folded;
    }
    set folded(value) {
        if (value === this._folded) {
            return;
        }
        this._folded = value;
        if (value) {
            this.removeClass("collapse-unfolded");
            this.addClass("collapse-folded");
            for (const $target of this.targets) {
                $target.hide();
            }
        }
        else {
            this.addClass("collapse-unfolded");
            this.removeClass("collapse-folded");
            for (const $target of this.targets) {
                $target.show();
            }
        }
    }
    attach(...arr$element) {
        this.targets.push(...arr$element);
        if (this.folded)
            for (const $element of arr$element) {
                $element.hide();
            }
    }
}
const ENABLE_PLAYER = true;
const DRAWS_NOTES = true;
const DEFAULT_ASPECT_RATIO = 3 / 2;
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77";
const HIT_EFFECT_SIZE = 200;
const HALF_HIT = HIT_EFFECT_SIZE / 2;
// 以原点为中心，渲染的半径
const RENDER_SCOPE = 900;
const COMBO_TEXT = "KIPPHI";
const BASE_LINE_LENGTH = 4050;
const getVector = (theta) => [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
class Player {
    constructor(canvas) {
        this.tintNotesMapping = new Map();
        this.tintEffectMapping = new Map();
        this.greenLine = 0;
        this.currentCombo = 0;
        this.lastUncountedNNN = null;
        this.lastUncountedTailNNN = null;
        this.lastCountedBeats = 0;
        this.showsInfo = false;
        this.showsLineID = false;
        this.textureMapping = new Map();
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.audioProcessor = new AudioProcessor();
        this.hitCanvas = document.createElement("canvas");
        this.hitContext = this.hitCanvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 175;
        this.noteHeight = 10;
        this.initCoordinate();
        this.audio.addEventListener("ended", () => {
            this.playing = false;
        });
        this.initGreyScreen();
    }
    get time() {
        return (this.audio.currentTime || 0) - this.chart.offset / 1000 - 0.017;
    }
    get beats() {
        return this.chart.timeCalculator.secondsToBeats(this.time);
    }
    initCoordinate() {
        let { canvas, context, hitCanvas, hitContext } = this;
        // console.log(context.getTransform())
        const height = 900;
        const width = 1350;
        canvas.height = height;
        canvas.width = width;
        hitCanvas.height = height;
        hitCanvas.width = width;
        const RATIO = 1.0;
        // 计算最终的变换矩阵
        const tx = width / 2;
        const ty = height / 2;
        // 设置变换矩阵
        context.setTransform(RATIO, 0, 0, RATIO, tx, ty);
        //hitContext.scale(0.5, 0.5)
        context.save();
        hitContext.save();
        // console.log(context.getTransform())
    }
    renderDropScreen() {
        const { canvas, context } = this;
        context.fillStyle = "#6cf";
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444";
        context.font = "100px phigros";
        const metrics = context.measureText("松手释放");
        context.fillText("松手释放", -metrics.width / 2, 0);
        context.restore();
        context.save();
    }
    renderGreyScreen() {
        const { canvas, context } = this;
        context.fillStyle = "#AAA";
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444";
        context.font = "100px phigros";
        const metrics = context.measureText("放入文件");
        context.fillText("放入文件", -metrics.width / 2, 0);
        context.restore();
        context.save();
    }
    initGreyScreen() {
        const { canvas, context } = this;
        this.renderGreyScreen();
    }
    computeCombo() {
        const { chart } = this;
        const beats = this.beats;
        const timeCalculator = chart.timeCalculator;
        let lastUncountedNNN = this.lastUncountedNNN || chart.nnnList.head.next;
        let lastUncountedTailNNN = this.lastUncountedTailNNN || chart.nnnList.head.next;
        let lastCountedBeats = this.lastCountedBeats || 0;
        let combo = this.currentCombo;
        if (!this.playing) {
            combo = 0;
            lastUncountedNNN = chart.nnnList.head.next;
            lastUncountedTailNNN = chart.nnnList.head.next;
            lastCountedBeats = 0;
        }
        const countUntil = chart.nnnList.getNodeAt(beats);
        if (!TimeCalculator.lt(countUntil.startTime, lastUncountedNNN.startTime)) {
            for (let node = lastUncountedNNN; node.type !== 1 /* NodeType.TAIL */ && node !== countUntil; node = node.next) {
                const nns = node.noteNodes;
                const nnsLength = nns.length;
                for (let i = 0; i < nnsLength; i++) {
                    const nn = nns[i];
                    combo += nn.notes.reduce((num, note) => num + (note.isFake ? 0 : 1), 0);
                }
            }
            this.lastUncountedNNN = countUntil;
        }
        const countHoldTailUntil = chart.nnnList.getNodeAt(beats);
        if (!TimeCalculator.lt(countHoldTailUntil.startTime, lastUncountedNNN.startTime)) {
            let uncounted = null;
            for (let node = lastUncountedTailNNN; node.type !== 1 /* NodeType.TAIL */ && node !== countHoldTailUntil; node = node.next) {
                const hns = node.holdNodes;
                const len = hns.length;
                for (let i = 0; i < len; i++) {
                    const hn = hns[i];
                    const notes = hn.notes;
                    const l = notes.length;
                    let j = 0;
                    for (; j < l; j++) {
                        const note = notes[j];
                        if (TimeCalculator.toBeats(note.endTime) > beats) {
                            if (!uncounted) {
                                uncounted = node;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    for (; j < l; j++) {
                        const note = notes[j];
                        if (note.isFake || TimeCalculator.toBeats(note.endTime) < lastCountedBeats) {
                            continue;
                        }
                        combo++;
                    }
                }
            }
            this.lastUncountedTailNNN = uncounted || countHoldTailUntil;
            this.lastCountedBeats = beats;
        }
        this.currentCombo = combo;
    }
    render() {
        if (!ENABLE_PLAYER) {
            return;
        }
        // console.time("render")
        const context = this.context;
        const hitContext = this.hitContext;
        hitContext.clearRect(0, 0, 1350, 900);
        context.drawImage(this.background, -675, -450, 1350, 900);
        // 涂灰色（背景变暗）
        context.fillStyle = "#2227";
        context.fillRect(-27000, -18000, 54000, 36000);
        // 画出渲染范围圆
        context.strokeStyle = "#66ccff";
        context.arc(0, 0, RENDER_SCOPE, 0, 2 * Math.PI);
        context.stroke();
        context.restore();
        context.save();
        context.strokeStyle = "#FFFFFF";
        drawLine(context, -1350, 0, 1350, 0);
        drawLine(context, 0, 900, 0, -900);
        // console.log("rendering")
        for (let line of this.chart.orphanLines) {
            this.renderLine(identity.translate(675, 450).scale(1, -1), line);
            context.restore();
            context.save();
        }
        hitContext.strokeStyle = "#66ccff";
        hitContext.lineWidth = 5;
        drawLine(hitContext, 0, 900, 1350, 0);
        context.drawImage(this.hitCanvas, -675, -450, 1350, 900);
        context.restore();
        context.save();
        if (this.showsInfo) {
            const setTransform = (lineOrNull) => {
                if (!lineOrNull) {
                    context.setTransform(identity.translate(675, 450));
                }
                else {
                    context.setTransform(lineOrNull.renderMatrix);
                    context.scale(1, -1);
                }
            };
            this.computeCombo();
            context.fillStyle = "#ddd";
            context.font = "40px phigros";
            const chart = this.chart;
            const title = chart.name;
            const level = chart.level;
            const combo = this.currentCombo;
            setTransform(chart.nameAttach);
            context.fillText(title, -600, 400);
            const metrics = context.measureText(level);
            setTransform(chart.levelAttach);
            context.fillText(level, 600 - metrics.width, 400);
            const score = combo / chart.maxCombo * 1000000;
            const text = score.toFixed(0).padStart(7, "0");
            setTransform(chart.scoreAttach);
            context.textAlign = "right";
            context.fillText(text, 600, -400);
            if (combo >= 3) {
                context.textAlign = "center";
                context.font = "60px phigros";
                setTransform(chart.combonumberAttach);
                context.fillText(combo.toString(), 0, -400);
                context.font = "20px phigros";
                const h = 32;
                setTransform(chart.comboAttach);
                context.fillText(COMBO_TEXT, 0, -400 + h);
            }
            context.restore();
            context.save();
        }
        // this.soundQueue = [];
        // console.timeEnd("render")
    }
    renderLine(matrix, judgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator;
        const beats = this.beats;
        // const timeCalculator = this.chart.timeCalculator
        const alpha = judgeLine.getStackedValue("alpha", beats);
        if (judgeLine.nnLists.size === 0 && judgeLine.hnLists.size === 0 && alpha <= 0 && judgeLine.children.size === 0 && !judgeLine.hasAttachUI) {
            return;
        }
        const x = judgeLine.getStackedValue("moveX", beats);
        const y = judgeLine.getStackedValue("moveY", beats);
        const theta = judgeLine.getStackedValue("rotate", beats) * Math.PI / 180;
        judgeLine.moveX = x;
        judgeLine.moveY = y;
        judgeLine.rotate = theta;
        judgeLine.alpha = alpha;
        const { x: transformedX, y: transformedY } = new Coordinate(x, y).mul(matrix);
        const myMatrix = judgeLine.rotatesWithFather ? matrix.translate(x, y).rotate(-theta) : identity.translate(transformedX, transformedY).rotate(-theta).scale(1, -1);
        context.setTransform(myMatrix);
        // Cache a matrix
        judgeLine.renderMatrix = myMatrix;
        if (judgeLine.children.size !== 0) {
            for (let line of judgeLine.children) {
                context.save();
                this.renderLine(myMatrix, line);
                context.restore();
            }
        }
        // Draw Line
        const scaleX = 1.0;
        const scaleY = 1.0;
        const anchor = judgeLine.anchor;
        let textureName = judgeLine.texture;
        if (textureName !== "line.png" && !this.textureMapping.get(textureName)) {
            textureName = "line.png";
        }
        context.scale(1, -1);
        if (textureName === "line.png") {
            const lineColor = [200, 200, 120];
            context.fillStyle = rgba(...(this.greenLine === judgeLine.id ? [100, 255, 100] : lineColor), alpha / 255);
            const scaledWidth = BASE_LINE_LENGTH * scaleX;
            const scaledHeight = LINE_WIDTH * scaleY;
            context.fillRect(-scaledWidth * anchor[0], -scaledHeight * anchor[1], scaledWidth, scaledHeight);
            // #1
        }
        else {
            context.globalAlpha = alpha / 255;
            const bitmap = this.textureMapping.get(textureName);
            const width = bitmap.width;
            const height = bitmap.height;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;
            context.drawImage(this.textureMapping.get(textureName), -scaledWidth * anchor[0], -scaledHeight * anchor[1], scaledWidth, scaledHeight);
            context.globalAlpha = 1;
        }
        context.scale(1, -1);
        // Draw Anchor
        context.drawImage(ANCHOR, -10, -10);
        if (this.showsLineID) {
            context.save();
            context.scale(1, -1);
            context.fillStyle = "white";
            context.font = "40px phigros";
            context.fillText(`#${judgeLine.id} ${judgeLine.name.toLowerCase() === "untitled" ? "" : judgeLine.name}`, 10, 50);
            context.restore();
        }
        /** 判定线的法向量 */
        const nVector = getVector(theta)[1]; // 奇变偶不变，符号看象限(
        const toCenter = [675 - transformedX, 450 - transformedY];
        // 法向量是单位向量，分母是1，不写
        /** the distance between the center and the line */
        const innerProd = innerProduct(toCenter, nVector);
        const getYs = judgeLine.cover ? (offset) => {
            const distance = Math.abs(innerProd + offset);
            let startY, endY;
            if (distance < RENDER_SCOPE) {
                startY = 0; // 0
                endY = distance + RENDER_SCOPE;
            }
            else {
                startY = distance - RENDER_SCOPE;
                endY = distance + RENDER_SCOPE;
            }
            return [startY, endY];
        } : (offset) => {
            const distance = Math.abs(innerProd + offset);
            let startY, endY;
            if (distance < RENDER_SCOPE) {
                startY = distance - RENDER_SCOPE; // 显示线下音符
                endY = distance + RENDER_SCOPE;
            }
            else {
                startY = distance - RENDER_SCOPE;
                endY = distance + RENDER_SCOPE;
            }
            return [startY, endY];
        };
        /*
        const drawScope = (y: number) => {
            if (y<=1e-6) return
            context.save()
            context.strokeStyle = "#66ccff"
            context.lineWidth = 2
            drawLine(context, -1350, +y, 1350, +y)
            drawLine(context, -1350, -y, 1350, -y)
            context.restore()

        }
        */
        const hitRenderLimit = beats > 0.66 ? beats - 0.66 : 0; // 渲染 0.66秒内的打击特效
        const holdTrees = judgeLine.hnLists;
        const noteTrees = judgeLine.nnLists;
        // console.time("Updating integral");
        if (holdTrees.size || noteTrees.size) {
            judgeLine.updateSpeedIntegralFrom(beats, timeCalculator);
        }
        // console.timeEnd("Updating integral");
        for (let trees of [holdTrees, noteTrees]) {
            for (const [_, list] of trees) {
                const speedVal = list.speed;
                if (DRAWS_NOTES) {
                    // debugger
                    // 渲染音符
                    // console.time("computeTimeRange")
                    const [startY, endY] = getYs(list.medianYOffset);
                    const timeRanges = speedVal !== 0 ? judgeLine.computeTimeRange(beats, timeCalculator, startY / speedVal, endY / speedVal) : [[0, Infinity]];
                    list.timeRanges = timeRanges;
                    // console.timeEnd("computeTimeRange");
                    // console.time("Rendering notes");
                    // console.log(timeRanges, startY, endY);
                    for (let range of timeRanges) {
                        const start = range[0];
                        const end = range[1];
                        // drawScope(judgeLine.getStackedIntegral(start, timeCalculator))
                        // drawScope(judgeLine.getStackedIntegral(end, timeCalculator))
                        let noteNode = list.getNodeAt(start, true);
                        // console.log(noteNode)
                        let startBeats;
                        while (!(noteNode.type === 1 /* NodeType.TAIL */)
                            && (startBeats = TimeCalculator.toBeats(noteNode.startTime)) < end) {
                            // 判断是否为多押
                            const isChord = noteNode.notes.length > 1
                                || noteNode.totalNode.noteNodes.some(node => node !== noteNode && node.notes.length)
                                || noteNode.totalNode.holdNodes.some(node => node !== noteNode && node.notes.length);
                            this.renderSameTimeNotes(noteNode, isChord, judgeLine, timeCalculator);
                            noteNode = noteNode.next;
                        }
                    }
                    // console.timeEnd("Rendering notes");
                }
                // console.time("Rendering hit effects");
                // 打击特效
                if (beats > 0) {
                    if (list instanceof HNList) {
                        this.renderHoldHitEffects(myMatrix, list, beats, hitRenderLimit, beats, timeCalculator);
                    }
                    else {
                        this.renderHitEffects(myMatrix, list, hitRenderLimit, beats, timeCalculator);
                    }
                }
                // console.timeEnd("Rendering hit effects");
            }
        }
        this.playSounds();
    }
    playSounds() {
        if (!this.playing) {
            return;
        }
        const beats = this.beats;
        const timeCalculator = this.chart.timeCalculator;
        const lastNNN = this.lastUnplayedNNNode;
        const startingFrom = lastNNN.type === 1 /* NodeType.TAIL */ ? Infinity : TimeCalculator.toBeats(lastNNN.startTime);
        const needsReset = startingFrom >= beats || timeCalculator.segmentToSeconds(startingFrom, beats) > 0.05;
        // 超过0.05秒就会认为是快进过来的，这个时候，如果播放会很吵
        if (needsReset) {
            this.lastUnplayedNNNode = this.chart.nnnList.getNodeAt(beats);
            return;
        }
        let node = lastNNN;
        for (; node.type !== 1 /* NodeType.TAIL */ && TimeCalculator.toBeats(node.startTime) < beats; node = node.next) {
            const nns = node.noteNodes;
            const hns = node.holdNodes;
            const nnl = nns.length;
            for (let i = 0; i < nnl; i++) {
                const node = nns[i];
                const nl = node.notes.length;
                for (let j = 0; j < nl; j++) {
                    const note = node.notes[j];
                    if (note.isFake) {
                        continue;
                    }
                    this.audioProcessor.playNoteSound(note.type);
                }
            }
            const hnl = hns.length;
            for (let i = 0; i < hnl; i++) {
                const node = hns[i];
                const nl = node.notes.length;
                for (let j = 0; j < nl; j++) {
                    const note = node.notes[j];
                    if (note.isFake) {
                        continue;
                    }
                    this.audioProcessor.playNoteSound(NoteType.hold);
                }
            }
        }
        this.lastUnplayedNNNode = node;
    }
    renderHitEffects(matrix, tree, startBeats, endBeats, timeCalculator) {
        let noteNode = tree.getNodeAt(startBeats, true);
        const { hitContext } = this;
        // console.log(hitContext.getTransform())
        const end = tree.getNodeAt(endBeats);
        if (noteNode.type === 1 /* NodeType.TAIL */) {
            return;
        }
        while (noteNode !== end) {
            const beats = TimeCalculator.toBeats(noteNode.startTime);
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                if (note.isFake) {
                    continue;
                }
                const posX = note.positionX;
                const yo = note.yOffset * (note.above ? 1 : -1);
                const { x, y } = new Coordinate(posX, yo).mul(matrix);
                // console.log("he", x, y);
                const he = note.tintHitEffects;
                const nth = Math.floor((this.time - timeCalculator.toSeconds(beats)) * 16);
                drawNthFrame(hitContext, he !== undefined ? this.getTintHitEffect(he) : HIT_FX, nth, x - HALF_HIT, y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE);
            }
            noteNode = noteNode.next;
        }
    }
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
    renderHoldHitEffects(matrix, tree, beats, startBeats, endBeats, timeCalculator) {
        const start = tree.getNodeAt(startBeats, true);
        const { hitContext } = this;
        let noteNode = start;
        const end = tree.getNodeAt(endBeats);
        if (noteNode.type === 1 /* NodeType.TAIL */) {
            return;
        }
        if (noteNode !== end)
            // console.log("start", start, startBeats, endBeats)
            while (noteNode !== end) {
                const notes = noteNode.notes, len = notes.length;
                for (let i = 0; i < len; i++) {
                    const note = notes[i];
                    if (note.isFake) {
                        continue;
                    }
                    if (startBeats > TimeCalculator.toBeats(note.endTime)) {
                        continue;
                    }
                    const posX = note.positionX;
                    const yo = note.yOffset * (note.above ? 1 : -1);
                    const { x, y } = new Coordinate(posX, yo).mul(matrix);
                    const nth = Math.floor((this.beats - Math.floor(this.beats)) * 16);
                    const he = note.tintHitEffects;
                    drawNthFrame(hitContext, he !== undefined ? this.getTintHitEffect(he) : HIT_FX, nth, x - HALF_HIT, y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE);
                }
                noteNode = noteNode.next;
            }
    }
    renderSameTimeNotes(noteNode, chord, judgeLine, timeCalculator) {
        if (noteNode.isHold) {
            const startY = judgeLine.getStackedIntegral(TimeCalculator.toBeats(noteNode.startTime), timeCalculator) * noteNode.parentSeq.speed;
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                this.renderNote(note, chord, startY < 0 ? 0 : startY, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.endTime), timeCalculator) * note.speed);
            }
        }
        else {
            // console.log("renderSameTimeNotes", noteNode)
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                this.renderNote(note, chord, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed);
            }
        }
    }
    renderNote(note, chord, positionY, endpositionY) {
        // console.log(note, this.beats)
        if (TimeCalculator.toBeats(note.endTime) < this.beats) {
            return;
        }
        if (TimeCalculator.toBeats(note.startTime) - note.visibleBeats > this.beats) {
            return;
        }
        let image = note.tint ? this.getTintNote(note.tint, note.type) : getImageFromType(note.type);
        const context = this.context;
        let zero = 0;
        if (note.yOffset) {
            positionY += note.yOffset;
            endpositionY += note.yOffset;
            zero = note.yOffset;
        }
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY;
            zero = -zero;
        }
        let length = endpositionY - positionY;
        const size = this.noteSize * note.size;
        const half = size / 2;
        const height = this.noteHeight;
        // console.log(NoteType[note.type])
        const opac = note.alpha < 255;
        if (opac) {
            context.save();
            context.globalAlpha = note.alpha / 255;
        }
        if (note.type === NoteType.hold) {
            const isJudging = TimeCalculator.toBeats(note.startTime) <= this.beats;
            positionY = isJudging ? zero : positionY;
            length = isJudging ? (endpositionY - zero) : length;
            context.drawImage(HOLD_BODY, note.positionX - half, positionY - 10, size, length);
        }
        context.drawImage(image, note.positionX - half, positionY - 10, size, height);
        if (chord) {
            context.drawImage(DOUBLE, note.positionX - half, positionY - 10, size, height);
        }
        if (!note.above) {
            context.drawImage(BELOW, note.positionX - half, positionY - 10, size, height);
        }
        if (opac) {
            context.restore();
        }
    }
    getTintNote(tint, type) {
        const map = this.tintNotesMapping;
        const key = tint | type << 24; // 25位整形表示一个类型的Note贴图
        const canBeSource = map.get(key);
        if (canBeSource) {
            return canBeSource;
        }
        const source = new OffscreenCanvas(NOTE_WIDTH, NOTE_HEIGHT);
        const context = source.getContext('2d');
        context.drawImage(getImageFromType(type), 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = "#" + tint.toString(16).padStart(6, "0");
        context.fillRect(0, 0, NOTE_WIDTH, NOTE_HEIGHT);
        map.set(key, source); // 在ImageBitmap创建完成之前，先使用Canvas临时代替
        createImageBitmap(source).then((bmp) => {
            map.set(key, bmp);
        });
        return source;
    }
    getTintHitEffect(tint) {
        const map = this.tintEffectMapping;
        const key = tint;
        const canBeSource = map.get(key);
        if (canBeSource) {
            return canBeSource;
        }
        const source = new OffscreenCanvas(HIT_FX_SIZE, HIT_FX_SIZE);
        const context = source.getContext('2d');
        context.clearRect(0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.drawImage(HIT_FX, 0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = "#" + tint.toString(16);
        context.fillRect(0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.globalCompositeOperation = 'multiply';
        context.drawImage(HIT_FX, 0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        map.set(key, source);
        createImageBitmap(source).then((bmp) => {
            map.set(key, bmp);
        });
        return source;
    }
    update() {
        if (!this.playing) {
            return;
        }
        // console.log("anifr")
        requestAnimationFrame(() => {
            // console.log("render")
            this.render();
            this.update();
        });
        this.lastBeats = this.beats;
    }
    play() {
        this.audio.play();
        this.playing = true;
        this.update();
    }
    pause() {
        this.audio.pause();
        this.playing = false;
    }
    receive(chart) {
        this.chart = chart;
        // 还是播放器适合处理纹理请求这事（
        const textures = chart.scanAllTextures();
        textures.delete("line.png");
        for (const texture of textures) {
            serverApi.fetchTexture(texture).then((bmp) => {
                this.textureMapping.set(texture, bmp);
            });
        }
        this.lastUnplayedNNNode = chart.nnnList.head.next;
    }
}
class ZProgressBar extends Z {
    constructor(target) {
        super("progress");
        this.target = target;
        const element = this.element;
        if (target.duration) {
            this.element.max = target.duration;
        }
        target.addEventListener("loadeddata", () => {
            this.element.max = target.duration;
        });
        target.addEventListener("play", () => {
            this.update();
        });
        let controlling = false;
        on(["mousedown", "touchstart"], element, (event) => {
            controlling = true;
            this.dispatchEvent(new Event("pause"));
        });
        on(["mousemove", "touchmove"], element, (event) => {
            let posX;
            if (!controlling) {
                return;
            }
            if (event instanceof MouseEvent) {
                posX = event.clientX;
            }
            else {
                posX = event.changedTouches[0].clientX;
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
            this.dispatchEvent(new CustomEvent("change", { detail: value }));
        });
        on(["mouseup", "touchend"], element, (event) => {
            let posX;
            if (!controlling) {
                return;
            }
            controlling = false;
            if (event instanceof MouseEvent) {
                posX = event.clientX;
            }
            else {
                posX = event.changedTouches[0].clientX;
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
            this.dispatchEvent(new CustomEvent("change", { detail: value }));
        });
        on(["mouseleave", "touchend"], element, () => {
            controlling = false;
        });
    }
    update() {
        if (this.target.paused) {
            return;
        }
        requestAnimationFrame(() => {
            this.element.value = this.target.currentTime;
            this.update();
        });
    }
}
class SoundEntity {
    // playingSound: boolean;
    constructor(type, beats, timeCalculator) {
        this.type = type;
        // this.playsSound = playsSound;
        // this.posX = posX;
        // this.posY = posY;
        this.beats = beats;
        this.seconds = timeCalculator.toSeconds(beats);
        // this.playingSound = false;
    }
}
const connect = (foreNode, lateNode) => {
    foreNode.next = lateNode;
};
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;
/** @deprecated */
const toTimeString = (beaT) => `${beaT[0]}:${beaT[1]}/${beaT[2]}`;
function drawLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}
// ParameterListSoLoooongException()
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
function drawBezierCurve(context, startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    context.stroke();
}
/**
 * To assign the same handler for different event types on an element
 * @param eventTypes array of strings representing the types
 * @param element
 * @param handler
 */
function on(eventTypes, element, handler) {
    for (let type of eventTypes) {
        element.addEventListener(type, handler);
    }
}
/**
 * to print a two-directional node list
 * @param list
 */
function printList(list) {
    let cur = list.head;
    while (1) {
        console.log(cur);
        if ("tailing" in cur) {
            break;
        }
        cur = cur.next;
    }
}
/**
 * to compute the length of a vector
 * @param v
 * @returns length
 */
const absVector = (v) => {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
};
/**
 *
 * @param v1
 * @param v2
 * @returns
 */
const innerProduct = (v1, v2) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
};
const getOffset = (element) => {
    const rect = element.getBoundingClientRect();
    return [rect.left, rect.top];
};
/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
const getOffsetCoordFromEvent = (event, element) => {
    if (event instanceof MouseEvent) {
        return [event.offsetX, event.offsetY];
    }
    else {
        const [left, top] = getOffset(element); // 不是简单的offsetLeft，因为offsetLeft是相对于offsetParent的
        return [event.changedTouches[0].clientX - left, event.changedTouches[0].clientY - top];
    }
};
function saveTextToFile(text, filename) {
    // 创建一个 Blob 对象
    const blob = new Blob([text], { type: 'text/plain' });
    // 创建一个 URL 对象
    const url = URL.createObjectURL(blob);
    // 创建一个 <a> 元素
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // 将 <a> 元素添加到文档中
    document.body.appendChild(a);
    // 触发点击事件
    a.click();
    // 移除 <a> 元素
    document.body.removeChild(a);
    // 释放 URL 对象
    URL.revokeObjectURL(url);
}
function shortenFloat(num, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(num * multiplier) / multiplier;
}
function changeAudioTime(audio, delta) {
    const time = audio.currentTime + delta;
    if (time < 0) {
        audio.currentTime = 0;
    }
    else if (time > audio.duration) {
        audio.currentTime = audio.duration;
    }
    else {
        audio.currentTime = time;
    }
}
/**
 * 获取一串数字的第？分位数
 */
function getPercentile(sorted, percentile) {
    return sorted[Math.floor(sorted.length * percentile)];
}
const isAllDigits = (str) => /^\d+$/.test(str);
const extend = (target, source) => {
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    });
};
/**
 * 检查值的类型
 * @param value
 * @param type 为字符串时，用typeof检测，为构造函数时，用instanceof检测，为数组时，识别为元组类型。
 */
const checkType = (value, type) => {
    if (Array.isArray(type)) {
        return Array.isArray(value)
            && value.length === type.length
            && type.every((t, i) => checkType(value[i], t));
    }
    else if (typeof type === "string") {
        return typeof value === type;
    }
    else {
        return value instanceof type;
    }
};
const numNoun = (num, singular, plural = singular + "s") => {
    if (num <= 1) {
        return `${num} ${singular}`;
    }
    else {
        return `${num} ${plural}`;
    }
};
const numNounWithoutZero = (num, singular, plural = singular + "s") => {
    if (num === 0) {
        return "";
    }
    else {
        return numNoun(num, singular, plural);
    }
};
const bisearchInsertLeft = (arr, target) => {
    let left = 0, right = arr.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] < target) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
};
const formatTime = (minutes, seconds) => {
    if ((seconds === undefined || seconds === 0) && (minutes === undefined || minutes === 0)) {
        return "0";
    }
    if (seconds > 60) {
        minutes += Math.floor(seconds / 60);
        seconds %= 60;
    }
    const hrs = Math.floor(minutes / 60);
    minutes %= 60;
    return numNounWithoutZero(hrs, "hr") + " " + numNounWithoutZero(minutes, "min") + " " + numNounWithoutZero(seconds, "sec");
};
const PROJECT_NAME = "kpa";
class ChartMetadata {
    constructor(name, song, picture, chart) {
        this.name = name;
        this.song = song;
        this.picture = picture;
        this.chart = chart;
    }
    static fromJson(json) {
        return new ChartMetadata(json.Name, json.Song, json.Picture, json.Chart);
    }
    toJson() {
        return JSON.stringify({
            Name: this.name,
            Song: this.song,
            Picture: this.picture,
            Chart: this.chart
        });
    }
}
class ServerApi extends EventTarget {
    constructor() {
        super();
        this.statusPromise = fetch("/status")
            .then(res => {
            if (res.status == 204) {
                this.supportsServer = true;
                document.title += "Connected";
                this.dispatchEvent(new Event("load"));
                return true;
            }
            else {
                this.supportsServer = false;
                this.dispatchEvent(new Event("load"));
                return false;
            }
        });
    }
    getChart(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.chartId = id;
            const res0 = yield fetch(`/Resources/${id}/metadata.json`);
            if (res0.status === 404) {
                alert("Chart not found");
            }
            const metadata = ChartMetadata.fromJson(yield res0.json());
            const chartPath = metadata.chart;
            const picturePath = metadata.picture;
            const songPath = metadata.song;
            const res1 = yield fetch(`/Resources/${id}/${chartPath}`);
            const res2 = yield fetch(`/Resources/${id}/${picturePath}`);
            const res3 = yield fetch(`/Resources/${id}/${songPath}`);
            return [yield res1.blob(), yield res2.blob(), yield res3.blob()];
        });
    }
    uploadChart(chart, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" });
            const res = yield fetch(`/commit/${id}?message=${message}`, {
                method: "POST",
                body: chartBlob,
            });
            notify((yield res.json()).message);
            return res.status === 200;
        });
    }
    autosave(chart) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" });
            const res = yield fetch(`/autosave/${id}`, {
                method: "POST",
                body: chartBlob,
            });
            if (res.status !== 200) {
                return false;
            }
            return res.status === 200;
        });
    }
    fetchVersion(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`/Resources/${this.chartId}/history/${versionId}`);
            return yield res.json();
        });
    }
    resolvePath(path) {
        if (this.supportsServer) {
            return path;
        }
        else {
            return PROJECT_NAME + "/" + path;
        }
    }
    fetchTexture(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const response = yield fetch(`/Resources/${id}/${name}`);
            if (response.status !== 200) {
                return null;
            }
            const blob = yield response.blob();
            return yield createImageBitmap(blob);
        });
    }
    queryTextures() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const response = yield fetch(`/Resources/${id}/textures`);
            if (response.status !== 200) {
                return [];
            }
            else {
                const json = yield response.json();
                return json.textures;
            }
        });
    }
}
class Settings {
    constructor() {
        let json;
        if (json = localStorage.getItem("settings")) {
            this.cache = JSON.parse(json);
        }
        else {
            this.cache = {
                lineColor: [200, 200, 120],
                playerShowInfo: true
            };
        }
    }
    get(item) {
        return this.cache[item];
    }
    set(item, val) {
        this.cache[item] = val;
        localStorage.setItem("settings", JSON.stringify(this.cache));
    }
}
class Comparer {
    constructor() {
        this.$topBar = $(document.getElementById("topbar"));
        this.$button = new ZButton("播放");
        this.player1 = new Player(document.getElementById("left-player"));
        this.player2 = new Player(document.getElementById("right-player"));
        this.progressBar = new ZProgressBar(this.player1.audio);
        this.player2.audio = this.player1.audio; // 替换原来的，构成共享关系
        this.$button.onClick(() => {
            if (this.playing) {
                this.pause();
            }
            else {
                this.play();
            }
        });
        this.progressBar.addEventListener("pause", () => this.pause());
        this.progressBar.addEventListener("change", () => {
            this.player1.render();
            this.player2.render();
        });
        this.$topBar.append(this.$button, this.progressBar);
    }
    readImage(blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        this.player1.background = this.player2.background = img;
    }
    readAudio(blob) {
        const url = URL.createObjectURL(blob);
        this.player1.audio.src = this.player2.audio.src = url;
    }
    loadChart(data, data2) {
        const chart = Chart.fromKPAJSON(data);
        const chart2 = Chart.fromKPAJSON(data2);
        this.player1.chart = chart;
        this.player2.chart = chart2;
    }
    get playing() {
        return this.player1.playing;
    }
    play() {
        if (this.playing) {
            return;
        }
        this.$button.text("暂停");
        this.player1.play();
        this.player2.play();
    }
    pause() {
        this.player1.pause();
        this.player2.pause();
        this.$button.text("继续");
    }
}
const serverApi = new ServerApi();
let settings;
serverApi.addEventListener("load", () => {
    fetchImage();
    const comparer = new Comparer();
    settings = new Settings();
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const segs = pathname.split("/");
    const id = segs[2];
    const left = url.searchParams.get('left');
    const right = url.searchParams.get('right');
    serverApi.getChart(id).then(([chart, illustration, music]) => {
        comparer.readAudio(music);
        comparer.readImage(illustration);
    });
    serverApi.fetchVersion(left).then((l) => {
        serverApi.fetchVersion(right).then((r) => {
            comparer.loadChart(l, r);
        });
    });
});
//# sourceMappingURL=diff.js.map
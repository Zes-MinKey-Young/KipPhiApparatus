
const LONG_PRESS_THRESHOLD_MS = 400;


type CSSStyleName = Exclude<keyof CSSStyleDeclaration, "length"
    | "parentRule" | "item" | "getPropertyValue" 
    | "getPropertyPriority" | "setProperty" | "removeProperty">

type HTMLElementTagName = keyof HTMLElementTagNameMap



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
class Z<K extends HTMLElementTagName> extends EventTarget {
    element: HTMLElementTagNameMap[K];
    registered = false;
    get parent() {
        return Z.from(this.element.parentElement);
    }
    constructor(type: K, newElement: boolean = true) {
        super();
        if (newElement) {
            this.element = document.createElement(type);
        }
        
    }
    bindHandlers() {
        if (this.registered) {
            return;
        }
        this.registered = true;
        let lastTimeMs = 0;
        let timeOutId: number = undefined;
        on(["mousedown", "touchstart"], this.element, (e) => {
            lastTimeMs = e.timeStamp;
            timeOutId = setTimeout(() => {
                this.dispatchEvent(new TouchOrMouseEvent("longpress", {
                // 基础属性
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                composed: e.composed,
                
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey
            }))
            }, LONG_PRESS_THRESHOLD_MS);
        });
        on(["mouseup", "touchend"], this.element, (e) => {
            if (e.timeStamp - lastTimeMs < LONG_PRESS_THRESHOLD_MS) {
                clearTimeout(timeOutId);
                this.dispatchEvent(new TouchOrMouseEvent("shortpress", {
                    // 基础属性
                    bubbles: e.bubbles,
                    cancelable: e.cancelable,
                    composed: e.composed,
                    
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey
                }))
            }
        });
    }
    get clientWidth() {
        return this.element.clientWidth;
    }
    get clientHeight() {
        return this.element.clientHeight;
    }
    html(str: string) {
        this.element.innerHTML = str
        return this;
    }
    text(str: string) {
        const childNodes = this.element.childNodes
        if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
            childNodes[0].nodeValue = str;
        } else {
            this.element.replaceChildren(str)
        }
        return this
    }
    addClass(...classes: string[]) {
        this.element.classList.add(...classes)
        return this;
    }
    removeClass(...classes: string[]) {
        this.element.classList.remove(...classes)
    }
    release() {
        return this.element;
    }
    attr(name: string): string;
    attr(name: string, value: string): this;
    attr(name: string, value?: string) {
        if (value) {
            this.element.setAttribute(name, value)
            return this;
        } else {
            return this.element.getAttribute(name);
        }
    }
    css(name: CSSStyleName, value: string) {
        if (value) {
            this.element.style[name] = value
        }
        return this;
    }
    append(...$elements: (Z<any> | HTMLElement)[]) {
        const elements = new Array($elements.length);
        for (let index = 0; index < $elements.length; index++) {
            const $element = $elements[index];
            elements[index] = $element instanceof Z ? $element.release() : $element;
        }
        this.element.append(...elements)
        return this;
    }
    after($e: Z<keyof HTMLElementTagNameMap>) {
        this.parent.element.insertBefore($e.element, this.element.nextSibling);
    }
    before($e: Z<keyof HTMLElementTagNameMap>) {
        this.parent.element.insertBefore($e.element, this.element);
    }
    insertAfter($e: Z<keyof HTMLElementTagNameMap>) {
        this.parent.element.insertBefore(this.element, $e.element.nextSibling);
    }
    insertBefore($e: Z<keyof HTMLElementTagNameMap>) {
        this.parent.element.insertBefore(this.element, $e.element);
    }
    appendTo(element: HTMLElement | Z<keyof HTMLElementTagNameMap>) {
        element.append(this.element)
        return this;
    }
    onClick(callback: (e: Event) => any) {
        this.element.addEventListener("click", callback)
        return this;
    }
    onInput(callback: (e: Event) => any) {
        this.element.addEventListener("input", callback)
        return this;
    }
    /**
     * 用于绑定元素原生事件
     * @param eventType 
     * @param callback 
     * @returns 
     */
    
    on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    on(eventType: string, callback: (e: Event) => any) {
        this.element.addEventListener(eventType, callback)
        return this;
    }
    show() {
        this.element.style.display = ""
    }
    hide() {
        this.element.style.display = "none"
    }
    remove() {
        this.element.remove()
    }
    static from<K extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[K]) {
        const $ele = new Z(element.localName as K);
        $ele.element = element;
        return $ele;
    }
    appendMass(callback: () => void) {
        const fragment = document.createDocumentFragment();
        this.append = (...$elements) => {
            fragment.append(...$elements.map(element => element instanceof Z ? element.element : element));
            return this;
        }
        callback();
        delete this.append;
        this.element.append(fragment);
        return this;
    }
    isFocused() {
        return this.element === document.activeElement;
    }
    whenShortPressed(callback: (e: TouchOrMouseEvent) => any) {
        if (!this.registered) {
            this.bindHandlers();
        }
        // @ts-ignore
        this.addEventListener("shortpress", callback)
        return this;
    }
    whenLongPressed(callback: (e: TouchOrMouseEvent) => any) {
        if (!this.registered) {
            this.bindHandlers();
        }
        // @ts-ignore
        this.addEventListener("longpress", callback)
        return this;
    }
}

const $: <K extends keyof HTMLElementTagNameMap>(strOrEle: K | HTMLElementTagNameMap[K]) => Z<K>
 = <K extends keyof HTMLElementTagNameMap>(strOrEle: K | HTMLElementTagNameMap[K]) => typeof strOrEle === "string" ? new Z(strOrEle) : Z.from<K>(strOrEle);

type CommonPart<T, U> = {
  [K in keyof T & keyof U]: T[K] extends U[K] ? T[K] : never;
};

type ITouchOrMouseEvent = CommonPart<MouseEvent, TouchEvent>;

class TouchOrMouseEvent extends Event implements ITouchOrMouseEvent {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    detail: any;
    which: any;
    initUIEvent() {}
    view: any;
    constructor(type: string, eventInitDict?: Partial<CommonPart<MouseEventInit, TouchEventInit>>) {
        super(type, eventInitDict);
        this.ctrlKey = eventInitDict.ctrlKey;
        this.shiftKey = eventInitDict.shiftKey;
        this.altKey = eventInitDict.altKey;
        this.metaKey = eventInitDict.metaKey;
        this.detail = eventInitDict.detail;
        this.which = eventInitDict.which;
    }
}


interface ZButtonEventMap /* extends ZEventMap*/ {
    "longpress": TouchOrMouseEvent;
    "shortpress": TouchOrMouseEvent;
}

/*
 * The classes below encapsulate some common UI Gadgets in KPA.
 */

class ZButton extends Z<"div"> {
    _disabled: boolean;
    get disabled() { return  this._disabled }
    set disabled(val) {
        if (val !== this._disabled) {
            this._disabled = val;
            if (val) {
                this.addClass("disabled")
            } else {
                this.removeClass("disabled")
            }
        }
    }
    constructor(text: string) {
        super("div")
        this.addClass("button")
        this.text(text)
    }
    onClick(callback: (e: Event) => any): this {
        this.element.addEventListener("click", (e) => {
            if (this.disabled) {
                return;
            }

            callback(e)
        })
        return this;
    }
    whenShortPressed(callback: (e: TouchOrMouseEvent) => any) {
        super.whenShortPressed((e) => {
            if (this.disabled) {
                return;
            }
            callback(e);
        })
        return this;
    }
    whenLongPressed(callback: (e: TouchOrMouseEvent) => any) {
        super.whenLongPressed((e) => {
            if (this.disabled) {
                return;
            }
            callback(e);
        })
        return this;
    }
}

class ZSwitch extends ZButton {
    get checked() {
        return this.element.classList.contains("checked")
    }
    set checked(val) {
        val = !!val;
        if (val !== this.checked) {
            this.element.classList.toggle("checked", val)
            this.text(val ? this.checkedText || this.innerText : this.innerText)
            this.dispatchEvent(new ZValueChangeEvent())
        }
    }
    constructor(public innerText: string, public checkedText?: string) {
        super(innerText)
        this.addClass("switch")
        this.onClick(() => {
            this.checked = !this.checked;
            this.dispatchEvent(new Event("clickChange"))
        })
    }
    whenClickChange(callback: (checked: boolean, e: Event) => any) {
        this.addEventListener("clickChange", (event) => {
            callback(this.checked, event);
        })
        return this;
    }
    setAsChecked() {
        this.checked = true;
        return this;
    }
}

class ZValueChangeEvent extends Event {
    constructor() {
        super("valueChange")
    } 
}

class ZInputBox extends Z<"input"> {
    _disabled: boolean;
    get disabled() { return this.element.disabled}
    set disabled(val) {
                this.element.disabled = val
    }
    constructor(defaultValue?: string) {
        super("input")
        this.addClass("input-box")
        this.attr("type", "text")
        this.element.addEventListener("focusout", () => {
            this.dispatchEvent(new ZValueChangeEvent())
        });
        if (defaultValue)
        this.element.value = defaultValue;
    }
    getValue() {
        return this.element.value
    }
    lastInt: number;
    lastNum: number
    getInt() {
        if (!this.element.value) {
            this.element.value = this.lastInt + ""
            return this.lastInt
        }
        return this.lastInt = parseInt(this.element.value)
    }
    getNum() {
        
        if (!this.element.value) {
            this.element.value = this.lastNum + ""
            return this.lastNum
        }
        return this.lastNum = parseFloat(this.element.value)
    }
    setValue(val: string) {
        this.element.value = val
        return this;
    }
    private _lastValue: string;
    whenValueChange(callback: (content: string, e: Event) => any) {
        this.addEventListener("valueChange", (event) => {
            const changesValue = callback(this.getValue(), event) !== false;
            if (!changesValue) {
                this.element.value = this._lastValue
            } else {
                this._lastValue = this.element.value
            }
        })
        return this;
    }
}
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
class ZArrowInputBox extends Z<"div"> {
    scale: number;
    $up: Z<"div">;
    $down: Z<"div">;
    $input: ZInputBox;
    constructor(defaultValue?: number) {
        super("div")
        this.scale = 1
        this.$input = new ZInputBox();
        this.$up = $("div")
            .addClass("arrow-up")
            .onClick(() => {
                this.setValue(this.getValue() + this.scale)
                this.dispatchEvent(new ZValueChangeEvent())
            });
        this.$down = $("div")
            .addClass("arrow-down")
            .onClick(() => {
                console.log(this.getValue())
                this.setValue(this.getValue() - this.scale)
                this.dispatchEvent(new ZValueChangeEvent())
            })
        this.addClass("arrow-input-box")
        this.append(
            this.$up,
            this.$down,
            this.$input
            )
        this.$input.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent())
        })
        if (defaultValue) {
            this.setValue(defaultValue)
        }
    }
    getValue() {
        return this.$input.getNum()
    }
    setValue(val: number) {
        this.$input.setValue(val + "")
        return this
    }
    whenValueChange(callback: (content: number, e: Event) => any) {
        this.addEventListener("valueChange", (e) => callback(this.getValue(), e))
        return this;
    }
}
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
class ZFractionInput extends Z<"span"> {
    $int: ZInputBox;
    $nume: ZInputBox;
    $deno: ZInputBox;
    constructor() {
        super("span")
        this.addClass("fraction-input");
        this.$int = new ZInputBox().addClass("integer");
        this.$nume = new ZInputBox().addClass("nume");
        this.$deno = new ZInputBox().addClass("deno");
        this.$deno.whenValueChange(() => {
            if (this.$deno.getValue() == "0") {
                this.$deno.setValue("1");
            }
            this.dispatchEvent(new ZValueChangeEvent())
        });
        this.$int.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent()) 
        });
        this.$nume.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent())
        })

        this.append(
            this.$int,
            this.$nume,
            $("div").addClass("line"),
            this.$deno
        )
    }
    getValue(): TimeT {
        return [this.$int.getInt() || 0, this.$nume.getInt() || 0, this.$deno.getInt() || 1]
    }
    setValue(time: TimeT) {
        this.$int.setValue(time[0] + "");
        this.$nume.setValue(time[1] + "")
        this.$deno.setValue(time[2] + "")
        return this;
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        this._disabled = val;
        [this.$int, this.$deno, this.$nume].forEach(($e) => $e.disabled = val)
    }
    onChange(callback: (result: TimeT) => void) {
        this.addEventListener("valueChange", (e) => {
            callback(this.getValue())
        })
    }
}

class BoxOption {
    $elementMap: Map<ZDropdownOptionBox, Z<"div">>;
    text: string;

    constructor(text: string, public onChangedTo?: (option: BoxOption) => void, public onChanged?: (option: BoxOption) => void) {
        this.$elementMap = new Map();
        this.text = text;
    }
    getElement(box: ZDropdownOptionBox) {
        if (!this.$elementMap.has(box)) {
            this.$elementMap.set(box, $("div").addClass("box-option").text(this.text));
        }
        return this.$elementMap.get(box)
    }
}

class EditableBoxOption extends BoxOption {
    editsItself: boolean;
    onEdited: (option: BoxOption, text: string) => void
    constructor(text: string, onEdited: (option: BoxOption, text: string) => void, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void, editsItself?: boolean) {
        super(text, onChangedTo, onChanged)
        this.onEdited = onEdited;
        this.editsItself = editsItself === undefined ? true : editsItself
    }
    edit(text: string) {
        this.onEdited(this, text)
        if (this.editsItself) {
            this.text = text;
        }
    }
}


class ZDropdownOptionBox extends Z<"div"> {
    readonly options: BoxOption[];
    _value: BoxOption;
    $optionList: Z<"div">
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.text(option.text);
        this._value = option
    }
    $value: Z<"div">
    constructor(options: BoxOption[], up: boolean=false) {
        super("div")
        this.addClass("dropdown-option-box")
        if (up) {
            this.addClass("up")
        }
        this.$value = $("div")
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList
        span.append(optionList)
        this.options = [...options];
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this);
            optionList.append($element)
        }
        optionList.onClick((event) => {
            const target = event.target
            const options = this.options
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.getElement(this).release()) {
                    let option: BoxOption;
                    for (let i = 0; i < options.length; i++) {
                        option = options[i]
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option)
                    this.value = option
                    this.dispatchEvent(new ZValueChangeEvent())
                }
            }
        })
        this.value = options[0];
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled")
        } else {
            this.removeClass("disabled")
        }
    }
    
    whenValueChange(callback: (val: string) => any) {
        this.addEventListener("valueChange", () => {
            callback(this.value.text);
        })
        return this;
    }
    appendOption(option: BoxOption): this {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options: BoxOption[]): this {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove())
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this))
        }
        return this;
    }
}

class ZEditableDropdownOptionBox extends Z<"div"> {
    $optionList: Z<"div">
    readonly options: EditableBoxOption[];
    _value: EditableBoxOption;
    get value(): EditableBoxOption | undefined {
        return this._value;
    }
    set value(option) {
        this.$value.setValue(option.text);
        this._value = option
    }
    $value: ZInputBox
    /**
     * 
     * @param options 
     * @param up determine whether the dropdown is up or down
     */
    constructor(options: EditableBoxOption[], up: boolean=false) {
        super("div")
        this.addClass("dropdown-option-box")
        if (up) {
            this.addClass("up")
        }
        this.$value = new ZInputBox()
        this.$value.onInput(() => {
            this.value?.edit(this.$value.getValue())
        })
        this.$value.css("width", "100%")
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList
        span.append(optionList)
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this)
            optionList.append($element)
        }
        optionList.onClick((event) => {
            const target = event.target
            if (target instanceof HTMLDivElement) {
                if (target !== this.value?.getElement(this).release()) {
                    let option: EditableBoxOption;
                    for (let i =0; i < options.length; i++) {
                        option = options[i]
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option)
                    this.value = option
                    this.dispatchEvent(new ZValueChangeEvent())
                }
            }
        })
        if (options.length > 0)
            this.value = options[0];
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled")
        } else {
            this.removeClass("disabled")
        }
    }
    
    whenValueChange(callback: (val: string) => any) {
        this.addEventListener("valueChange", () => {
            callback(this.value.text);
        })
        return this;
    }
    appendOption(option: EditableBoxOption): this {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options: EditableBoxOption[]): this {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove())
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this))
        }
        return this;
    }
}


class ZSearchBox extends Z<"div"> {
    count = 5
    readonly $value = new ZInputBox("");
    readonly $options = $("div").addClass("dropdown-option-list")
    lastFocusOutTime = 0;

    constructor(searchable: (s: string) => (string[] | Promise<string[]>), up: boolean=false) {
        super("div");
        this.addClass("search-box");
        this.append($("span").append(this.$options));
        this.append(this.$value);
        this.$value.onInput(() => {
            const optionStrings = searchable(this.$value.getValue());
            if (Array.isArray(optionStrings)) {
                this.replaceWithOptions(optionStrings.slice(0, this.count));
            } else {
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
            this.lastFocusOutTime = performance.now()
        })
    }
    replaceWithOptions(strings: string[]) {
        this.$options.html("");
        this.$options.appendMass(() => {
            for (const string of strings) {
                const $option = $("div").addClass("box-option").text(string);
                $option.onClick(() => {
                    this.value = string;
                    // 点击的时候focused已经没了，不能用这个作为依据判断
                    if (!this.wasInputing()) {
                        this.dispatchEvent(new ZValueChangeEvent());
                    } else {
                        // 输入的时候点和鼠标悬浮时点是不一样的，
                        // 输入时点不应该保持下拉框，所以强行关掉，100ms后恢复可见性
                        // 但这时是需要重新悬浮的。
                        this.$options.hide();
                        setTimeout(() => this.$options.show(), 100);
                    }
                })
                this.$options.append($option);
            }
        });
    }
    get value() {
        return this.$value.getValue();
    }
    set value(value: string) {
        this.$value.setValue(value);
    }
    whenValueChange(callback: (value: string, e: Event) => void) {
        this.addEventListener("valueChange", (event) => {
            callback(this.value, event);
        });
    }
    private _disabled = false;
    get disabled() {
        return this._disabled;
    }
    set disabled(disabled: boolean) {
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
    history: string[] = [];
    maxHistory = 10;
    constructor(options: string[], up: boolean=false) {
        super(
            (prefix) => this.history.filter(
                (s) => s.startsWith(prefix)
            ),
            up
        )
        this.history = [...options];
        this.whenValueChange(() => {
            this.history.unshift(this.value);
            if (this.history.length > this.maxHistory) {
                this.history.pop();
            }
        })
    }
}

namespace EasingOptions {
    export const IN = new BoxOption("in");
    export const OUT = new BoxOption("out");
    export const IO = new BoxOption("inout");
    export const easeTypeOptions = [IN, OUT, IO];
    export const easeTypeOptionsMapping = {in: IN, out: OUT, inout: IO}
    export const FIXED = new BoxOption("fixed");
    export const LINEAR = new BoxOption("linear");
    export const SINE = new BoxOption("sine");
    export const QUAD = new BoxOption("quad");
    export const CUBIC = new BoxOption("cubic");
    export const QUART = new BoxOption("quart");
    export const QUINT = new BoxOption("quint");
    export const EXPO = new BoxOption("expo");
    export const CIRC = new BoxOption("circ");
    export const BACK = new BoxOption("back");
    export const ELASTIC = new BoxOption("elastic");
    export const BOUNCE = new BoxOption("bounce");
    export const funcTypeOptions = [FIXED, LINEAR, SINE, QUAD, CUBIC, QUART, QUINT, EXPO, CIRC, BACK, ELASTIC, BOUNCE];
    export const funcTypeOptionsMapping = {fixed: FIXED,linear: LINEAR, sine: SINE, quad: QUAD, cubic: CUBIC, quart: QUART, quint: QUINT, expo: EXPO, circ: CIRC, back: BACK, elastic: ELASTIC, bounce: BOUNCE}
}

/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
class ZEasingBox extends Z<"div"> {
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    value: number;
    constructor(dropdownUp: boolean=false) {
        super("div")
        this.$input = new ZArrowInputBox()
            .whenValueChange((num) => {
                const easing = easingArray[num]
                this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
                this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
                this.value = num;
                this.dispatchEvent(new ZValueChangeEvent())
            });
        this.$easeType = new ZDropdownOptionBox(EasingOptions.easeTypeOptions, dropdownUp).whenValueChange(() => this.update())
        this.$funcType = new ZDropdownOptionBox(EasingOptions.funcTypeOptions, dropdownUp).whenValueChange(() => this.update())

        this.addClass("flex-row")
            .append(
                this.$input,
                $("span").text("Ease"), this.$easeType, this.$funcType
            )
    }
    update() {
        this.value = easingMap[this.$funcType.value.text][this.$easeType.value.text].id;
        this.$input.setValue(this.value);
        this.dispatchEvent(new ZValueChangeEvent())
    }
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing: NormalEasing) {
        this.value = easing.id;
        this.$input.setValue(this.value)
        this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
        this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
    }

    onChange(callback: (value: number) => void) {
        this.addEventListener("valueChange", () => {
            callback(this.value);
        })
        return this;
    }
}

class ZRadioBox extends Z<"div"> {
    $inputs: Z<"input">[];
    selectedIndex: number;
    _disabledIndexes: number[];
    get disabledIndexes() {
        return this._disabledIndexes;
    }
    set disabledIndexes(value: number[]) {
        this._disabledIndexes = value;
        for (let i = 0; i < this.$inputs.length; i++) {
            this.$inputs[i].element.disabled = value.indexOf(i) >= 0;
        }
        // 如果当前的栏被禁，跳到第一个没被禁的
        if (this.disabledIndexes.indexOf(this.selectedIndex) >= 0) {
            for (let i = 0; i < this.$inputs.length; i++) {
                if (this.disabledIndexes.indexOf(i) < 0) {
                    this.selectedIndex = i;
                    this.dispatchEvent(new ZValueChangeEvent())
                    break;
                }
            }
        }
    }
    constructor(name:string, options: string[], defaultIndex: number = 0) {
        super("div")
        this.$inputs = [];
        this.addClass("radio-box")
        for (let i = 0; i < options.length; i++) {
            const $input = $("input").attr("type", "radio").attr("name", name);
            this.$inputs.push($input);
            const $label = $("label").text(options[i]);
            this.append($input, $label)
            $input.on("change",() => {
                if (this.selectedIndex === i) { return }
                this.selectedIndex = i
                this.dispatchEvent(new ZValueChangeEvent());
            })
            if (i === defaultIndex) {
                $input.attr("checked", "true")
            }
        }
        this.selectedIndex = defaultIndex;
    }
    onChange(callback: (index: number) => void) {
        this.addEventListener("valueChange", () => {
            callback(this.selectedIndex);
        })
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index 
     * @returns 
     */
    switchTo(index: number) {
        if (this.selectedIndex === index) { return }
        this.$inputs[this.selectedIndex].element.checked = false
        this.$inputs[index].element.checked = true
        this.selectedIndex = index
        return this;
    }
}

/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
class ZRadioTabs extends Z<"div"> {
    $radioBox: ZRadioBox;
    selectedIndex: number;
    $pages: Z<any>[]
    constructor(name: string, pages: Plain<Z<any>>, defaultIndex: number = 0) {
        super("div")
        this.$pages = []
        this.addClass("radio-tabs")
        const keys = Object.keys(pages)
        this.$radioBox = new ZRadioBox(name, keys, defaultIndex)
        this.append(this.$radioBox)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.append(pages[key]);
            this.$pages.push(pages[key])
            if (i !== defaultIndex) {
                pages[key].hide()
            }
        }
        this.selectedIndex = defaultIndex;
        this.$radioBox.onChange((index) => {
            if (this.selectedIndex === index) { return }
            pages[keys[this.selectedIndex]].hide()
            pages[keys[index]].show()
            this.selectedIndex = index
        })
    }
    onChange(callback: (index: number) => void) {
        this.$radioBox.onChange(callback)
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index 
     * @returns 
     */
    switchTo(index: number) {
        this.$radioBox.switchTo(index)
        this.$pages[this.selectedIndex].hide()
        this.$pages[index].show()
        this.selectedIndex = index;
        return this;
    }
}

class ZDialog extends Z<"dialog"> {
    constructor() {
        super("dialog");
    }
    show() {
        this.element.show()
        return this;
    }
    bindDonePromise(promise: Promise<any>) {
        promise.then(() => {
            this.element.close()
        })
        return this;
    }
    whenClosed(callback: () => void) {
        this.element.addEventListener("close", callback)
        return this;
    }
    close() {
        this.element.close()
    }
}

class ZNotification extends Z<"div"> {
    $text: Z<"span">
    $close: Z<"span">
    constructor(text: string, timeout: number = 8000) {
        super("div")
        this.addClass("notification");
        setTimeout(() => this.addClass("fade-in"), 50);
        this.onClick(() => {
            this.removeClass("fade-in");
        });
        setTimeout(() => {
            this.removeClass("fade-in");
            setTimeout(() => {
                this.remove();
            }, 1000)
        }, timeout)
        this.$text = $("span").text(text)
        this.append(this.$text)
    }
}


function notify(message: string) {
    $(document.body).append(new ZNotification(message))
}

class ZTextArea extends Z<"textarea"> {
    constructor(rows: number = 20, cols: number = 40) {
        super("textarea")
        this.attr("rows", rows + "");
        this.attr("cols", cols + "");
        this.attr("spellcheck", "false");
    }
    getValue() {
        return this.element.value
    }
    setValue(value: string): this {
        this.element.value = value
        return this;
    }
    get value() {
        return this.element.value
    }
    set value(value: string) {
        this.element.value = value
    }
}

interface IJSEditor {
    getValue(): string;
    setValue(value: string): void;
}

class JSEditor extends Z<"div"> {
    editor: ZTextArea;
    constructor() {
        super("div");
        this.editor = new ZTextArea();
        this.append(this.editor);
    }
    getValue() {
        return this.editor.getValue();
    }
    setValue(value: string): this {
        this.editor.setValue(value);
        return this;
    }
}

class ZCollapseController extends Z<"div"> {
    targets: Z<HTMLElementTagName>[] = [];
    constructor(private _folded: boolean, stopsPropagation: boolean = true) {
        super("div");
        if (_folded) {
            this.addClass("collapse-folded");
        } else {
            this.addClass("collapse-unfolded");
        }
        this.onClick((e) => {
            if (stopsPropagation) e.stopPropagation();
            this.folded = !this.folded;
        });
    }
    get folded() {
        return this._folded;
    }
    set folded(value: boolean) {
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
        } else {
            this.addClass("collapse-unfolded");
            this.removeClass("collapse-folded");
            for (const $target of this.targets) {
                $target.show();
            }
        }
    }
    attach(...arr$element: Z<HTMLElementTagName>[]) {
        this.targets.push(...arr$element);
        if (this.folded) for (const $element of arr$element) {
            $element.hide();
        }
    }
}

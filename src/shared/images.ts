
const HIT_FX_SIZE = 1024;

let TAP: HTMLImageElement | ImageBitmap = new Image(135);
let DRAG: HTMLImageElement | ImageBitmap = new Image(135);
let FLICK: HTMLImageElement | ImageBitmap = new Image(135);
let HOLD_HEAD: HTMLImageElement | ImageBitmap = new Image(135);
let HOLD_BODY: HTMLImageElement | ImageBitmap = new Image(135);
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
    if (fetched) return;
    fetched = true;
    TAP.src = serverApi.resolvePath("/img/tap.png");
    DRAG.src = serverApi.resolvePath("/img/drag.png");
    FLICK.src = serverApi.resolvePath("/img/flick.png");
    HOLD_HEAD.src = serverApi.resolvePath("/img/holdHead.png");
    HOLD_BODY.src = serverApi.resolvePath("/img/holdBody.png");
    TAP.onload = () => {
        createImageBitmap(TAP).then((bmp) => {
            TAP = bmp;
        })
    }
    DRAG.onload = () => {
        createImageBitmap(DRAG).then((bmp) => {
            DRAG = bmp;
        })
    }
    FLICK.onload = () => {
        createImageBitmap(FLICK).then((bmp) => {
            FLICK = bmp;
        })
    }
    HOLD_BODY.onload = () => {
        createImageBitmap(HOLD_BODY).then((bmp) => {
            HOLD_BODY = bmp;
        })
    }
    HOLD_HEAD.onload = () => {
        createImageBitmap(HOLD_HEAD).then((bmp) => {
            HOLD_HEAD = bmp;
        })
    }


    ANCHOR.src = serverApi.resolvePath("/img/anchor.png");
    BELOW.src = serverApi.resolvePath("/img/below.png");
    DOUBLE.src = serverApi.resolvePath("/img/double.png");
    NODE_START.src = serverApi.resolvePath("/img/south.png");
    NODE_END.src = serverApi.resolvePath("/img/north.png");
    HIT_FX.src = serverApi.resolvePath("/img/hit_fx.png");
    HIT_FX.onload = () => {
        createImageBitmap(HIT_FX).then((bmp: ImageBitmap) => {
            HIT_FX = bmp;
        })
    }
    SELECT_NOTE.src = serverApi.resolvePath("/img/selectNote.png");
    TRUCK.src = serverApi.resolvePath("/img/Truck.png");
}



const drawNthFrame = (context: CanvasRenderingContext2D, source: CanvasImageSource, nth: number, dx: number, dy: number, dw: number, dh: number) => {
    const x = nth % 4;
    const y = (nth - x) / 4
    context.drawImage(source, x * 256, y * 256, 256, 256, dx, dy, dw, dh)
}

const getImageFromType = (noteType: NoteType) => {
    switch (noteType) {
        case NoteType.tap:
            return TAP;
        case NoteType.drag:
            return DRAG;
        case NoteType.flick:
            return  FLICK;
        case NoteType.hold:
            return HOLD_HEAD;
        default:
            return TAP;
    }
}

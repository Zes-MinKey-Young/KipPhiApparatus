
const BEZIER_POINT_SIZE = 20;
const HALF_BEZIER_POINT_SIZE = BEZIER_POINT_SIZE / 2;
enum BezierEditorState {
    select,
    selectingStart,
    selectingEnd
}

/** 编辑三次贝塞尔曲线 */
class BezierEditor extends Z<"div"> {
    context: CanvasRenderingContext2D;
    canvas = document.createElement("canvas");
    selectionManager = new SelectionManager<"start" | "end">();
    startPoint = new Coordinate(0, 0);
    endPoint = new Coordinate(0, 0);
    state = BezierEditorState.select;
    drawn = false;
    constructor(public size: number) {
        super("div");
        this.canvas.width = this.canvas.height = size;
        this.context = this.canvas.getContext("2d");
        this.element.appendChild(this.canvas);
        on(["mousedown", "touchstart"], this.canvas, (e) => {
            this.downHandler(e);
            this.update();
        })
        on(["mousemove", "touchmove"], this.canvas, (e) => {
            this.moveHandler(e);
            this.update();
        });
        on(["mouseup", "touchend"], this.canvas, (e) => {
            this.upHandler(e);
            this.update();
        });
    }
    update() {
        this.updateMatrix()
        this.selectionManager.refresh()
        const {context, size, startPoint, endPoint, selectionManager} = this;
        const {x: sx, y: sy} = startPoint.mul(this.matrix);
        const {x: ex, y: ey} = endPoint.mul(this.matrix);
        context.fillStyle = "#222";
        context.fillRect(0, 0, size, size);

        context.fillStyle = "#EEE";
        context.fillText(`${sx} ${sy} ${ex} ${ey} ${BezierEditorState[this.state]}`, 5, 20);

        context.strokeStyle = "#EE7";
        context.lineWidth = 5;
        drawBezierCurve(context, 0, size, size, 0, sx, sy, ex, ey);
        context.drawImage(NODE_START, sx - HALF_BEZIER_POINT_SIZE, sy - HALF_BEZIER_POINT_SIZE, BEZIER_POINT_SIZE, BEZIER_POINT_SIZE);
        context.drawImage(NODE_END, ex - HALF_BEZIER_POINT_SIZE, ey - HALF_BEZIER_POINT_SIZE, BEZIER_POINT_SIZE, BEZIER_POINT_SIZE);
        selectionManager.add({
            centerX: sx,
            centerY: sy,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 1,
            target: "start"
        });
        selectionManager.add({
            centerX: ex,
            centerY: ey,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 0,
            target: "end"
        });
    }
    matrix: Matrix;
    invertedMatrix: Matrix;
    updateMatrix() {
        const size = this.size;
        this.matrix = identity.translate(0, size).scale(size, -size);
        this.invertedMatrix = this.matrix.invert()
    }
    downHandler(event: MouseEvent | TouchEvent) {
        const [x, y] = getOffsetCoordFromEvent(event, this.canvas);
        const tar = this.selectionManager.click(x, y);
        if (!tar) { return; }
        if (tar.target === "start") {
            this.state = BezierEditorState.selectingStart;
        } else if (tar.target === "end") {
            this.state = BezierEditorState.selectingEnd;
        }
    }
    moveHandler(event: MouseEvent | TouchEvent) {
        if (this.state === BezierEditorState.select) {
            return;
        }
        const [x, y] = getOffsetCoordFromEvent(event, this.canvas);
        const coord = new Coordinate(x, y).mul(this.invertedMatrix);
        if (this.state === BezierEditorState.selectingStart) {
            this.startPoint = coord;
        }
        else if (this.state === BezierEditorState.selectingEnd) {
            this.endPoint = coord;
        }
    }
    upHandler(event: TouchEvent | MouseEvent) {
        if (this.state === BezierEditorState.selectingStart || this.state === BezierEditorState.selectingEnd) {
            this.dispatchEvent(new ZValueChangeEvent());
        }
        this.state = BezierEditorState.select;
    }
    getValue() {
        const easing = new BezierEasing();
        easing.cp1 = this.startPoint;
        easing.cp2 = this.endPoint;
        return easing;
    }
    setValue(easing: BezierEasing) {
        this.startPoint = easing.cp1;
        this.endPoint = easing.cp2;
        this.update();
    }
    
    whenValueChange(fn: () => void): void {
        this.addEventListener("valueChange", fn)
    }
}
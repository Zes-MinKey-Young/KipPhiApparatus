class Comparer {
    $topBar = $<"div">(document.getElementById("topbar") as HTMLDivElement);
    $button = new ZButton("播放");
    player1 = new Player(document.getElementById("left-player") as HTMLCanvasElement);
    player2 = new Player(document.getElementById("right-player") as HTMLCanvasElement);
    progressBar = new ZProgressBar(this.player1.audio);
    constructor() {
        this.player2.audio = this.player1.audio; // 替换原来的，构成共享关系
        this.$button.onClick(() => {
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }

        })
        
        this.progressBar.addEventListener("pause", () => this.pause());
        this.progressBar.addEventListener("change", () => {
            this.player1.render();
            this.player2.render();
        })
        this.$topBar.append(this.$button, this.progressBar);

    }
    readImage(blob: Blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image()
        img.src = url;
        this.player1.background = this.player2.background = img;
    }
    readAudio(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.player1.audio.src = this.player2.audio.src = url
    }
    loadChart(data: ChartDataKPA, data2: ChartDataKPA) {
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
        this.$button.text("暂停")
        this.player1.play();
        this.player2.play();
    }
    pause() {
        this.player1.pause();
        this.player2.pause();
        this.$button.text("继续")
    }
}

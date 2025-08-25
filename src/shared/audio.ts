/**
 * 使用AudioBuffer加快播放
 */


class AudioProcessor {
    instance?: AudioProcessor;
    audioContext: AudioContext;
    initialized: boolean;
    tap: AudioBuffer;
    drag: AudioBuffer;
    flick: AudioBuffer
    constructor() {
        if (this.instance) {
            return this.instance;
        }
        this.audioContext = "AudioContext" in window ? new AudioContext() : new globalThis.webkitAudioContext();
        this.init()
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
        })
    }
    async fetchAudioBuffer(path: string) {
        const res = await fetch(path);
        return this.audioContext.decodeAudioData(await res.arrayBuffer())
    }
    play(buffer: AudioBuffer) {
        const source = this.audioContext.createBufferSource()
        source.buffer = buffer;

        source.connect(this.audioContext.destination)
        source.start(0);
    }
    playNoteSound(type: NoteType) {
        if (!this.initialized) {
            return;
        }
        this.play([this.tap, this.tap, this.flick, this.drag][type - 1])
    }
}

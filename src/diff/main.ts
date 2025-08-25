
const serverApi = new ServerApi();
let settings: Settings;


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
    })
    serverApi.fetchVersion(left).then((l) => {
        serverApi.fetchVersion(right).then((r) => {
            comparer.loadChart(l, r)

        })
    });
})


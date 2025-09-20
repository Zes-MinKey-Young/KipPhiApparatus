


var editor: Editor, settings: Settings, serverApi: ServerApi;
if (globalThis.document) {
    KPA.hack("server", [], [], () => {
        serverApi = new ServerApi();
        return serverApi.statusPromise;
    });
    KPA.main("editor", [], async () => {
        fetchImage();
        settings = new Settings();
        editor = new Editor();
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        const segs = pathname.split("/");
        let chart, illustration, music;
        if (url.searchParams.get('chart')) {
            [chart, illustration, music] = await serverApi.getChart(url.searchParams.get('chart'))
        } else if (url.pathname.startsWith("/Resources/") && segs.length === 3) {
            [chart, illustration, music] = await serverApi.getChart(segs[2])
        } else {
            return;
        }
        editor.readAudio(music);
        editor.readImage(illustration);
        editor.readChart(chart);
    });
    KPA.main("autosave", ["editor"], () => {
        
        setInterval(() => {
            const chart = editor.chart;
            if (chart.modified) {
                chart.chartingTime++;
                serverApi.autosave(chart.dumpKPA())
                    .then(success => {
                        if (success) {
                            chart.modified = false;
                            editor.$saveButton.disabled = true;
                        } else {

                            notify("Autosave failed");
                        }
                    });
            }
        }, 60_000)
    })
}





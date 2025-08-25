


var editor: Editor, settings: Settings;
if (globalThis.document) {

    var serverApi = new ServerApi();
    serverApi.addEventListener("load", () => {
        fetchImage();
        settings = new Settings();
        editor = new Editor();
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        const segs = pathname.split("/");
        let promise: Promise<[chart: Blob, illustration: Blob, music: Blob]>;
        if (url.searchParams.get('chart')) {
            promise = serverApi.getChart(url.searchParams.get('chart'))
        } else if (url.pathname.startsWith("/Resources/") && segs.length === 3) {
            promise = serverApi.getChart(segs[2])
        }
        if (promise) {
            promise.then(([chart, illustration, music]) => {
                editor.readChart(chart);
                editor.readAudio(music);
                editor.readImage(illustration);
            });
        }
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
} else {
    const tc = new TimeCalculator;
    tc.bpmList = [
        {
            "bpm": 200.0,
            "startTime": [0, 0, 1]
        },
        {
            "bpm": 180.0,
            "startTime": [276, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [280, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [284, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [286, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [288, 0, 1]
        },
        {
            "bpm": 90.0,
            "startTime": [292, 0, 1]
        },
        {
            "bpm": 95.0,
            "startTime": [293, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [294, 0, 1]
        },
        {
            "bpm": 105.0,
            "startTime": [295, 0, 1]
        },
        {
            "bpm": 110.00000000000001,
            "startTime": [296, 0, 1]
        },
        {
            "bpm": 115.0,
            "startTime": [297, 0, 1]
        },
        {
            "bpm": 120.0,
            "startTime": [298, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [299, 0, 1]
        },
        {
            "bpm": 140.0,
            "startTime": [300, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [332, 0, 1]
        },
        {
            "bpm": 155.0,
            "startTime": [340, 0, 1]
        },
        {
            "bpm": 160.0,
            "startTime": [348, 0, 1]
        },
        {
            "bpm": 165.0,
            "startTime": [356, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [364, 0, 1]
        },
        {
            "bpm": 175.0,
            "startTime": [366, 0, 1]
        },
        {
            "bpm": 180.0,
            "startTime": [368, 0, 1]
        },
        {
            "bpm": 185.0,
            "startTime": [370, 0, 1]
        },
        {
            "bpm": 190.0,
            "startTime": [372, 0, 1]
        },
        {
            "bpm": 195.0,
            "startTime": [374, 0, 1]
        },
        {
            "bpm": 200.0,
            "startTime": [376, 0, 1]
        },
        {
            "bpm": 205.0,
            "startTime": [378, 0, 1]
        },
        {
            "bpm": 210.0,
            "startTime": [380, 0, 1]
        },
        {
            "bpm": 215.0,
            "startTime": [382, 0, 1]
        },
        {
            "bpm": 220.00000000000003,
            "startTime": [384, 0, 1]
        },
        {
            "bpm": 225.0,
            "startTime": [386, 0, 1]
        },
        {
            "bpm": 230.0,
            "startTime": [388, 0, 1]
        },
        {
            "bpm": 235.00000000000003,
            "startTime": [390, 0, 1]
        },
        {
            "bpm": 240.0,
            "startTime": [392, 0, 1]
        },
        {
            "bpm": 245.0,
            "startTime": [394, 0, 1]
        },
        {
            "bpm": 250.0,
            "startTime": [396, 0, 1]
        },
        {
            "bpm": 255.0,
            "startTime": [398, 0, 1]
        },
        {
            "bpm": 260.0,
            "startTime": [400, 0, 1]
        },
        {
            "bpm": 265.0,
            "startTime": [402, 0, 1]
        },
        {
            "bpm": 270.0,
            "startTime": [404, 0, 1]
        },
        {
            "bpm": 275.0,
            "startTime": [406, 0, 1]
        },
        {
            "bpm": 280.0,
            "startTime": [408, 0, 1]
        },
        {
            "bpm": 285.0,
            "startTime": [410, 0, 1]
        },
        {
            "bpm": 290.0,
            "startTime": [412, 0, 1]
        },
        {
            "bpm": 300.0,
            "startTime": [414, 0, 1]
        },
        {
            "bpm": 310.0,
            "startTime": [416, 0, 1]
        },
        {
            "bpm": 320.0,
            "startTime": [418, 0, 1]
        },
        {
            "bpm": 330.0,
            "startTime": [420, 0, 1]
        },
        {
            "bpm": 340.0,
            "startTime": [422, 0, 1]
        },
        {
            "bpm": 350.0,
            "startTime": [424, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [461, 0, 1]
        },
        {
            "bpm": 110.00000000000001,
            "startTime": [462, 0, 1]
        },
        {
            "bpm": 120.0,
            "startTime": [463, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [464, 0, 1]
        },
        {
            "bpm": 140.0,
            "startTime": [465, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [465, 1, 2]
        },
        {
            "bpm": 160.0,
            "startTime": [466, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [466, 1, 2]
        },
        {
            "bpm": 180.0,
            "startTime": [467, 0, 1]
        },
        {
            "bpm": 190.0,
            "startTime": [467, 1, 2]
        },
        {
            "bpm": 200.0,
            "startTime": [468, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [570, 0, 1]
        }
    ]
    tc.duration = 1145;
    console.log(tc)
    tc.update()
    console.log(tc)
    console.log(tc.toSeconds(2), tc.toSeconds(301))
    console.log(tc.secondsToBeats(100))
}





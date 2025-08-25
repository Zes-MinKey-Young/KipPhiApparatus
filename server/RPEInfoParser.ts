
interface RPEInfo {
    title: string;
    Name: string;
    composer: string;
    Composer: string;
    charter: string;
    Charter: string;
    music: string;
    Song: string;
    illustration: string;
    Picture: string;
    chart: string;
    Chart: string;

}

export function parse(text: string): RPEInfo {
    const lines = text.split("\n");
    let title, composer, charter, music, illustration, chart;
    for (const line of lines) {
        if (line.startsWith("#")) {
            continue;
        }
        const [key, value] = line.split(": ");
        switch (key) {
            case "Name":
                title = value;
                break;
            case "Composer":
                composer = value;
                break;
            case "Charter":
                charter = value;
                break;
            case "Song":
                music = value;
                break;
            case "Picture":
                illustration = value;
                break;
            case "Chart":
                chart = value;
        }
    }
    if (!title || !music || !illustration || !chart || !charter || !composer) {
        throw new Error("Invalid RPEInfo");
    }
    return {
        composer,
        charter,
        music,
        illustration,
        chart,
        title,
        Name: title,
        Composer: composer,
        Charter: charter,
        Chart: chart,
        Picture: illustration,
        Song: music
    }
}


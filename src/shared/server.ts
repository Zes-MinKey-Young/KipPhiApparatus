
const PROJECT_NAME = "kpa";

class ChartMetadata {
    
    constructor(public name: string,
    public song: string,
    public picture: string,
    public chart: string) {}
    static fromJson(json: any): ChartMetadata {
        return new ChartMetadata(json.Name, json.Song, json.Picture, json.Chart)
    }
    toJson(): string {
        return JSON.stringify({
            Name: this.name,
            Song: this.song,
            Picture: this.picture,
            Chart: this.chart
        })
    }
}


class ServerApi extends EventTarget {
    supportsServer: boolean;
    statusPromise: Promise<boolean>;
    chartId: string;
    constructor() {
        super()
        this.statusPromise = fetch("/status")
            .then(res => {
                if (res.status == 204) {
                    this.supportsServer = true;
                    document.title += "Connected"
                    this.dispatchEvent(new Event("load"));
                    return true
                } else {
                    this.supportsServer = false;
                    this.dispatchEvent(new Event("load"));
                    return false
                }
            })
        
    }
    async getChart(id: string): Promise<[chart: Blob, illustration: Blob, music: Blob]> {
        this.chartId = id;
        const res0 = await fetch(`/Resources/${id}/metadata.json`)
        if (res0.status === 404) {
            alert("Chart not found")
        }
        const metadata = ChartMetadata.fromJson(await res0.json())
        const chartPath = metadata.chart
        const picturePath = metadata.picture
        const songPath = metadata.song
        const res1 = await fetch(`/Resources/${id}/${chartPath}`)
        const res2 = await fetch(`/Resources/${id}/${picturePath}`)
        const res3 = await fetch(`/Resources/${id}/${songPath}`)
        return [await res1.blob(), await res2.blob(), await res3.blob()];
        
    }
    async uploadChart(chart: ChartDataKPA, message: string) {
        const id = this.chartId;
        const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" })
        const res = await fetch(`/commit/${id}?message=${message}`, {
            method: "POST",
            body: chartBlob,
        });
        notify((await res.json()).message)
        return res.status === 200;
    }
    async autosave(chart: ChartDataKPA) {
        const id = this.chartId;
        const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" })
        const res = await fetch(`/autosave/${id}`, {
            method: "POST",
            body: chartBlob,
        });
        if (res.status !== 200) {
            return false;
        }
        return res.status === 200;
    }
    async fetchVersion(versionId: string): Promise<ChartDataKPA> {
        const res = await fetch(`/Resources/${this.chartId}/history/${versionId}`);
        return await res.json()
    }
    resolvePath(path: string) {
        if (this.supportsServer) {
            return path;
        } else {
            return PROJECT_NAME + "/" + path;
        }
    }
    async fetchTexture(name: string): Promise<ImageBitmap> {
        const id = this.chartId;
        const response = await fetch(`/Resources/${id}/${name}`);
        if (response.status !== 200) {
            return null;
        }
        const blob = await response.blob();
        return await createImageBitmap(blob);
    }
    async queryTextures(): Promise<string[]> { 
        const id = this.chartId;
        const response = await fetch(`/Resources/${id}/textures`);
        if (response.status !== 200) {
            return [];
        } else {
            const json = await response.json();
            return json.textures;
        }
    }
    
}
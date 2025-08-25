
interface SettingEntries {
    lineColor: [number, number, number];
    playerShowInfo: boolean;
}

class Settings {
    cache: SettingEntries;
    constructor() {
        let json: string;
        if (json = localStorage.getItem("settings")) {
            this.cache = JSON.parse(json)
        } else {
            this.cache = {
                lineColor: [200, 200, 120],
                playerShowInfo: true
            }
        }
    }
    get<K extends keyof SettingEntries>(item: K): SettingEntries[K] {
        return this.cache[item]
    }
    set<K extends keyof SettingEntries>(item: K, val: SettingEntries[K]) {
        this.cache[item] = val;
        localStorage.setItem("settings", JSON.stringify(this.cache))
    }
}



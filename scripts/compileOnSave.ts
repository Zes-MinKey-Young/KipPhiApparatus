import { watch } from "fs";
import { parse } from "jsonc-parser";
import { resolve } from "path";

// 添加防抖函数
const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const confPaths = ["../src/tsconfig-editor.json", "../src/tsconfig-diff.json", "../src/tsconfig-version.json"];

for (const path of confPaths) {
    const configFile = Bun.file(path);
    const json = parse(await configFile.text());
    const watchPaths = json["include"];

    for (const file of watchPaths) {
        const handler = debounce((eventType: "change" | "rename") => {
            if (eventType === "change") {
                console.log("Compiling...");
                const proc = Bun.spawn(["tsc", "-p", path], { cwd: "../src" });
                proc.stdout.pipeTo(new WritableStream<Uint8Array>({
                    write(chunk) {
                        console.log(new TextDecoder().decode(chunk));
                    },
                }));
            }
        }, 200); // 200ms 防抖阈值

        watch(resolve("../src", file), handler);
    }
}

type ImportFn = (name: string) => any;
type ModCode = (exports: any) => void | Promise<any>; // import is a strong keyword, so we use require instead



enum ModuleStatus {
    Unloaded,
    Loading,
    Loaded,
    Failed,

}

class Module {
    usedBy: Module[] = [];
    dependencies: string[];
    depMods: Module[] = [];
    conflicts: string[];
    status: ModuleStatus = ModuleStatus.Unloaded;
    exports: any = {};
    constructor(public name: string, public code: ModCode) {
    } 
}

class KPA {
    /** 所有魔改 */
    static readonly hacks = new Map<string, Module>();
    /** 所有核心功能 */
    static readonly cores = new Map<string, Module>();
    /** 所有扩展 */
    static readonly extensions = new Map<string, Module>();
    /**
     * 定义一个魔改
     * @param name 标识符
     * @param dependencies 所依赖的魔改的标识符
     * @param conflicts 与之冲突的魔改的标识符
     * @param code 魔改所运行的函数
     */
    static hack(name: string, dependencies: string[], conflicts: string[], code: ModCode) {
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.hacks.set(name, mod);
    }
    /**
     * 定义一个扩展
     * @param name 标识符
     * @param dependencies 所依赖的扩展的标识符
     * @param conflicts 与之冲突的扩展的标识符
     * @param code 扩展所运行的函数
     */
    static ext(name: string, dependencies: string[], conflicts: string[], code: ModCode) {
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.extensions.set(name, mod);
    }
    /**
     * 定义一个核心功能
     * @param name 标识符
     * @param dependencies 所依赖的核心功能的标识符
     * @param code 核心功能所运行的函数
     */
    static main(name: string, dependencies: string[], code: ModCode) {
        const conflicts = [];
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.cores.set(name, mod);
    }
    /**
     * 执行所有模组
     * 全生命周期只调用一次
     */
    static async work() {
        for (const modLists of [KPA.hacks, KPA.extensions]) {
            for (const [name, mod] of modLists) {
                for (const dep of mod.dependencies) {
                    const depMod = modLists.get(dep);
                    if (!depMod) {
                        notify(`Module ${name} depends on ${dep}, which is not a valid module.`);
                        throw new Error(`Module ${name} depends on ${dep}, which is not a valid module.`);
                    }
                    depMod.usedBy.push(mod);
                    mod.depMods.push(depMod);
                }
                for (const conflict of mod.conflicts) {
                    if (modLists.has(conflict)) {
                        notify(`Module ${name} conflicts with ${conflict}.`);
                        throw new Error(`Module ${name} conflicts with ${conflict}.`);
                    }
                }
            }
        }
        for (const [_, mod] of KPA.hacks) {
            await KPA.tryLoad(mod);
        }
        for (const [_, mod] of KPA.cores) {
            await KPA.tryLoad(mod);
        }
        for (const [_, mod] of KPA.extensions) {
            await KPA.tryLoad(mod);
        }
    }
    /**
     * 尝试加载模组，如果依赖尚未加载，则不会加载。
     * 加载完此模组后会尝试加载以来它的模组
     * @param mod 
     * @returns 
     */
    static async tryLoad(mod: Module) {
        if (!mod.depMods.every(m => m.status === ModuleStatus.Loaded)) {
            return;
        }
        mod.status = ModuleStatus.Loading;
        const retval = mod.code(mod.exports);
        if (retval instanceof Promise) {
            await retval;
        }
        console.log(`Loaded ${mod.name}`);
        mod.usedBy.forEach(async m => await KPA.tryLoad(m));
    }
    /**
     * 引用其他模组的导出内容
     * @param name 
     * @returns 
     */
    static require(name: string): any {
        if (name.startsWith("hack.")) {
            return KPA.hacks.get(name.substring(5)).exports;
        } else if (name.startsWith("ext.")) {
            return KPA.extensions.get(name.substring(4)).exports;
        } else if (name.startsWith("core.")) {
            return KPA.cores.get(name.substring(5)).exports;
        } else {
            notify(`Invalid module name: ${name}`);
            throw new Error(`Invalid module name: ${name}`);
        }
    }
    static classBuffer: Function;
    /**
     * 强行修改一个脚本作用域中的类
     * @param con 类构造器
     * @param name 类名，默认从con.name获得
     */
    static hackClass(con: Function, name: string = con.name) {
        if (!/^[A-Za-z][a-zA-Z0-9_]*$/.test(name)) {
            throw new Error(`Invalid class name: ${name}`)
        }
        this.classBuffer = con;
        const script = document.createElement("script");
        script.textContent = `${name} = KPA.classBuffer;`
        document.body.appendChild(script);
    }
}

window.addEventListener("error", (e) => {
    notify(e.error.message);
})

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
    static readonly hacks = new Map<string, Module>();
    static readonly cores = new Map<string, Module>();
    static readonly extensions = new Map<string, Module>();
    static hack(name: string, dependencies: string[], conflicts: string[], code: ModCode) {
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.hacks.set(name, mod);
    }
    static ext(name: string, dependencies: string[], conflicts: string[], code: ModCode) {
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.extensions.set(name, mod);
    }
    static main(name: string, dependencies: string[], code: ModCode) {
        const conflicts = [];
        const mod = new Module(name, code);
        mod.dependencies = dependencies;
        mod.conflicts = conflicts;
        KPA.cores.set(name, mod);
    }
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
    static hackClass(con: Function) {
        this.classBuffer = con;
        const script = document.createElement("script");
        script.textContent = `${con.name} = KPA.classBuffer;`
        document.body.appendChild(script);
    }
}
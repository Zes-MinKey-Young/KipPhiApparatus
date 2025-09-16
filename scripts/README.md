# scripts

本文件夹的脚本，用于自动编译/和发布新版本。

脚本使用Bun运行，请确保已安装Bun。

## 发布新版本
导航到此路径，`bun bump`来发布版本。

在此之前请在此路径下配置一个`constants.ts`文件，示例：
```ts

export const isccDirectory = "D:/Inno Setup 6/";
export const outPutDir = "./Output/"
```

## 自动编译
如果您使用VSCode进行开发，您不需要操作。`compilerOnSave.ts`脚本已经配置在`.vscode`中。

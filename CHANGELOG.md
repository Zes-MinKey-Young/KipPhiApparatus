## Changelog

### [v1.6.1](https://github.com/Zes-Minkey-Young/kpa/compare/v1.6.0...v1.6.1)
#### 修复
- 由于构建脚本中的路径错误，之前的版本中无法获得最新服务器二进制文件导致出现错误，现进行修复。
- 删除了导入页面的多余表单。
- 部分图片使用ImageBitmap进行了优化，以提升性能。

### [v1.6.0](https://github.com/Zes-Minkey-Young/kpa/compare/v1.5.0...v1.6.0) - 30 July 2025
#### 新增功能
- 增加用户脚本编辑器
- 支持上传PEZ
- 支持切换判定线管理区的布局，共有三种布局：顺序、树形、分组
- 支持增加删除判定线、编辑父线和分组
- 支持了[PhiZone Player](https://github.com/PhiZone/player)引入的染色属性

#### New Features
- Added user script editor
- Supported uploading PEZ
- Supported switching the layout of the judge line management area, there are three layouts: ordered, tree, grouped.
- Supported adding, deleting, editing parent lines and groups
- Supported the tint property introduced by [PhiZone Player](https://github.com/PhiZone/player)

#### 修复
- 修复了变速Hold被判定时的渲染错误，现在变速Hold被判定时Hold头保持在判定线上。
- 修复了父子线位置计算不正确的问题
- 修复了Ctrl+C/V/Z/Y检测不到的问题（但现在仍然不需要Ctrl就可实现这几个操作，想按也没人拦你）

#### Bug Fixes
- Fixed the rendering error when Hold is judged. Now Hold head is always on the judge line when Hold is judged.
- Fixed the incorrect father-child line position calculation.


#### 重构
- 优化了对RPEJSON中判定线的读取
- 现在操作模块`operation.ts`内容与编辑器解耦程度加大（但仍然有相互依赖）

#### Refactor
- Optimized the reading of judge lines in RPEJSON
- The operation module `operation.ts` is decoupled from the editor more, but still has dependencies with each other


### [v1.5.0](https://github.com/Zes-Minkey-Young/kpa/compare/v1.4.0...v1.5.0) - 22 July 2025

#### 新增功能
- 添加参数方程和贝塞尔缓动的编辑
- 支持了音符的yOffset和visibleTime，并重新标准化了这两个属性的语义

#### New Features
- Added parameter equations and bezier easing
- Supported yOffset and visibleTime for Notes, and normalized their semantics

#### 重构
- 大幅修改网格逻辑，现在网格可以自适应调整，也可通过输入框指定范围和数值吸附线
- 重构NNLists部分以适应yOffset

#### Refactor
- Major changes to the grid logic, now the grid can adjust itself, and can be specified through input boxes to specify the range and value of the grid
- Refactored NNLists to adapt to yOffset

#### 修复
- 修复了谱面读取后原JSON数据未垃圾回收的问题
- 修复了缓动读取问题

#### Fixes
- Fixed a problem where the original JSON data was not garbage collected after reading the chart
- Fixed a problem with reading easing

#### 一般更改
- 添加了一条Tips

#### General Changes
- Added a tip


### [v1.2.0](https://github.com/Zes-Minkey-Young/kpa/compare/v1.1.0...v1.2.0) -  12 June 2025 

#### 新增功能

- 添加本地服务器 @Zes-MinKey-Young [`8bcb2c1`](https://github.com/Zes-Minkey-Young/kpa/commit/8bcb2c18872b16e5d10d184fc99b433a4aff6b5f)
- 实现服务器的谱面访问和编辑 @Zes-MinKey-Young [`3c4bf98`](https://github.com/Zes-Minkey-Young/kpa/commit/3c4bf984663e7f7809c1a5c1ba5a38127d8216e4)
- 现在可以创建谱面 @Zes-MinKey-Young [`3c4bf98`](https://github.com/Zes-Minkey-Young/kpa/commit/3c4bf984663e7f7809c1a5c1ba5a38127d8216e4)
- 添加了删除按钮和透明度输入框 @Zes-MinKey-Young [`94234ad`](https://github.com/Zes-Minkey-Young/kpa/commit/94234ad806a2bc1d4a09b9194e2610d03ea9c17e)
- 添加了透明度和大小的实现 @Zes-MinKey-Young [`8bf5a49`](https://github.com/Zes-Minkey-Young/kpa/commit/8bf5a49220c5be0adaada6f66184f8b4be76bdbe)
- 添加了破坏性按钮样式 @Zes-MinKey-Young [`f9ec6f6`](https://github.com/Zes-Minkey-Young/kpa/commit/f9ec6f60a53979cfe42660296561dcba8cdb5de4)

#### New Features

- Added local server @Zes-MinKey-Young [`8bcb2c1`](https://github.com/Zes-Minkey-Young/kpa/commit/8bcb2c18872b16e5d10d184fc99b433a4aff6b5f)
- Implement chart access and editing @Zes-MinKey-Young [`3c4bf98`](https://github.com/Zes-Minkey-Young/kpa/commit/3c4bf984663e7f7809c1a5c1ba5a38127d8216e4)
- Now you can create chart @Zes-MinKey-Young [`bc35862`](https://github.com/Zes-Minkey-Young/kpa/commit/bc358629bc2e45fe0142405ae63b680dc42d1f55)
- Added delete button and alpha input @Zes-MinKey-Young [`94234ad`](https://github.com/Zes-Minkey-Young/kpa/commit/94234ad806a2bc1d4a09b9194e2610d03ea9c17e)
- Added alpha and size implementation @Zes-MinKey-Young [`8bf5a49`](https://github.com/Zes-Minkey-Young/kpa/commit/8bf5a49220c5be0adaada6f66184f8b4be76bdbe)
- added destructive button style @Zes-MinKey-Young [`f9ec6f6`](https://github.com/Zes-Minkey-Young/kpa/commit/f9ec6f60a53979cfe42660296561dcba8cdb5de4)

#### 修复

- 修正选择音符或节点时的偏移量 @Zes-MinKey-Young [`1a5c535`](https://github.com/Zes-Minkey-Young/kpa/commit/1a5c5350d9618be4e1f93a42187da9ab840e3a60)
- 创建新的nnLists时连接头部和尾部 @Zes-MinKey-Young [`a4dab7c`](https://github.com/Zes-Minkey-Young/kpa/commit/a4dab7cbbdec0a5ede8845e5e04ca53a472be6b9)
- 包含了固定缓动 @Zes-MinKey-Young [`732b6fb`](https://github.com/Zes-Minkey-Young/kpa/commit/732b6fba9139421151503430ade52d6aaccfacac)
- 当BPM序列只有一个节点长不生成跳跃数组 @Zes-MinKey-Young [`70388a0`](https://github.com/Zes-Minkey-Young/kpa/commit/70388a0cb7c78120e6702a3c8faec7f1fc3a3814)
- 忘记初始化数组属性--judgelines @Zes-MinKey-Young [`6c33156`](https://github.com/Zes-Minkey-Young/kpa/commit/6c331569b4fc1239b4f83db20292e51d46edf6f3)
- 数字显示问题 @Zes-MinKey-Young [`3c45de4`](https://github.com/Zes-Minkey-Young/kpa/commit/3c45de4a9eca04b7031f85418e3f4bd01ab75e52)
- 使用?.以避免只有一个段时出错 @Zes-MinKey-Young [`8f892b4`](https://github.com/Zes-Minkey-Young/kpa/commit/8f892b4e0bacfd5830c8a7415876697c2929c5df)
- 修正编辑缓动时的逻辑 @Zes-MinKey-Young [`1654f2a`](https://github.com/Zes-Minkey-Young/kpa/commit/1654f2a499a442e95c980d0505a19e60c3c0dfcc)
- 避免NaN @Zes-MinKey-Young [`de7feea`](https://github.com/Zes-Minkey-Young/kpa/commit/de7feea382cd99197a85d1790ca92b59d3980ee1)
- 初始化judgeLineGroup @Zes-MinKey-Young [`aad35aa`](https://github.com/Zes-Minkey-Young/kpa/commit/aad35aa84c689799769f2ecd4372f9633ff37fe5)
- 使用相对路径以避免Github Pages异常 @Zes-MinKey-Young [`aa50275`](https://github.com/Zes-Minkey-Young/kpa/commit/aa50275b3201ac42470158eebfaea1db749a6653)
- 如果有服务器应停止保存文本到文件 @Zes-MinKey-Young [`486d6ad`](https://github.com/Zes-Minkey-Young/kpa/commit/486d6ad5c0c58b874803e9f40db85d71350ee67c)

#### Fixes

- Fixed the offset when selecting Notes/Nodes @Zes-MinKey-Young [`1a5c535`](https://github.com/Zes-Minkey-Young/kpa/commit/1a5c5350d9618be4e1f93a42187da9ab840e3a60) 
- Connect head and a tail when creating new nnLists @Zes-MinKey-Young [`a4dab7c`](https://github.com/Zes-Minkey-Young/kpa/commit/a4dab7cbbdec0a5ede8845e5e04ca53a472be6b9) 
- included fixedEasing @Zes-MinKey-Young [`732b6fb`](https://github.com/Zes-Minkey-Young/kpa/commit/732b6fba9139421151503430ade52d6aaccfacac) 
- Do not generate JumpArray when the BPMSequence is 1 node long @Zes-MinKey-Young [`70388a0`](https://github.com/Zes-Minkey-Young/kpa/commit/70388a0cb7c78120e6702a3c8faec7f1fc3a3814) 
- forgot to initialize the array property --judgelines @Zes-MinKey-Young [`6c33156`](https://github.com/Zes-Minkey-Young/kpa/commit/6c331569b4fc1239b4f83db20292e51d46edf6f3) 
- Bad display of number on lines @Zes-MinKey-Young [`3c45de4`](https://github.com/Zes-Minkey-Young/kpa/commit/3c45de4a9eca04b7031f85418e3f4bd01ab75e52) 
- use ?. to avoid error when there is only one segment @Zes-MinKey-Young [`8f892b4`](https://github.com/Zes-Minkey-Young/kpa/commit/8f892b4e0bacfd5830c8a7415876697c2929c5df) 
- Bad logic when editing easing @Zes-MinKey-Young [`1654f2a`](https://github.com/Zes-Minkey-Young/kpa/commit/1654f2a499a442e95c980d0505a19e60c3c0dfcc) 
- this caused NaN @Zes-MinKey-Young [`de7feea`](https://github.com/Zes-Minkey-Young/kpa/commit/de7feea382cd99197a85d1790ca92b59d3980ee1) 
- initialize judgeLineGroup @Zes-MinKey-Young [`aad35aa`](https://github.com/Zes-Minkey-Young/kpa/commit/aad35aa84c689799769f2ecd4372f9633ff37fe5) 
- use relative path to avoid exception on Github Pages @Zes-MinKey-Young [`aa50275`](https://github.com/Zes-Minkey-Young/kpa/commit/aa50275b3201ac42470158eebfaea1db749a6653) 
- should stop save text to file if there is a server @Zes-MinKey-Young [`486d6ad`](https://github.com/Zes-Minkey-Young/kpa/commit/486d6ad5c0c58b874803e9f40db85d71350ee67c) 

#### 杂项和清理

- 将声明放入单个文件以便重用 @Zes-MinKey-Young [`d9be4ae`](https://github.com/Zes-Minkey-Young/kpa/commit/d9be4ae0be03adfb46cbf597495392e5e6dcb18c)
- 移除`.code-workspace` @Zes-MinKey-Young [`e06ff08`](https://github.com/Zes-Minkey-Young/kpa/commit/e06ff089025d59a328272fb9d3e9952c3000db51)
- 使用MIT许可证 @Zes-MinKey-Young [`109865b`](https://github.com/Zes-Minkey-Young/kpa/commit/109865b8db9c0f0bce935fc6eb7e96bbc7aee123)
- 添加获取面对面节点的方法 @Zes-MinKey-Young [`37bb6b0`](https://github.com/Zes-Minkey-Young/kpa/commit/37bb6b00791177e8bb24808634680835d81ea3ee)
- 我们不上传可能违反许可证的图片 @Zes-MinKey-Young [`8de4cca`](https://github.com/Zes-Minkey-Young/kpa/commit/8de4cca93c8b489c8087629f576f6d90afee7817)
- 忽略可执行文件 @Zes-MinKey-Young [`4465310`](https://github.com/Zes-Minkey-Young/kpa/commit/4465310aab17999db32b6b34b14d679d19810164)
- 忽略资源目录 @Zes-MinKey-Young [`33a4f22`](https://github.com/Zes-Minkey-Young/kpa/commit/33a4f227c1d5869b52b79823719af19e89805aff)

#### Chores And Housekeeping

- put the declarations into a single file so as to reuse @Zes-MinKey-Young [`d9be4ae`](https://github.com/Zes-Minkey-Young/kpa/commit/d9be4ae0be03adfb46cbf597495392e5e6dcb18c)
- remove .code-workspace @Zes-MinKey-Young [`e06ff08`](https://github.com/Zes-Minkey-Young/kpa/commit/e06ff089025d59a328272fb9d3e9952c3000db51)
- use MIT License @Zes-MinKey-Young [`109865b`](https://github.com/Zes-Minkey-Young/kpa/commit/109865b8db9c0f0bce935fc6eb7e96bbc7aee123)
- add a method to get face-toface nodes @Zes-MinKey-Young [`37bb6b0`](https://github.com/Zes-Minkey-Young/kpa/commit/37bb6b00791177e8bb24808634680835d81ea3ee)
- added exe @Zes-MinKey-Young [`4465310`](https://github.com/Zes-Minkey-Young/kpa/commit/4465310aab17999db32b6b34b14d679d19810164)
- we do not upload pictures that may violates licences @Zes-MinKey-Young [`8de4cca`](https://github.com/Zes-Minkey-Young/kpa/commit/8de4cca93c8b489c8087629f576f6d90afee7817)
- add "Resources" @Zes-MinKey-Young [`33a4f22`](https://github.com/Zes-Minkey-Young/kpa/commit/33a4f227c1d5869b52b79823719af19e89805aff)
- ignore wikitext @Zes-MinKey-Young [`20519f8`](https://github.com/Zes-Minkey-Young/kpa/commit/20519f89695f8c50520da5cb1dd0d02068c2b7b8)

#### 重构和更新

- 将dumpRPE方法移到单独的类中 @Zes-MinKey-Young [`4f65dee`](https://github.com/Zes-Minkey-Young/kpa/commit/4f65deea9a7adc00447f490eea5b0e34fd2d4bce)
- 使用eventTarget @Zes-MinKey-Young [`def23db`](https://github.com/Zes-Minkey-Young/kpa/commit/def23db0fb698461fb77d849a9dea1b38ff1a857)

#### Refactoring and Updates

- move dumpRPE methods into an individual class; @Zes-MinKey-Young [`4f65dee`](https://github.com/Zes-Minkey-Young/kpa/commit/4f65deea9a7adc00447f490eea5b0e34fd2d4bce)
- use eventTarget @Zes-MinKey-Young [`def23db`](https://github.com/Zes-Minkey-Young/kpa/commit/def23db0fb698461fb77d849a9dea1b38ff1a857)

#### 一般更改

- 删除意外创建的文件 @Zes-MinKey-Young [`b0af867`](https://github.com/Zes-Minkey-Young/kpa/commit/b0af867fcfbcd29ca06fbcb688b567b8f9199ebf)
- 替换readAsDataURL为createObjectURL @Zes-MinKey-Young [`0415db6`](https://github.com/Zes-Minkey-Young/kpa/commit/0415db61a7dd835a483972fd59c1d8bd2bd72d98)
- 想降低浮点误差，但实际上无效 @Zes-MinKey-Young [`8eec8ba`](https://github.com/Zes-Minkey-Young/kpa/commit/8eec8ba08277816ba5a3ee1f7a866fd2497293f7)


#### General Changes

- delete:files created unexpectedly @Zes-MinKey-Young [`b0af867`](https://github.com/Zes-Minkey-Young/kpa/commit/b0af867fcfbcd29ca06fbcb688b567b8f9199ebf)
- 1.2.0b @Zes-MinKey-Young [`cdb19ab`](https://github.com/Zes-Minkey-Young/kpa/commit/cdb19ab310a916d7d95fbe50ae10f82d07855f4e)
- replace readAsDataURL with createObjectURL @Zes-MinKey-Young [`0415db6`](https://github.com/Zes-Minkey-Young/kpa/commit/0415db61a7dd835a483972fd59c1d8bd2bd72d98)
- recover the old version @Zes-MinKey-Young [`80a7364`](https://github.com/Zes-Minkey-Young/kpa/commit/80a736443a073c53389485d3002dd5a04af4eca4)
- I want to lower the floating-point error, but actually it does not work @Zes-MinKey-Young [`8eec8ba`](https://github.com/Zes-Minkey-Young/kpa/commit/8eec8ba08277816ba5a3ee1f7a866fd2497293f7)
- chore @Zes-MinKey-Young [`2c214e6`](https://github.com/Zes-Minkey-Young/kpa/commit/2c214e69df15125a426321ebbc0fa5ac0cc133f0)

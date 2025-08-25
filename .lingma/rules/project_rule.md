**Add rules to help the model understand your coding preferences, including preferred frameworks, coding styles, and other conventions.**
**Note: This file only applies to the current project, with each file limited to 10,000 characters. If you do not need to commit this file to a remote Git repository, please add it to .gitignore.**

此项目是新概念Phigros谱面编辑器奇谱发生器（Kipphi Apparatus），简称KPA。由于依赖关系复杂，采用多文件编译到一个js文件。
自制谱界常用的编辑器是rpe，而kpa引入了很多新的概念。Rpe的格式是rpe json，类型标注位于chart.ts。
Kpa中谱面可编译至rpe json。
介绍一些重要结构：
TimeT：时间元组，为一个以三元组表示的带分数。
JumpArray：用于实现链表的随机快速访问。
TimeCalculator：有有时间元组处理的相关静态方法，和bpm节点的管理。
EventNode：事件节点用于代表事件的开始和结束。（EventStartNode表开始，EventEndNode表结束）
事件指的是判定线在某个时间段上的状态变化。
五种事件类型：移动X，移动Y，旋转，透明度，速度。
事件节点没有类型，类型由它所属的序列决定。
与RPE不同的是，KPA使用两个节点来表示一个事件，而不是一个对象。
Note：
 * Basic element in music game.
 * Has 4 types: tap, drag, flick and hold.
 * Only hold has endTime; others' endTime is equal to startTime.
 * For this reason, holds are store in a special list (HNList),
 * which is sorted by both startTime and endTime,
 * so that they are accessed correctly and rapidly in the renderer.
 * Note that Hold and HoldNode are not individually-declared classes.
 * Hold is a note with type being NoteType.hold,
 * while HoldNode is a node that contains holds.
NoteNode：
NNNode：实现combo和多押提示，但目前暂未实现combo
EventNodeSequence：
Bpm node sequence：Bpm列表管理与事件节点序列有相似规律和编辑方式。为了方便，把它继承事件节点序列。
Operation：实现所有用户操作。为便于撤销和重做，将其封装为了一个类。


----
KDP是KPA Development Proposal的缩写（类似PEP），KDP是KPA的提案。


**重要提示：智能问答下排查BUG时未经同意不要给出代码，方便我驳回模型的错误假设**

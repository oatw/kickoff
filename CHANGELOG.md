# 0.2.4 (Mar 4, 2021)

## Fixed

- 修复es6语法错误

# 0.2.3 (Mar 1, 2021)

## Fixed

- 修复task数组排序错误导致的组件初始化失败问题

# 0.2.2 (Feb 4, 2021)

## Fixed

- 修复因.npmignore文件配置错误导致的npm pack打包错误问题
- 修复gantt视图时间轴cell在子cell宽度不足时布局错乱的问题
- 优化gantt视图切换时间单位时的渲染性能

# 0.2.1 (Jan 28, 2021)

## Fixed

修复后置任务多个周期联动计算错误。

# 0.2.0 (Dec 31, 2020)

## Changed

- 自定义表单渲染函数 `taskFormRenderer` -> `renderTaskForm`
- table视图列配置 `columns` -> `tableColumns`
- table视图列配置 `template` -> `render`
- 诸多细节优化

## Removed

- table视图列配置 `readonly`
- 表单自定义渲染函数 `renderForm`

## Added

- #23 各视图任务只读属性及可执行Action配置
- #10 特殊日期配置，包括节假日计算为工期和工作日不计算为工期
- #15 操作历史管理，如撤销、重做
- #14 内置任务属性编辑器，支持自定义配置及自定义渲染
- #12 本地化语言配置
- #5， #9 gantt视图关键日期标记
- #6 gantt视图自定义任务图形及里程碑图形渲染，包括内置的默认里程碑图形
- 头部Actions自定义渲染函数、头部Navigations自定义渲染函数
- gantt视图Actions自定义渲染函数、LinkActions自定义渲染函数、Summary自定义渲染函数
- table视图Actions自定义渲染函数
- 折叠任务Action
- 错误信息管理
- 事件： `before-create`、`before-update`、`before-destroy`、
  `after-update-state-stack`、 `after-push-state-stack`、 `after-pop-state-stack`
  `after-push-undo-state-stack`、 `after-push-redo-state-stack`、
  `after-pop-undo-state-stack`、 `after-pop-redo-state-stack`、
  `after-switch-state`、`after-undo`、 `after-redo`、`after-activate-form`、
  `after-deactivate-form`、`after-toggle-in-gantt`、 `after-toggle-in-table`
- 其它诸多任务模型API

## Fixed

- #4, #1
- 其它bug

# 0.1.0 (Oct 30, 2020)

- Initial release.

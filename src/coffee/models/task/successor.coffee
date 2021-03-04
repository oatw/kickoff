import {
  Task
  mustExist
  isRoot
  root
  splitDeps
  joinDeps
  depcTypes
} from './task.coffee'
import {
  depWbses
  addDeps
  removeDeps
  depcType
  isValidDepc
  typeMustBeValid
  parseDeps
  beforeUpdateDeps
  touchDeps
} from './predecessor.coffee'
import {
  triggerEvent
} from './event.coffee'



depd = (task, type = '', ruleFn, deep = false) ->
  mustExist task
  return [] if isRoot task
  collected = root(task).tasks.filter (t) ->
    matched = depWbses(t, type).includes task.data.wbs
    if ruleFn then matched and ruleFn t else matched
  return collected unless deep
  index = 0
  while index < collected.length
    collected = collected.concat depd(collected[index], type, ruleFn)
    index += 1
  luda.unique collected

f2sDepd = (task, ruleFn, deep) -> depd task, 'finishToStart', ruleFn, deep

s2sDepd = (task, ruleFn, deep) -> depd task, 'startToStart', ruleFn, deep

f2fDepd = (task, ruleFn, deep) -> depd task, 'finishToFinish', ruleFn, deep

s2fDepd = (task, ruleFn, deep) -> depd task, 'startToFinish', ruleFn, deep

isValidDepd = (depd, task) -> isValidDepc task, depd

addDepd = (task, type, depds = [], _original = {}) ->
  # original = Object.assign(
  #   {target: task, prop: "successors.#{type}"}, _original
  # )
  # parseDeps(task, depds...).forEach (d) -> addDeps d, type, [task], original
  original = Object.assign {target: task, prop: "successors.#{type}"}, _original
  depc = task
  mustExist depc
  return if isRoot depc
  resources = []
  tasks = parseDeps depc, depds...
  isPrevented = tasks.some (task) ->
    return unless isValidDepc depc, task
    oldVals = depWbses task, type
    newVals = oldVals.concat depc.data.wbs
    {triggered, schedules} = beforeUpdateDeps(
      task, type, newVals, true, original
    )
    resources.push {task, type, newVals, schedules}
    not triggered
  if isPrevented
    resources = []
    tasks.forEach (task) ->
      return unless isValidDepc depc, task
      resources.push {task, type, newVals: depWbses(task, type), schedules: []}
  resources.forEach (r) ->
    {task, type, newVals, schedules} = r
    touchDeps task, type, newVals, schedules, original

addF2SDepd = (task, depd...) -> addDepd task, 'finishToStart', depd

addS2SDepd = (task, depd...) -> addDepd task, 'startToStart', depd

addF2FDepd = (task, depd...) -> addDepd task, 'finishToFinish', depd

addS2FDepd = (task, depd...) -> addDepd task, 'startToFinish', depd

removeDepd = (task, depds = [], _original = {}) ->
  # if depds.length
  #   depds = parseDeps task, depds...
  # else
  #   depds = depd task
  # depds.forEach (d) ->
  #   original = Object.assign(
  #     {target: task, prop: "successors.#{depdType task, d}"}, _original
  #   )
  #   removeDeps d, [task], original
  depc = task
  mustExist depc
  return if isRoot depc
  if depds.length
    tasks = parseDeps depc, depds...
  else
    tasks = depd depc
  resources = []
  isPrevented = tasks.some (task) ->
    return unless type = depdType(depc, task).type
    newVals = depWbses task, type
    newVals.splice index, 1 if (index = newVals.indexOf depc.data.wbs) >= 0
    original = Object.assign(
      {target: depc, prop: "successors.#{type}"}, _original
    )
    {triggered, schedules} = beforeUpdateDeps(
      task, type, newVals, true, original
    )
    resources.push {task, type, newVals, schedules, original}
    not triggered
  if isPrevented
    resources = []
    tasks.forEach (task) ->
      return unless type = depdType(depc, task).type
      newVals = depWbses task, type
      original = Object.assign(
        {target: depc, prop: "successors.#{type}"}, _original
      )
      resources.push {task, type, newVals, schedules: [], original}
  resources.forEach (r) ->
    {task, type, newVals, schedules, original} = r
    touchDeps task, type, newVals, schedules, original

depdType = (task, depd) -> depcType depd, task

Task.prototype.successors = Task.prototype.depd = (type, ruleFn, deep) ->
  depd this, type, ruleFn, deep

Task.prototype.f2sSuccessors = Task.prototype.f2sDepd = (ruleFn, deep) ->
  f2sDepd this, ruleFn, deep

Task.prototype.s2sSuccessors = Task.prototype.s2sDepd = (ruleFn, deep) ->
  s2sDepd this, ruleFn, deep

Task.prototype.f2fSuccessors = Task.prototype.f2fDepd = (ruleFn, deep) ->
  f2fDepd this, ruleFn, deep

Task.prototype.s2fSuccessors = Task.prototype.s2fDepd = (ruleFn, deep) ->
  s2fDepd this, ruleFn, deep

Task.prototype.isValidSuccessorOf = Task.prototype.isValidDepdOf = (depc) ->
  isValidDepd this, depc

Task.prototype.addSuccessors = Task.prototype.addDepd = (type, depd...) ->
  @_pushUndoState => addDepd this, type, depd
  this

Task.prototype.addF2SSuccessors = Task.prototype.addF2SDepd = (depd...) ->
  @_pushUndoState => addF2SDepd this, depd...
  this

Task.prototype.addS2SSuccessors = Task.prototype.addS2SDepd = (depd...) ->
  @_pushUndoState => addS2SDepd this, depd...
  this

Task.prototype.addF2FSuccessors = Task.prototype.addF2FDepd = (depd...) ->
  @_pushUndoState => addF2FDepd this, depd...
  this

Task.prototype.addS2FSuccessors = Task.prototype.addS2FDepd = (depd...) ->
  @_pushUndoState => addS2FDepd this, depd...
  this

Task.prototype.removeSuccessors = Task.prototype.removeDepd = (depd...) ->
  @_pushUndoState => removeDepd this, depd
  this

Task.prototype.successorType = Task.prototype.depdType = (depd) ->
  depdType this, depd



export {
  depd
  f2sDepd
  s2sDepd
  f2fDepd
  s2fDepd
  isValidDepd
  addDepd
  removeDepd
  depdType
}

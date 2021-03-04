import {
  Task
  root
  isRoot
  splitDeps
  joinDeps
  find
  mustExist
  depcTypes as types
  depcTypeShortcuts as typeShortcuts
} from './task.coffee'
import {
  ancestors
  descendants
} from './query.coffee'
import {triggerEvent} from './event.coffee'



typeMustBeValid = (type) ->
  type = types[typeShortcuts.indexOf type] unless types.includes type
  throw new Error "Invalid type: #{type}" unless types.includes type
  type

depWbses = (task, type = '') ->
  depsObj = task.data.dependencies
  unless type
    wbses = []
    types.forEach (t) ->
      wbses = wbses.concat splitDeps(depsObj[t])
    return wbses
    # return types.map((t) -> splitDeps depsObj[t]).flat() unless type
  type = typeMustBeValid type
  splitDeps depsObj[type]

parseDeps = (task, deps...) ->
  depTasks = []
  deps.forEach (d) ->
    d = find root(task), d unless d instanceof Task
    depTasks.push d if d and d.rootId is task.rootId
  depTasks

compareNewAndOld = (task, type = '', newVals = []) ->
  type = typeMustBeValid type
  oldVals = depWbses task, type
  oldVal = joinDeps oldVals
  newVals = splitDeps newVals if typeof newVals is 'string'
  newVal = joinDeps newVals
  {newVal, oldVal, oldVals, newVals, isEqual: newVal is oldVal}

collectDepdWbsData = (task, filter) ->
  mustExist task
  val = {}
  for type in types
    val[type] = joinDeps task.depd(type, filter).map((t) -> t.data.wbs)
  val

triggerDepsEvent = (task, event, type, detail, _original) ->
  type = typeMustBeValid type
  # trigger dependencies event of current task
  typeDetail = {}
  typeDetail[type] = detail
  isPrevented = triggerEvent(task, event, typeDetail, _original) is false
  return false if isPrevented and event is 'before-update'
  # trigger predecessor event of current task
  depsDetail = {predecessors: {}}
  [newVal, oldVal] = [{}, {}]
  for key, val of task.data.dependencies
    if key is type
      newVal[key] = detail.newVal
      oldVal[key] = detail.oldVal
    else
      newVal[key] = oldVal[key] = val
  depsDetail.predecessors.newVal = newVal
  depsDetail.predecessors.oldVal = oldVal
  isDepsEventPrevented = triggerEvent(
    task, event, depsDetail, _original
  ) is false
  isPrevented ||= isDepsEventPrevented
  return false if isPrevented and event is 'before-update'
  # trigger successors events of current task's predecessors
  depdDetail = {successors: {}}
  oldDeps = splitDeps(oldVal[type]).map (wbs) -> find root(task), wbs
  newDeps = splitDeps(newVal[type]).map (wbs) -> find root(task), wbs
  isDepdEventPrevented = luda.unique(oldDeps.concat newDeps).some (t) ->
    return unless t
    existInOld = oldDeps.includes t
    existInNew = newDeps.includes t
    existInNew = false unless task.created
    return if existInNew and existInOld
    if event is 'before-update'
      oldVal = collectDepdWbsData t
      newVal = JSON.parse JSON.stringify(oldVal)
      depdWbsArr = splitDeps oldVal[type]
      if existInNew
        depdWbsArr.push task.data.wbs
      else
        depdWbsArr.splice depdWbsArr.indexOf(task.data.wbs), 1
      newVal[type] = joinDeps depdWbsArr
    else
      newVal = collectDepdWbsData t
      oldVal = JSON.parse JSON.stringify(newVal)
      depdWbsArr = splitDeps newVal[type]
      if existInNew
        depdWbsArr.splice depdWbsArr.indexOf(task.data.wbs), 1
      else
        depdWbsArr.push task.data.wbs
      oldVal[type] = joinDeps depdWbsArr
      t.depended = newVal # hack
    depdDetail.successors.newVal = newVal
    depdDetail.successors.oldVal = oldVal
    triggerEvent(t, event, depdDetail, _original) is false
  isPrevented ||= isDepdEventPrevented
  return false if isPrevented and event is 'before-update'
  not isPrevented

beforeUpdateDeps = (task, type, newVals = [], _returnSchedul, _original = {}) ->
  original = Object.assign(
    {target: task, prop: "predecessors.#{type}"}, _original
  )
  [triggered, schedules] = [true, []]
  result = ->
    if _returnSchedul then {triggered, schedules} else triggered
  {newVal, oldVal, oldVals, isEqual} = compareNewAndOld task, type, newVals
  return result() if isEqual
  triggered = triggerDepsEvent(
    task, 'before-update', type, {newVal, oldVal}, original
  )
  return result() unless triggered
  return result() unless newVals.some (v) -> not oldVals.includes v
  task.data.dependencies[type] = newVal
  [newB, newE] = [task.data.beginning, task.data.end]
  {triggered, resources} = task._beforeUpdateSchedule(
    {beginning: newB, end: newE}, 'flex', _returnSchedul, original
  )
  schedules = resources
  task.data.dependencies[type] = oldVal
  result()

touchDeps = (task, type, newVals = [], _schedules = [], _original = {}) ->
  original = Object.assign(
    {target: task, prop: "predecessors.#{type}"}, _original
  )
  {newVal, oldVal, isEqual} = compareNewAndOld task, type, newVals
  unless isEqual
    task.data.dependencies[type] = newVal
    [newBegin, newEnd] = [task.data.beginning, task.data.end]
    task._touchSchedule(
      {beginning: newBegin, end: newEnd}, 'flex', _schedules, original
    )
  triggerDepsEvent task, 'after-touch', type, {newVal, oldVal}, original
  return if isEqual
  triggerDepsEvent task, 'after-update', type, {newVal, oldVal}, original

tryUpdateDeps = (task, type, newVals = [], _original) ->
  {triggered, schedules} = beforeUpdateDeps(
    task, type, newVals, true, _original
  )
  newVals = depWbses(task, type) unless triggered
  touchDeps task, type, newVals, schedules, _original
  triggered

deps = (task, type = '', ruleFn, deep = false) ->
  mustExist task
  return [] if isRoot task
  wbses = depWbses task, type
  collected = root(task).tasks.filter (t) ->
    matched = wbses.includes t.data.wbs
    if ruleFn then matched and ruleFn t else matched
  return collected unless deep
  index = 0
  while index < collected.length
    collected = collected.concat deps(collected[index], type, ruleFn)
    index += 1
  luda.unique collected

f2sDeps = (task, ruleFn, deep) -> deps task, 'finishToStart', ruleFn, deep

s2sDeps = (task, ruleFn, deep) -> deps task, 'startToStart', ruleFn, deep

f2fDeps = (task, ruleFn, deep) -> deps task, 'finishToFinish', ruleFn, deep

s2fDeps = (task, ruleFn, deep) -> deps task, 'startToFinish', ruleFn, deep

isValidDepc = (depc, task) ->
  depc = parseDeps(task, depc)[0]
  return false unless depc
  return false if task is depc
  return false if ancestors(task).includes depc
  return false if descendants(task).includes depc
  return true unless task.created
  return false if deps(task).includes depc
  return false if task.depd(null, null, true).includes depc
  # return false if depd(task, null, null, true).includes depc
  true

addDeps = (task, type, depTasks = [], _original) ->
  mustExist task
  return if isRoot task
  addedWbs = []
  parseDeps(task, depTasks...).forEach (depc) ->
    addedWbs.push depc.data.wbs if isValidDepc depc, task
  return unless addedWbs.length
  tryUpdateDeps task, type, depWbses(task, type).concat(addedWbs), _original

addF2SDeps = (task, deps...) -> addDeps task, 'finishToStart', deps

addS2SDeps = (task, deps...) -> addDeps task, 'startToStart', deps

addF2FDeps = (task, deps...) -> addDeps task, 'finishToFinish', deps

addS2FDeps = (task, deps...) -> addDeps task, 'startToFinish', deps

removeDeps = (task, deps = [], _original) ->
  mustExist task
  return if isRoot task
  unless deps.length
    for key, val of task.data.dependencies
      tryUpdateDeps task, key, [], _original
    return
  depTasks = parseDeps task, deps...
  types.forEach (t) ->
    arr = depWbses task, t
    depTasks.forEach (d) ->
      arr.splice index, 1 if (index = arr.indexOf d.data.wbs) >= 0
    tryUpdateDeps task, t, arr, _original

depcType = (task, depc) ->
  mustExist task
  return unless depc
  depc = parseDeps(task, depc)[0]
  type = ''
  types.some (t) ->
    wbses = depWbses task, t
    return false unless wbses.includes depc.data.wbs
    type = t
  shortcut = typeShortcuts[types.indexOf type] or ''
  return {type, shortcut}

Task.prototype.predecessors = Task.prototype.deps = (type, ruleFn, deep) ->
  deps this, type, ruleFn, deep

Task.prototype.f2sPredecessors = Task.prototype.f2sDeps = (ruleFn, deep) ->
  f2sDeps this, ruleFn, deep

Task.prototype.s2sPredecessors = Task.prototype.s2sDeps = (ruleFn, deep) ->
  s2sDeps this, ruleFn, deep

Task.prototype.f2fPredecessors = Task.prototype.f2fDeps = (ruleFn, deep) ->
  f2fDeps this, ruleFn, deep

Task.prototype.s2fPredecessors = Task.prototype.s2fDeps = (ruleFn, deep) ->
  s2fDeps this, ruleFn, deep

Task.prototype.isValidPredecessorOf = Task.prototype.isValidDepcOf = (depd) ->
  return false unless depd = parseDeps(this, depd)[0]
  isValidDepc this, depd

Task.prototype._addDeps = (type, deps...) ->
  addDeps this, type, deps
  this

Task.prototype.addPredecessors = Task.prototype.addDeps = (type, deps...) ->
  @_pushUndoState => addDeps this, type, deps
  this

Task.prototype.addF2SPredecessors = Task.prototype.addF2SDeps = (deps...) ->
  @_pushUndoState => addF2SDeps this, deps...
  this

Task.prototype.addS2SPredecessors = Task.prototype.addS2SDeps = (deps...) ->
  @_pushUndoState => addS2SDeps this, deps...
  this

Task.prototype.addF2FPredecessors = Task.prototype.addF2FDeps = (deps...) ->
  @_pushUndoState => addF2FDeps this, deps...
  this

Task.prototype.addS2FPredecessors = Task.prototype.addS2FDeps = (deps...) ->
  @_pushUndoState => addS2FDeps this, deps...
  this

Task.prototype.removePredecessors = Task.prototype.removeDeps = (deps...) ->
  @_pushUndoState => removeDeps this, deps
  this

Task.prototype.predecessorType = Task.prototype.depcType = (depc) ->
  depcType this, depc



export {
  depWbses
  deps
  f2sDeps
  s2sDeps
  f2fDeps
  s2fDeps
  isValidDepc
  addDeps
  removeDeps
  beforeUpdateDeps
  touchDeps
  tryUpdateDeps
  depcType
  types
  typeMustBeValid
  parseDeps
}

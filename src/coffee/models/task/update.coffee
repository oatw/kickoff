import {
  Task
  mustBeRoot
  mustExist
  root
  isRoot
  find
  enhancedProps
  builtInProps
  depcTypes
  splitDeps
  joinDeps
} from './task.coffee'
import {beginning} from './beginning.coffee'
import {end} from './end.coffee'
import {duration} from './duration.coffee'
import {
  addDeps
  removeDeps
} from './predecessor.coffee'
import{
  addDepd
  removeDepd
  depd
} from './successor.coffee'
import {pick} from './pick.coffee'
import {fold} from './fold.coffee'
import {actions} from './can.coffee'
import {readonlyProps} from './readonly.coffee'
import {triggerEvent} from './event.coffee'



updateRoot = (rootTask, data = {}) ->
  mustBeRoot rootTask
  # for p in ['uid', 'rootId', 'wbs', 'tasks', 'events', 'created']
  #   delete data[p]
  throw new Error "Not implemmented"

updateTaskEnhancedProps = (task, data = {}) ->
  if 'predecessors' of data or 'dependencies' of data
    for type, deps of (data.predecessors or data.dependencies)
      deps = joinDeps deps if luda.isArray deps
      newDeps = splitDeps deps
      currentDeps = splitDeps task.data.dependencies[type]
      added = newDeps.filter (wbs) -> not currentDeps.includes wbs
      removed = currentDeps.filter (wbs) -> not newDeps.includes wbs
      removeDeps task, removed if removed.length
      addDeps task, type, added if added.length
  if 'successors' of data
    for type, depds of data.successors
      depds = joinDeps depds if luda.isArray depds
      newDepds = splitDeps depds
      currentDepds = splitDeps task.depended[type]
      added = newDepds.filter (wbs) -> not currentDepds.includes wbs
      removed = currentDepds.filter (wbs) -> not newDepds.includes wbs
      removeDepd task, removed if removed.length
      addDepd task, type, added if added.length
  beginning task, data.beginning if 'beginning' of data
  end task, data.end if 'end' of data
  duration task, data.duration if 'duration' of data
  pick task, data.isPicked if 'isPicked' of data
  fold task, data.isFolded if 'isFolded' of data
  actions task, data.actions... if 'actions' of data
  readonlyProps task, data.readonlyProps... if 'readonlyProps' of data

updateTask = (existed, datas...) ->
  mustExist existed
  [withUid, withoutUid, dataForExisted, updated] = [[], [], {}, []]
  datas.forEach (data) ->
    return withUid.push data if 'uid' of data
    Object.assign dataForExisted, data
  if Object.keys(dataForExisted).length
    dataForExisted.uid = existed.uid
    withUid.push dataForExisted
  withUid.sort((a, b) -> b.uid - a.uid).forEach (data) ->
    return unless task = find root(existed), data.uid
    updated.push task
    Object.keys(data).forEach (prop) ->
      propTree = prop.split '.'
      return if propTree.length is 1
      [value, topLevelProp] = [data[prop], propTree[0]]
      if topLevelProp is 'predecessors' or topLevelProp is 'dependencies'
        newVal = JSON.parse JSON.stringify(task.data.dependencies)
        newVal[propTree[1]] = value
      else if topLevelProp is 'successors'
        newVal = JSON.parse JSON.stringify(task.depended)
        newVal[propTree[1]] = value
      else
        newVal = newValDup = JSON.parse(
          JSON.stringify task.data[topLevelProp] or {}
        )
        propTree.forEach (p, i) ->
          return if i is 0
          return newVal = newValDup[p] ||= {} unless i is propTree.length - 1
          newValDup[p] = value
      data[topLevelProp] = newVal
      delete data[prop]
    delete data[p] for p in builtInProps
    updateTaskEnhancedProps task, data
    delete data[p] for p in enhancedProps
    for key, newVal of data
      oldVal = task.data[key]
      detail = {}
      detail[key] = {newVal, oldVal}
      # Custom properties are allowed to be changed in before-update event
      isPrevented = triggerEvent(
        task, 'before-update', detail, {target: task, prop: key}
      ) is false
      if isPrevented
        detail[key].newVal = oldVal
        triggerEvent task, 'after-touch', detail
      else
        task.data[key] = detail[key].newVal
        triggerEvent task, 'after-touch', detail
        unless detail[key].newVal is oldVal
          triggerEvent task, 'after-update', detail
  updated

updateHistoricalTask = (datas...) ->
  results = datas.map (data) ->
    data.data ||= {}
    updated = {}
    task = find root(data), data.uid
    delete data.uid
    delete data.rootId
    Object.keys(data).forEach (key) ->
      return if key is 'data'
      updated[key] = {
        oldVal: task[key]
        newVal: task[key] = data[key]
      }
      return unless key is 'depended'
      updated.successors = updated[key]
    Object.keys(data.data).forEach (key) ->
      updated[key] = {
        oldVal: task.data[key]
        newVal: task.data[key] = data.data[key]
      }
      return unless key is 'dependencies'
      updated.predecessors = updated[key]
      for type, val of data.data[key]
        updated[type] = {
          oldVal: updated[key].oldVal[type]
          newVal: updated[key].newVal[type]
        }
    {task, updated}
  setTimeout ->
    results.forEach (r) ->
      triggerEvent r.task, 'after-touch', r.updated
      triggerEvent r.task, 'after-update', r.updated

update = (existed, datas...) ->
  return updateRoot existed, datas... if isRoot existed
  updateTask existed, datas...

Task.prototype.update = (datas...) ->
  @_pushUndoState => update this, datas...
  this



export {
  update
  update as default
  updateHistoricalTask
}

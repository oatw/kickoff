import {
  Task
  splitWbs
  joinWbs
  root
  splitDeps
  joinDeps
  mustBeRoot
  mustExist
  isRoot
  isTask
  parent
  find
} from './task.coffee'
import {
  nextSiblings
  descendants
  ancestors
  children
} from './query.coffee'
import {removeDepd} from './successor.coffee'
import {triggerEvent, removeEvent} from './event.coffee'
import {depWbses, beforeUpdateDeps, touchDeps} from './predecessor.coffee'
import {beforeUpdateSchedule, touchSchedule} from './schedule.coffee'
import {desc} from './order.coffee'
import {fold} from './fold.coffee'



riseNextSiblings = (task) ->
  taskWbsArr = splitWbs task.data.wbs
  [oldWbses, newWbses] = [[], []]
  nextSiblings(task).forEach (c) ->
    descendants(c).concat(c).forEach (t) ->
      oldWbses.push oldVal = t.data.wbs
      wbsArr = splitWbs t.data.wbs
      wbsArr[taskWbsArr.length - 1] -= 1
      newVal = t.data.wbs = joinWbs wbsArr
      detail = {wbs: {oldVal, newVal}}
      triggerEvent t, 'after-touch', detail
      triggerEvent t, 'after-update', detail
      newWbses.push t.data.wbs
  root(task).tasks.forEach (t) ->
    for type, val of t.data.dependencies
      [shouldUpdate, wbses] = [false, splitDeps val]
      wbses.forEach (wbs, index) ->
        return unless oldWbses.includes wbs
        wbses[index] = newWbses[oldWbses.indexOf wbs]
        shouldUpdate = true
      touchDeps t, type, wbses, [] if shouldUpdate

destroyRoot = (rootTask) ->
  mustBeRoot rootTask
  delete Task.roots[rootTask.uid]
  rootTask[k] = null for k, v of rootTask
  rootTask

destroy = (existed, tasks...) ->
  mustExist existed
  unless tasks.length
    return destroyRoot existed if isRoot existed
    tasks = [existed]
  [destroied, all] = [[], root(existed).tasks]
  desc(tasks...).forEach (task) ->
    treeDownNodes = descendants(task).concat(task).filter (t) -> all.includes t
    return unless treeDownNodes.length
    treeDownNodes = desc treeDownNodes...
    # Checking if any before-destroy event of
    # current task or its descendants is prevented
    isPrevented = treeDownNodes.some (node) ->
      triggerEvent(node, 'before-destroy') is false
    return if isPrevented
    # Checking if any ancestors of current task need be rescheduled
    # and if any of the operations is prevented
    {triggered, resources} = beforeUpdateSchedule task, {}, 'destroy', true
    [isPrevented, scheduleResources] = [not triggered, resources]
    return if isPrevented
    # Checking if any existed task's dependencies property need be updated
    # and if any of the operations is prevented.
    depsResources = []
    treeDownWbses = treeDownNodes.map (node) -> node.data.wbs
    isPrevented = all.some (node) ->
      return false if treeDownNodes.includes node
      Object.keys(node.data.dependencies).some (type) ->
        depsWbsArr = depWbses node, type
        filtered = depsWbsArr.filter (w) -> not treeDownWbses.includes w
        return false if luda.arrayEqual depsWbsArr, filtered
        triggered = beforeUpdateDeps node, type, filtered
        # Collecting dependencies resources need be updated
        depsResources.push {task: node, type, newVals: filtered}
        not triggered
    return if isPrevented
    # Executing destroy actions.
    touchSchedule task, null, 'destroy', scheduleResources
    depsResources.forEach (r) -> touchDeps r.task, r.type, r.newVals, []
    riseNextSiblings task
    taskAncestors = desc ancestors(task)...
    treeDownNodes.forEach (node) ->
      triggerEvent node, 'after-destroy'
      removeEvent node
      destroied.push node
      all.splice all.indexOf(node), 1
    taskAncestors.forEach (a) ->
      fold a, false if a.isFolded and children(a).length is 0
  destroied

destroyHistoricalTask = (datas...) ->
  datas.forEach (data) ->
    rootTask = root data
    task = find rootTask, data.uid
    index = rootTask.tasks.indexOf task
    return unless index >= 0
    triggerEvent task, 'after-destroy'
    removeEvent task
    rootTask.tasks.splice index, 1

Task.prototype.destroy = (tasks...) ->
  result = []
  @_pushUndoState => result = destroy this, tasks...
  result



export {
  destroy
  destroy as default
  destroyHistoricalTask
}

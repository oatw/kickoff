import {Task, find, mustExist, root} from './task.coffee'
import {asc} from './order.coffee'
import {createHistoricalTask} from './create.coffee'
import {updateHistoricalTask} from './update.coffee'
import {destroyHistoricalTask} from './destroy.coffee'
import {triggerEvent} from './event.coffee'



supportedDataTypes = [
  '[object String]', '[object Number]', '[object Boolean]',
  '[object Array]', '[object Object]', '[object Undefined]',
  '[object Null]'
]

stateEqual = (one, two) ->
  return true if one is two
  oneType = Object.prototype.toString.call one
  twoType = Object.prototype.toString.call two
  return false unless oneType is twoType
  if oneType is '[object Object]'
    [oneKeys, twoKeys] = [Object.keys(one), Object.keys(two)]
    return false unless oneKeys.length is twoKeys.length
    return oneKeys.every (key) -> stateEqual one[key], two[key]
  if oneType is '[object Array]'
    return false unless one.length is two.length
    return true if luda.arrayEqual one, two
    [one, two] = [one.sort(), two.sort()]
    return one.every (oneE) -> two.some (twoE) -> stateEqual oneE, twoE
  Object.is one, two

currentState = (task) ->
  mustExist task
  state = JSON.parse JSON.stringify(asc root(task).tasks...)
  state.forEach (item) -> delete item.errors
  state

diffState = (newState = [], oldState = []) ->
  isDiff = false
  [toCreateUids, toDestroyUids] = [[], []]
  [toDestroy, toCreate, toUpdate] = [[], [], []]
  oldState.forEach (task) ->
    return if newState.find (item) -> item.uid is task.uid
    toDestroyUids.push task.uid
    toDestroy.push task
    isDiff = true
  newState.forEach (task) ->
    return if oldState.find (item) -> item.uid is task.uid
    toCreateUids.push task.uid
    toCreate.push task
    isDiff = true
  newState.forEach (task) ->
    return if toCreateUids.includes task.uid
    return if toDestroyUids.includes task.uid
    return unless oldTask = oldState.find (item) -> item.uid is task.uid
    return unless diffedTask = diffTask task, oldTask
    toUpdate.push diffedTask
    isDiff = true
  return null unless isDiff
  {destroy: toDestroy, create: toCreate, update: toUpdate}

diffTask = (newTask, oldTask, _exclusionKeys = []) ->
  diffedTask = null
  [newKeys, oldKeys] = [Object.keys(newTask), Object.keys(oldTask)]
  newKeys.forEach (key) ->
    return if _exclusionKeys.includes key
    oldKeys.splice i, 1 if (i = oldKeys.indexOf key) >= 0
    return if stateEqual newTask[key], oldTask[key]
    diffedTask ||= {}
    diffedTask[key] = newTask[key]
  oldKeys.forEach (key) ->
    return if _exclusionKeys.includes key
    diffedTask ||= {}
    diffedTask[key] = undefined
  return diffedTask if _exclusionKeys.includes 'data'
  if diffedTask
    diffedTask.uid = newTask.uid
    diffedTask.rootId = newTask.rootId
  return diffedTask unless data = diffTask newTask.data, oldTask.data, ['data']
  diffedTask ||= {}
  diffedTask.data = data
  diffedTask

popState = (task, action = 'undo') ->
  mustExist task
  rootTask = root task
  stack = rootTask.stacks[action]
  return null unless state = stack.pop()
  state = JSON.parse JSON.stringify(state)
  triggerEvent(
    rootTask, 'after-update-state-stack', {action, state, direction: 'pop'}
  )
  triggerEvent rootTask, 'after-pop-state-stack', {action, state}
  triggerEvent rootTask, "after-pop-#{action}-state-stack", state
  state

popUndoState = (task) -> popState task, 'undo'

popRedoState = (task) -> popState task, 'redo'

pushState = (task, action = 'undo', _state) ->
  mustExist task
  rootTask = root task
  stack = rootTask.stacks[action]
  state = _state or currentState task
  lastState = stack[stack.length - 1]
  shouldPush = not lastState
  shouldPush ||= state.length isnt lastState.length
  shouldPush ||= not stateEqual state, lastState
  return null unless shouldPush
  stack.shift() if stack.length >= rootTask.data.maxHistorySize
  stack.push state
  triggerEvent(
    rootTask, 'after-update-state-stack', {action, state, direction: 'push'}
  )
  triggerEvent rootTask, 'after-push-state-stack', {action, state}
  triggerEvent rootTask, "after-push-#{action}-state-stack", state
  state

pushUndoState = (task) -> pushState task, 'undo'

pushRedoState = (task) -> pushState task, 'redo'

history = (task, action = 'undo') ->
  mustExist task
  return unless lastState = popState task, action
  state = currentState task
  actions = diffState lastState, state
  return unless actions
  destroyHistoricalTask actions.destroy...
  createHistoricalTask actions.create...
  updateHistoricalTask actions.update...
  pushState task, (if action is 'undo' then 'redo' else 'undo'), state
  rootTask = root task
  detail = {currentState: lastState, oldState: state}
  triggerEvent rootTask, 'after-switch-state', detail
  triggerEvent rootTask, "after-#{action}", detail

undo = (task) -> history task, 'undo'

redo = (task) -> history task, 'redo'

Task.prototype.pushUndoState = ->
  return if root(this).historyTrackingDisabled
  pushUndoState this

Task.prototype.stopTrackingHistory = ->
  root(this).historyTrackingDisabled = true

Task.prototype.startTrackingHistory = ->
  delete root(this).historyTrackingDisabled

Task.prototype._pushUndoState = (callback) ->
  return callback() if callback and root(this).historyTrackingDisabled
  rootTask = root this
  oldState = pushUndoState rootTask
  callback() if callback
  return unless oldState
  return unless stateEqual currentState(rootTask), oldState
  popUndoState rootTask

Task.prototype.pushRedoState = ->
  return if root(this).historyTrackingDisabled
  pushRedoState this

Task.prototype.popUndoState = ->
  return if root(this).historyTrackingDisabled
  popUndoState this

Task.prototype.popRedoState = ->
  return if root(this).historyTrackingDisabled
  popRedoState this

Task.prototype.undo = ->
  undo this
  this

Task.prototype.redo = ->
  redo this
  this



export {
  pushState
  pushUndoState
  pushRedoState
  popState
  popUndoState
  popRedoState
  undo
  redo
  history
  history as default
}

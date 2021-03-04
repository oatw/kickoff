import {
  Task
  mustExist
  isRoot
  rootTaskActions
  invalidMilestoneActions
} from './task.coffee'
import {triggerEvent} from './event.coffee'
import {isMilestone} from './type.coffee'



can = (task, action, auth) ->
  mustExist task
  operations = if isRoot task then task.data.actions else task.operations
  isActionEnabled = operations.includes action
  return isActionEnabled unless auth?
  if auth
    return if isActionEnabled
    return if isMilestone(task) and invalidMilestoneActions.includes action
    oldVal = operations.slice()
    operations.push action
    newVal = operations.slice()
  else
    return unless isActionEnabled
    oldVal = operations.slice()
    operations.splice operations.indexOf(action), 1
    newVal = operations.slice()
  return task unless oldVal and newVal
  detail = {actions: {newVal, oldVal}}
  # It's not necessary to implement the before-update event,
  # because a tasks's actions cannot controlled by users.
  triggerEvent task, 'after-touch', detail
  triggerEvent task, 'after-update', detail
  task

actions = (task, acts...) ->
  mustExist task
  operations = if isRoot task then task.data.actions else task.operations
  return operations.slice() unless acts.length
  for act in operations.concat(acts)
    can task, act, acts.includes(act)
  task

canBePicked = (task, auth) -> can task, 'pick', auth

canBeFolded = (task, auth) -> can task, 'fold', auth

canCreateTask = (task, auth) -> can task, 'createTask', auth

canCreateMilestone = (task, auth) -> can task, 'createMilestone', auth

canBeUpdated = (task, auth) -> can task, 'update', auth

canBeDestroied = (task, auth) -> can task, 'destroy', auth

canDestroyDescendants = (task, auth) -> can task, 'destroyDescendants', auth

canSwitchState = (task, auth) -> can task, 'switchState', auth

Task.prototype.can = (action, auth) ->
  result = can this, action, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.actions = (acts...) ->
  result = actions this, acts...
  return result if result instanceof Array
  this

Task.prototype.canBePicked = (auth) ->
  result = canBePicked this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canBeFolded = (auth) ->
  result = canBeFolded this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canCreateTask = (auth) ->
  result = canCreateTask this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canCreateMilestone = (auth) ->
  result = canCreateMilestone this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canBeUpdated = (auth) ->
  result = canBeUpdated this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canBeDestroied = (auth) ->
  result = canBeDestroied this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canDestroyDescendants = (auth) ->
  result = canDestroyDescendants this, auth
  return result if typeof result is 'boolean'
  this

Task.prototype.canSwitchState = (auth) ->
  result = canSwitchState this, auth
  return result if typeof result is 'boolean'
  this


export {
  can
  can as default
  actions
  canBePicked
  canBeFolded
  canBeUpdated
  canBeDestroied
  canCreateTask
  canCreateMilestone
}

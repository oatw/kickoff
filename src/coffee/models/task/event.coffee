import {Task, root, mustExist, mustBeTask, depcTypes} from './task.coffee'
import {desc} from './order.coffee'
import {ancestors} from './query.coffee'
import {
  CustomEvent
  mustBeValidCallback
  nsMatches
  parseEvent
} from '../../utilities/event.coffee'



class TaskEvent extends CustomEvent



eventCache = (task, type) ->
  cache = root(task).events
  cache[type] ||= []

addEvent = (task, event, callback, _one = false) ->
  {type, namespace} = parseEvent event
  mustBeValidCallback callback
  mustExist task
  eventCache(task, type).push {task, namespace, callback, _one}

addEventOnce = (task, event, callback) -> addEvent task, event, callback, true

removeEvent = (task, event, callback) ->
  {type, namespace} = parseEvent event if event
  mustBeValidCallback callback if callback
  mustExist task
  eventCache task, type
  types = if type then [type] else Object.keys root(task).events
  for type in types
    root(task).events[type] = eventCache(task, type).filter (q) ->
      return true if task.uid isnt q.task.uid
      return true if callback and callback isnt q.callback
      return true if namespace and namespace.length and \
      not nsMatches namespace, q.namespace

triggerEvent = (task, event, detail, original) ->
  mustExist task
  {type, namespace} = parseEvent event
  shouldTrigger = task.created or type is 'before-create'
  return unless shouldTrigger
  taskEvent = new TaskEvent task, event, detail, original
  eventQuene = eventCache task, type
  eventPath = desc ancestors(task, null, true).concat(task)...
  eventPath.some (t) ->
    eventQuene.some (q) ->
      return unless t.uid is q.task.uid
      return unless nsMatches namespace, q.namespace
      taskEvent.currentTarget = t
      if q.callback.call(t, taskEvent, taskEvent.detail) is false
        taskEvent.stopPropagation()
        taskEvent.preventDefault()
      removeEvent task, event, q.callback if q._one
      taskEvent.isImmediatePropagationStopped()
    taskEvent.isPropagationStopped()
  not taskEvent.isDefaultPrevented()

Task.prototype.on = (event, callback) ->
  addEvent this, event, callback
  this

Task.prototype.one = (event, callback) ->
  addEventOnce this, event, callback
  this

Task.prototype.off = (event, callback) ->
  removeEvent this, event, callback
  this

Task.prototype.trigger = (event, detail, _needResult) ->
  isTriggered = triggerEvent(this, event, detail) isnt false
  return isTriggered if _needResult
  this



export {
  addEvent
  addEventOnce
  removeEvent
  triggerEvent
}

import {Task, mustExist} from './task.coffee'
import {triggerEvent} from './event.coffee'



handleError = (task, prop, error) ->
  mustExist task
  # read all errors @example error(task)
  if prop is undefined
    return null unless Object.keys(task.errors).length
    task.errors
  # clear all errors @example error(task, null)
  else if prop is null
    task.errors = {}
    task
  else if typeof prop is 'string'
    # get the errors of a single prop @example error(task, 'name')
    return task.errors[prop] or null if error is undefined
    # clear the errors of a single prop @example error(task, 'name', null)
    return delete task.errors[prop] and task if error is null
    # add an error to a single prop @example error(task, 'name', 'name error')
    task.errors[prop] ||= []
    task.errors[prop].push error unless task.errors[prop].includes error
    task
  # set or clear multiple prop errors by passing in an object
  # @example error(task, {name: 'e', beginning: null})
  else if typeof prop is 'object'
    handleError task, key, val for key, val of prop
    task
  else
    throw new Error 'Unsupported case'

error = (task, prop, error) ->
  mustExist task
  [oldV, newV] = [{}, {}]
  oldV[key] = val.slice().sort() for key, val of task.errors
  result = handleError task, prop, error
  newV[key] = val.slice().sort() for key, val of task.errors
  [oldKeys, newKeys] = [Object.keys(oldV), Object.keys(newV)]
  isUpdated = not luda.arrayEqual newKeys, oldKeys
  isUpdated ||= newKeys.some (key) -> not luda.arrayEqual oldV[key], newV[key]
  return result unless isUpdated
  detail = {error: {oldVal: oldV, newVal: newV}}
  triggerEvent task, 'after-touch', detail
  triggerEvent task, 'after-update', detail
  result

Task.prototype.error = (prop, val) -> error this, prop, val



export {
  error
  error as default
}

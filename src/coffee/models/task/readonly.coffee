import {
  Task
  mustExist
  isRoot
  builtInProps
} from './task.coffee'
import {triggerEvent} from './event.coffee'
import {isMilestone} from './type.coffee'
import {canBeUpdated} from './can.coffee'



readonly = (task, prop, isReadonly) ->
  mustExist task
  if isRoot task
    return if isReadonly?
    true
  else
    isPropReadonly = task.readonlys.includes prop
    isPropReadonly ||= not canBeUpdated task
    return isPropReadonly unless isReadonly?
    if isReadonly
      return if isPropReadonly
      oldVal = task.readonlys.slice()
      task.readonlys.push prop
      if prop is 'duration'
        readonly task, 'beginning', true
        readonly task, 'end', true
      if readonly(task, 'beginning') and readonly(task, 'end')
        readonly task, 'duration', true
      if isMilestone task
        if readonly(task, 'duration') \
        or readonly(task, 'beginning') or readonly(task, 'end')
          readonly task, 'duration', true
      newVal = task.readonlys.slice()
    else
      return unless isPropReadonly
      return if builtInProps.includes prop
      oldVal = task.readonlys.slice()
      task.readonlys.splice task.readonlys.indexOf(prop), 1
      if prop is 'duration'
        readonly task, 'beginning', false
        readonly task, 'end', false
      if not readonly(task, 'beginning') or not readonly(task, 'end')
        readonly task, 'duration', false
      if isMilestone task
        if not readonly(task, 'duration') \
        or not readonly(task, 'beginning') or not readonly(task, 'end')
          readonly task, 'duration', false
      newVal = task.readonlys.slice()
    return task unless oldVal and newVal
    detail = {readonlyProps: {newVal, oldVal}}
    # It's not necessary to implement the before-update event,
    # because the readonly properties can not controlled by users.
    triggerEvent task, 'after-touch', detail
    triggerEvent task, 'after-update', detail
    task

readonlyProps = (task, props...) ->
  mustExist task
  if isRoot task
    return if props.length
    []
  else
    return task.readonlys.slice() unless props.length
    for prop in task.readonlys.concat(props)
      readonly task, prop, props.includes(prop)
    task

Task.prototype.readonly = (prop, isReadonly) ->
  result = readonly this, prop, isReadonly
  return result if typeof result is 'boolean'
  this

Task.prototype.readonlyProps = (props...) ->
  result = readonlyProps this, props...
  return result if result instanceof Array
  this



export {
  readonly
  readonly as default
  readonlyProps
}

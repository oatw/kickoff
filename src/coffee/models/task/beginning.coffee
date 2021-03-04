import {Time} from '../../models/time/index.coffee'
import {
  Task
  mustExist
  isRoot
} from './task.coffee'
import {children} from './query.coffee'
import {tryUpdateSchedule} from './schedule.coffee'



beginning = (task, val) ->
  mustExist task
  unless val
    return new Time task.data.beginning unless isRoot task
    beginnings = children(task).map (c) -> c.data.beginning
    return Time.earlist beginnings...
  return if isRoot task
  tryUpdateSchedule task, {beginning: new Time val}, 'flex'

Task.prototype.beginning = (val) ->
  return beginning this, val unless val
  @_pushUndoState => beginning this, val
  this



export {
  beginning
  beginning as default
}

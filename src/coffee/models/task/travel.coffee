import {Time} from '../../models/time/index.coffee'
import {
  Task
  mustExist
  isRoot
} from './task.coffee'
import {children} from './query.coffee'
import {tryUpdateSchedule} from './schedule.coffee'



travel = (task, secs) ->
  mustExist task
  return if isRoot task
  return if secs is 0
  throw new Error "distance must be an integer" unless Number.isInteger secs
  [oldBegin, oldEnd] = [new Time(task.data.beginning), new Time(task.data.end)]
  [newBegin, newEnd] = [oldBegin.calcSeconds(secs), oldEnd.calcSeconds(secs)]
  tryUpdateSchedule task, {beginning: newBegin, end: newEnd}, 'travel'

Task.prototype.travel = (secs) ->
  @_pushUndoState => travel this, secs
  this



export {
  travel
  travel as default
}

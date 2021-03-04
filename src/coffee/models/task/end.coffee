import {Time} from '../../models/time/index.coffee'
import {
  Task
  mustExist
  isRoot
} from './task.coffee'
import {children} from './query.coffee'
import {tryUpdateSchedule} from './schedule.coffee'



end = (task, val) ->
  mustExist task
  unless val
    return new Time task.data.end unless isRoot task
    ends = children(task).map (c) -> c.data.end
    return Time.latest ends...
  return if isRoot task
  tryUpdateSchedule task, {end: new Time val}, 'flex'

Task.prototype.end = (val) ->
  return end this, val unless val
  @_pushUndoState => end this, val
  this



export {
  end
  end as default
}

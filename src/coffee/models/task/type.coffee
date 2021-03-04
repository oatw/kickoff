import {
  Task
  mustExist
  mustBeTask
} from './task.coffee'



isTask = (task) ->
  mustBeTask task
  task.data.type isnt 'milestone'

isMilestone = (task) ->
  mustBeTask task
  task.data.type is 'milestone'

type = (task) ->
  mustExist task
  if isTask(task) then 'task' else 'milestone'

Task.prototype.type = -> type this

Task.prototype.isTask = -> isTask this

Task.prototype.isMilestone = -> isMilestone this



export {
  type
  type as default
  isTask
  isMilestone
}

import {Task, mustExist} from './task.coffee'
import {descendants} from './query.coffee'
import {triggerEvent} from './event.coffee'



pick = (tasks = [], isPicked = true, cascaded = true) ->
  tasks = [tasks] unless luda.isArray tasks
  if cascaded
    taskDescendants = []
    tasks.forEach (t) ->
      taskDescendants = taskDescendants.concat descendants(t)
    tasks = luda.unique(tasks.concat taskDescendants)
  tasks.forEach (t) ->
    oldVal = Boolean t.isPicked
    newVal = t.isPicked = Boolean isPicked
    detail = {isPicked: {newVal, oldVal}}
    # It's not necessary to implement the before-update event,
    # because the isPicked property has noting to do
    # with a task's business data.
    triggerEvent t, 'after-touch', detail
    return if oldVal is newVal
    triggerEvent t, 'after-update', detail
    return unless cascaded

picked = (task) ->
  mustExist task
  descendants(task).filter (t) -> t.isPicked

Task.pick = pick

Task.prototype.pick = (isPicked, cascaded) ->
  pick this, isPicked, cascaded
  this

Task.prototype.picked = ->
  picked this



export {
  picked
  pick
  pick as default
}

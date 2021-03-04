import {Task, mustExist, nextWbs, firstChildWbs, root} from './task.coffee'
import {lastChild} from './query.coffee'
import {triggerEvent} from './event.coffee'
import {compareWbs} from './order.coffee'



createRoot = (settings = {}) ->
  delete settings.wbs
  new Task settings

createTasks = (existed, datas...) ->
  mustExist existed
  [withWbs, withoutWbs, created] = [[], [], []]
  datas.forEach (data) ->
    data.rootId = existed.rootId
    return withWbs.push data if 'wbs' of data
    withoutWbs.push data
  withWbs.sort((a, b) -> compareWbs(a.wbs, b.wbs)).forEach (data) ->
    created.push(new Task data)
  withoutWbs.forEach (data) ->
    if lastC = lastChild existed
      data.wbs = nextWbs lastC.data.wbs
    else
      data.wbs = firstChildWbs existed.data.wbs
    created.push(new Task data)
  created

createHistoricalTask = (datas...) ->
  tasks = (new Task data, {source: 'history'} for data in datas)
  setTimeout -> tasks.forEach (task) -> triggerEvent task, 'after-create'

create = (settings = {}, datas...) ->
  delete settings.wbs
  rootTask = createRoot settings
  createTasks rootTask, datas...
  rootTask

Task.create = create

Task.prototype.create = (datas...) ->
  result = []
  @_pushUndoState => result = createTasks this, datas...
  result



export {
  createRoot
  createTasks
  create
  create as default
  createHistoricalTask
}

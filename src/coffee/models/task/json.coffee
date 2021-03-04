import {Task, mustExist, isRoot} from './task.coffee'
import {descendants} from './query.coffee'
import {asc} from './order.coffee'



stringify = (task, cascaded = true) ->
  mustExist task
  return JSON.stringify task.data unless cascaded
  tasks = descendants task
  tasks.unshift task unless isRoot task
  sortedTasks = asc(tasks...).map (t) -> t.data
  JSON.stringify sortedTasks

parse = (task, cascaded = true) -> JSON.parse stringify(task, cascaded)

Task.prototype.parse = (cascaded) -> parse this, cascaded

Task.prototype.stringify = (cascaded) -> stringify this, cascaded



export {
  parse
  stringify
}

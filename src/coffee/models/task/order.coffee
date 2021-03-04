import {Task, mustBeTask, splitWbs} from './task.coffee'



compareWbs = (a = '', b = '') ->
  return -1 unless a
  return 1 unless b
  [aWbs, bWbs, result] = [splitWbs(a), splitWbs(b), 0]
  aWbs.push 0 if aWbs.length < bWbs.length
  aWbs.some (n, i) -> result = n - (bWbs[i] or 0)
  result

asc = (tasks...) ->
  tasks.forEach (t) -> mustBeTask t
  tasks.sort (a, b) -> compareWbs(a.data?.wbs, b.data?.wbs)

desc = (tasks...) -> asc(tasks...).reverse()

order = (order = 'asc', tasks...) ->
  return asc tasks... if order is 'asc'
  return desc tasks... if order is 'desc'
  throw new Error "order can only be 'asc' or 'desc'"

Task.asc = asc
Task.desc = desc
Task.order = order



export {
  compareWbs
  asc
  desc
  order
  order as default
}

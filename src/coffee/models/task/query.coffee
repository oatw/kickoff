import {
  Task
  root
  isRoot
  splitWbs
  parent
  find
  mustExist
  prevWbs
  nextWbs
} from './task.coffee'
import {asc, desc} from './order.coffee'



children = (task, ruleFn) ->
  mustExist task
  if isRoot task
    return task.tasks.filter (t) -> splitWbs(t.data.wbs).length is 1
  taskWbs = splitWbs task.data.wbs
  root(task).tasks.filter (t) ->
    tWbs = splitWbs t.data.wbs
    return false unless tWbs.length is taskWbs.length + 1
    isChd = not taskWbs.some (n, i) -> n isnt tWbs[i]
    if ruleFn then isChd and ruleFn t else isChd

firstChild = (task) ->
  mustExist task
  return null unless (chd = children task).length
  (asc chd...)[0]

lastChild = (task) ->
  mustExist task
  return null unless (chd = children task).length
  (desc chd...)[0]

prevSiblings = (task, ruleFn) ->
  mustExist task
  return [] if isRoot task
  chd = asc children(parent(task, true), ruleFn)...
  chd.slice(0, chd.indexOf(task))

prevSibling = (task) ->
  mustExist task
  return null if isRoot task
  siblingWbs = prevWbs task.data.wbs
  return null unless siblingWbs
  find root(task), siblingWbs

nextSiblings = (task, ruleFn) ->
  mustExist task
  return [] if isRoot task
  chd = asc children(parent(task, true), ruleFn)...
  chd.slice(chd.indexOf(task) + 1)

nextSibling = (task) ->
  mustExist task
  return null if isRoot task
  siblingWbs = nextWbs task.data.wbs
  return null unless siblingWbs
  find root(task), siblingWbs

descendants = (task, ruleFn) ->
  mustExist task
  return task.tasks if isRoot task
  taskWbs = splitWbs task.data.wbs
  root(task).tasks.filter (t) ->
    tWbs = splitWbs t.data.wbs
    return false unless tWbs.length > taskWbs.length
    isDescendant = not taskWbs.some (n, i) -> n isnt tWbs[i]
    if ruleFn then isDescendant and ruleFn t else isDescendant

ancestors = (task, ruleFn, includeRoot = false) ->
  mustExist task
  return [] if isRoot task
  taskWbs = splitWbs task.data.wbs
  collected = root(task).tasks.filter (t) ->
    tWbs = splitWbs t.data.wbs
    return false unless tWbs.length < taskWbs.length
    isAncestor = not tWbs.some (n, i) -> n isnt taskWbs[i]
    if ruleFn then isAncestor and ruleFn t else isAncestor
  collected.unshift root task if includeRoot
  collected

where = (task, conOrRule) ->
  mustExist task
  if typeof conOrRule is 'function'
    descendants(task).filter (t) -> conOrRule t
  else if typeof conOrRule is 'object'
    descendants(task).filter (t) ->
      for key, val of conditions
        return false if t.data[key] isnt val
      true
  else
    []

Task.prototype.root = -> root this

Task.prototype.children = (ruleFn) -> children this, ruleFn

Task.prototype.firstChild = -> firstChild this

Task.prototype.lastChild = -> lastChild this

Task.prototype.nextSiblings = (ruleFn) -> nextSiblings this, ruleFn

Task.prototype.nextSibling = Task.prototype.next = -> nextSibling this

Task.prototype.prevSiblings = (ruleFn) -> prevSiblings this, ruleFn

Task.prototype.prevSibling = Task.prototype.prev = -> prevSibling this

Task.prototype.descendants = Task.prototype.tasks = (ruleFn) ->
  descendants this, ruleFn

Task.prototype.ancestors = (ruleFn, includeRoot = false) ->
  ancestors this, ruleFn, includeRoot

Task.prototype.parent = (includeRoot = false) -> parent this, includeRoot

Task.prototype.find = (uidOrWbs) -> find root(this), uidOrWbs

Task.prototype.where = (conOrRule) -> where this, conOrRule



export {
  children
  firstChild
  lastChild
  nextSiblings
  prevSiblings
  descendants
  ancestors
  parent
  find
  where
}

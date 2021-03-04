import {Task, mustExist, parent} from './task.coffee'
import {ancestors, descendants, children} from './query.coffee'
import {asc, desc} from './order.coffee'
import {triggerEvent} from './event.coffee'



fold = (task, isFolded = true) ->
  mustExist task
  unless isFolded = Boolean isFolded
    foldedAncestors = ancestors(task, (t) -> t.isFolded)
    return fold asc(foldedAncestors...)[0], isFolded if foldedAncestors.length
  asc(descendants(task).concat(task)...).forEach (t) ->
    [oldFolded, oldHidden] = [Boolean(t.isFolded), Boolean(t.isHidden)]
    t.isFolded = if children(t).length then isFolded else false
    if t is task
      t.isHidden = if isFolded then Boolean(t.isHidden) else false
    else
      t.isHidden = Boolean parent(t, true).isFolded
    isFoldedDetail = {isFolded: {newVal: t.isFolded, oldVal: oldFolded}}
    isHiddenDetail = {isHidden: {newVal: t.isHidden, oldVal: oldHidden}}
    touchDetail = Object.assign {}, isFoldedDetail, isHiddenDetail
    # It's not necessary to implement the before-update event,
    # because the isFolded property has noting to do
    # with a task's business data.
    triggerEvent t, 'after-touch', touchDetail
    unless oldFolded is t.isFolded
      triggerEvent t, 'after-update', isFoldedDetail
    unless oldHidden is t.isHidden
      triggerEvent t, 'after-update', isHiddenDetail

Task.prototype.fold = (isFolded) ->
  fold this, isFolded
  this



export {
  fold
  fold as default
}

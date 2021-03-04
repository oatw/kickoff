import {Time} from '../time/index.coffee'
import {Timeline, mustBeTimeline} from './timeline.coffee'
import {unit} from './unit.coffee'
import {triggerEvent} from './event.coffee'


beginningIncludePadding = (timeline, beginVal) ->
  mustBeTimeline timeline
  m = Time.methodNames unit(timeline)
  new Time(beginVal)[m.prevUnit](timeline._padding)[m.beginningOfUnit]()

beginning = (timeline, newBegin) ->
  mustBeTimeline timeline
  oldVal = timeline._beginning
  return oldVal unless newBegin
  newVal = timeline._beginning = beginningIncludePadding timeline, newBegin
  detail = {beginning: {oldVal, newVal}}
  triggerEvent timeline, 'after-touch', detail
  unless newVal.equals oldVal
    triggerEvent timeline, 'after-update', detail

Timeline.prototype.beginning = (newBegin) ->
  result = beginning this, newBegin
  return result unless newBegin
  this



export {
  beginning
  beginning as default
  beginningIncludePadding
}

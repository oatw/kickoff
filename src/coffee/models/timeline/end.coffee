import {Time} from '../time/index.coffee'
import {Timeline, mustBeTimeline} from './timeline.coffee'
import {unit} from './unit.coffee'
import {beginning} from './beginning.coffee'
import {triggerEvent} from './event.coffee'


endIncludePadding = (timeline, endVal) ->
  mustBeTimeline timeline
  m = Time.methodNames unit(timeline)
  endVal = new Time(endVal)[m.endOfUnit]()
  begin = beginning timeline
  padding = timeline._padding
  beginNoPadding = begin[m.nextUnit](padding)[m.beginningOfUnit]()
  range = endVal.since(beginNoPadding)["#{unit(timeline)}s"]
  leastRange = timeline._leastRange
  endVal = beginNoPadding[m.nextUnit](leastRange) if range < leastRange
  endVal[m.nextUnit](padding)[m.endOfUnit]()

end = (timeline, newEnd) ->
  mustBeTimeline timeline
  oldVal = timeline._end
  return oldVal unless newEnd
  newVal = timeline._end = endIncludePadding timeline, newEnd
  detail = {end: {oldVal, newVal}}
  triggerEvent timeline, 'after-touch', detail
  unless newVal.equals oldVal
    triggerEvent timeline, 'after-update', detail

Timeline.prototype.end = (newEnd) ->
  result = end this, newEnd
  return result unless newEnd
  this



export {
  end
  end as default
  endIncludePadding
}

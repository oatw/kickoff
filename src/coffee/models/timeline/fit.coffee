import Time from '../time/index.coffee'
import {Timeline, mustBeTimeline} from './timeline.coffee'
import {beginning, beginningIncludePadding} from './beginning.coffee'
import {end, endIncludePadding} from './end.coffee'



fit = (timeline, beginVal, endVal, mode = 'both') ->
  mustBeTimeline timeline
  c = timeline._fitCache ||= {}
  unitSame = c.unit is timeline._unit
  beginSame = c.beginVal is beginVal
  beginSame ||= new Time(c.beginVal).equals(new Time beginVal)
  endSame = c.endVal is endVal
  endSame ||= new Time(c.endVal).equals(new Time endVal)
  return false if unitSame and beginSame and endSame
  unless mode is 'both'
    [currentBegin, currentEnd] = [beginning(timeline), end(timeline)]
    newBegin = beginningIncludePadding timeline, beginVal
    newEnd = endIncludePadding timeline, endVal
    if mode is 'grow'
      shouldUpdate = currentBegin.laterThan newBegin
      shouldUpdate ||= currentEnd.earlierThan newEnd
    else if mode is 'shrink'
      shouldUpdate = currentBegin.earlierThan newBegin
      shouldUpdate ||= currentEnd.laterThan newEnd
    else
      throw new Error "Invalid mode: #{mode}"
    return false unless shouldUpdate
  timeline._fitCache = {beginVal, endVal, unit: timeline._unit}
  beginning timeline, beginVal
  end timeline, endVal
  true

Timeline.prototype.fit = (beginVal, endVal, mode) ->
  fit this, beginVal, endVal, mode



export {
  fit
  fit as default
}

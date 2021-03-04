import {Timeline, mustBeTimeline} from './timeline.coffee'
import {beginning} from './beginning.coffee'
import {end} from './end.coffee'



duration = (timeline, secs) ->
  mustBeTimeline timeline
  return end(timeline).since(beginning timeline) unless secs
  newEnd = beginning(timeline).nextSecond secs
  end timeline, newEnd

Timeline.prototype.duration = (secs) ->
  result = duration this, secs
  return result unless secs?
  this

import {Timeline, mustBeTimeline} from './timeline.coffee'



update = (timeline, data = {}) ->
  mustBeTimeline timeline
  throw new Error "Not implemmented"



Timeline.prototype.update = (data) ->
  update this, data
  this



export {
  update
  update as default
}

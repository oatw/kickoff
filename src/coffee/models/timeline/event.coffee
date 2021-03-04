import {Timeline, mustBeTimeline} from './timeline.coffee'
import {
  CustomEvent
  mustBeValidCallback
  nsMatches
  parseEvent
} from '../../utilities/event.coffee'



class TimelineEvent extends CustomEvent



eventCache = (timeline, type) ->
  cache = timeline.events
  cache[type] ||= []

addEvent = (timeline, event, callback, _one = false) ->
  mustBeTimeline timeline
  {type, namespace} = parseEvent event
  mustBeValidCallback callback
  eventCache(timeline, type).push {namespace, callback, _one}

addEventOnce = (timeline, event, callback) ->
  addEvent timeline, event, callback, true

removeEvent = (timeline, event, callback) ->
  mustBeTimeline timeline
  {type, namespace} = parseEvent event if event
  mustBeValidCallback callback if callback
  eventCache timeline, type
  types = if type then [type] else Object.keys timeline.events
  for type in types
    timeline.events[type] = eventCache(timeline, type).filter (q) ->
      return true if callback and callback isnt q.callback
      return true if namespace and namespace.length and \
      not nsMatches namespace, q.namespace

triggerEvent = (timeline, event, detail) ->
  mustBeTimeline timeline
  return unless timeline.created
  {type, namespace} = parseEvent event
  timelineEvent = new TimelineEvent timeline, event, detail
  timelineEvent.currentTarget = timeline
  eventCache(timeline, type).some (q) ->
    return unless nsMatches namespace, q.namespace
    if q.callback.call(timeline, timelineEvent, timelineEvent.detail) is false
      timelineEvent.stopPropagation()
      timelineEvent.preventDefault()
    removeEvent timeline, event, q.callback if q._one
    timelineEvent.isImmediatePropagationStopped()
  not timelineEvent.isDefaultPrevented()

Timeline.prototype.on = (event, callback) ->
  addEvent this, event, callback
  this

Timeline.prototype.one = (event, callback) ->
  addEventOnce this, event, callback
  this

Timeline.prototype.off = (event, callback) ->
  removeEvent this, event, callback
  this

Timeline.prototype.trigger = (event, detail) ->
  triggerEvent this, event, detail
  this



export {
  addEvent
  addEventOnce
  removeEvent
  triggerEvent
}

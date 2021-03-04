import {Timeline, mustBeTimeline} from './timeline.coffee'
import {triggerEvent} from './event.coffee'



units = ['hour', 'day', 'week', 'month', 'year']

avaliableUnits = -> units

mustBeValidUnit = (unit) ->
  unless units.includes unit
    throw new Error 'unit must be one of hour, day, week, month and year'

unit = (timeline, newUnit) ->
  mustBeTimeline timeline
  oldVal = timeline._unit
  return oldVal unless newUnit
  mustBeValidUnit newUnit
  newVal = timeline._unit = newUnit
  detail = {unit: {oldVal, newVal}}
  triggerEvent timeline, 'after-touch', detail
  unless newVal is oldVal
    triggerEvent timeline, 'after-update', detail

Timeline.prototype.unit = (newUnit) ->
  result = unit this, newUnit
  return result unless newUnit
  this

Timeline.avaliableUnits = avaliableUnits

Timeline.prototype.avaliableUnits = -> avaliableUnits()



export {
  unit
  avaliableUnits
  unit as default
}

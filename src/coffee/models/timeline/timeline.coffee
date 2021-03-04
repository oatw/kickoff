import {Time} from '../time/index.coffee'


mustBeTimeline = (obj) ->
  throw new Error 'Not a timeline instance' unless obj instanceof Timeline

mustBeValidLeastRange = mustBeValidPadding = (n) ->
  unless Number.isInteger(n) and n > 0
    throw new Error 'must be a positive integer'

class Timeline

  constructor: (data = {}) ->
    if data instanceof Timeline
      throw new Error "Timeline instance cannot be recreated"
    @uid = luda.guid()
    @unit data.unit or 'day'
    @events = {}
    @_padding = data.padding or 4
    mustBeValidPadding @_padding
    @_leastRange = data.leastRange or 13
    mustBeValidLeastRange @_leastRange
    @_beginning = null
    @beginning new Time(data.beginning)
    @_end = null
    @end if data.end then new Time(data.end) else new Time(data.beginning)
    @_exclusions = data.exclusions or []
    @_inclusions = data.inclusions or []
    if 'excludeWeekends' of data
      @_excludeWeekends = data.excludeWeekends
    else
      @_excludeWeekends = true
    @_flags = data.flags or []
    @created = true
    @trigger 'after-create'



export {
  Timeline
  Timeline as default
  mustBeTimeline
}

import {
  Task
  mustExist
  root
  isRoot
} from './task.coffee'
import {Time} from '../time/index.coffee'
import {beginning} from './beginning.coffee'
import {end} from './end.coffee'



calcSecs = (taskBegin, taskEnd, exclusions = []) ->
  durationObj = taskEnd.since taskBegin
  durationSecs = durationObj.seconds
  return durationSecs unless exclusions and exclusions.length
  exclusions.some (t) ->
    [tEnd, tBegin] = [new Time(t.end), new Time(t.beginning)]
    return if tBegin.laterThan(taskEnd) or tEnd.earlierThan(taskBegin)
    tEnd = taskEnd if tEnd.laterThan taskEnd
    tBegin = taskBegin if tBegin.earlierThan taskBegin
    durationSecs -= tEnd.since(tBegin).seconds
    durationSecs = 0 if durationSecs < 0
    durationSecs is 0
  durationSecs

mergeExclusions = (exclusions = []) ->
  [exclusions, mergedExclusions] = [exclusions.slice(), []]
  while exclusions.length
    range = exclusions.shift()
    [rEnd, rBegin] = [new Time(range.end), new Time(range.beginning)]
    exclusions = exclusions.filter (t) ->
      [tEnd, tBegin] = [new Time(t.end), new Time(t.beginning)]
      return true if (tBegin.laterThan rEnd) or (tEnd.earlierThan rBegin)
      [rEnd, rBegin] = [Time.latest(tEnd, rEnd), Time.earlist(tBegin, rBegin)]
      false
    mergedExclusions.push {beginning: rBegin, end: rEnd}
  mergedExclusions

extractInclusions = (exclusions = [], inclusions = []) ->
  while inclusions.length
    [range, extracted] = [inclusions.shift(), []]
    [rE, rB] = [new Time(range.end), new Time(range.beginning)]
    exclusions = exclusions.filter (t) ->
      [tE, tB] = [new Time(t.end), new Time(t.beginning)]
      return true if (not tB.earlierThan rE) or (not tE.laterThan rB)
      return false if (not tB.earlierThan rB) and (not tE.laterThan rE)
      return t.end = rB if (tB.earlierThan rB) and (not tE.laterThan rE)
      return t.beginning = rE if (tE.laterThan rE) and (not tB.earlierThan rB)
      extracted.push beginning: tB, end: rB
      extracted.push beginning: rE, end: tE
      false
    exclusions = exclusions.concat extracted
  exclusions

devideSecs = (seconds) ->
  minutes = seconds / 60
  hours = minutes / 60
  days = hours / 24
  weeks = days / 7
  months = days / 30
  years = days / 365
  {years, months, weeks, days, hours, minutes, seconds}

duration = (task, secs, exceptExclusions = true) ->
  mustExist task
  [taskEnd, taskBegin] = [end(task), beginning(task)]
  exclusions = root(task).data.exclusions.slice() if exceptExclusions
  if exceptExclusions and root(task).data.excludeWeekends
    weekends = Time.devideByDay(taskBegin, taskEnd)
    .filter (d) -> d.beginning.isWeekend()
    exclusions = exclusions.concat weekends
  exclusions = extractInclusions exclusions, root(task).data.inclusions.slice()
  exclusions = mergeExclusions exclusions
  return devideSecs calcSecs(taskBegin, taskEnd, exclusions) unless secs
  return task if isRoot task
  unless Number.isInteger secs and secs > 0
    throw new Error "secs must be a positive integer"
  taskEnd = taskBegin.nextSecond secs
  effectedSecs = calcSecs taskBegin, taskEnd, exclusions
  while secs isnt effectedSecs
    taskEnd = taskEnd.nextSecond secs - effectedSecs
    effectedSecs = calcSecs taskBegin, taskEnd, exclusions
  end task, taskEnd
  devideSecs secs

Task.prototype.duration = (secs, exceptExclusions = true) ->
  return duration this, secs, exceptExclusions unless secs?
  @_pushUndoState => duration this, secs, exceptExclusions
  this



export {
  duration
  duration as default
}

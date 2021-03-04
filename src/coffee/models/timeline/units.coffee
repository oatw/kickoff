import {Time} from '../time/index.coffee'
import {Timeline, mustBeTimeline} from './timeline.coffee'
import {beginning} from './beginning.coffee'
import {end} from './end.coffee'



years = (timeline) ->
  mustBeTimeline timeline
  [beginTime, endTime] = [beginning(timeline), end(timeline)]
  Time.devideByYear(beginTime, endTime).map (year) ->
    Object.assign year, {
      unit: 'year'
      depth: 0
      label: year.beginning.year,
      inclusions: includedRanges(timeline, year),
      exclusions: excludedRanges(timeline, year),
      flags: flagsInRange(timeline, year)
    }

months = (timeline) ->
  mustBeTimeline timeline
  [year, units] = [-1, []]
  [beginTime, endTime] = [beginning(timeline), end(timeline)]
  for month in Time.devideByMonth beginTime, endTime
    unless year is month.beginning.year
      year = month.beginning.year
      units.push {
        unit: 'year', depth: 0, label: year, groups: [],
        beginning: month.beginning.beginningOfTheYear(),
        end: month.beginning.endOfTheYear()
      }
    units[units.length - 1].groups.push Object.assign(month, {
      unit: 'month', depth: 1, label: month.beginning.month,
      inclusions: includedRanges(timeline, month),
      exclusions: excludedRanges(timeline, month),
      flags: flagsInRange(timeline, month)
    })
  units

weeks = (timeline) ->
  mustBeTimeline timeline
  [year, units] = [-1, []]
  [beginTime, endTime] = [beginning(timeline), end(timeline)]
  splited = Time.devideByWeek beginTime, endTime
  for week, index in splited
    unless year is week.beginning.year
      year = week.beginning.year
      units.push {
        unit: 'year', depth: 0, label: year, groups: [],
        beginning: week.beginning.beginningOfTheYear(),
        end: week.beginning.endOfTheYear()
      }
    weekAssignments = {
      unit: 'week', depth: 1, label: week.beginning.weekOfTheYear()
    }
    unless week.beginning.year is week.end.year
      weekAssignments.end = week.beginning.endOfTheYear()
      splited.splice(index + 1, 0, {
        beginning: week.end.beginningOfTheYear()
        end: week.end
      })
    toBePushed = Object.assign(week, weekAssignments)
    toBePushed.inclusions = includedRanges(timeline, toBePushed)
    toBePushed.exclusions = excludedRanges(timeline, toBePushed)
    toBePushed.flags = flagsInRange(timeline, toBePushed)
    units[units.length - 1].groups.push toBePushed
  units

days = (timeline) ->
  mustBeTimeline timeline
  [monthLabel, units] = ['', []]
  [beginTime, endTime] = [beginning(timeline), end(timeline)]
  for day in Time.devideByDay beginTime, endTime
    _monthLabel = day.beginning.toString('{yyyy}-{mm}')
    unless monthLabel is _monthLabel
      monthLabel = _monthLabel
      units.push {
        unit: 'month', depth: 0, label: monthLabel, groups: [],
        beginning: day.beginning.beginningOfTheMonth(),
        end: day.beginning.endOfTheMonth()
      }
    units[units.length - 1].groups.push Object.assign(day, {
      unit: 'day', depth: 1, label: day.beginning.day,
      isWeekend: day.beginning.isWeekend(),
      inclusions: includedRanges(timeline, day),
      exclusions: excludedRanges(timeline, day),
      flags: flagsInRange(timeline, day)
    })
  units

hours = (timeline) ->
  mustBeTimeline timeline
  [dayLabel, units] = ['', []]
  [beginTime, endTime] = [beginning(timeline), end(timeline)]
  for hour in Time.devideByHour beginTime, endTime
    _dayLabel = hour.beginning.toString('{yyyy}-{mm}-{dd}')
    unless dayLabel is _dayLabel
      dayLabel = _dayLabel
      units.push {
        unit: 'day', depth: 0, label: dayLabel, groups: [],
        beginning: hour.beginning.beginningOfTheDay(),
        end: hour.beginning.endOfTheDay()
      }
    units[units.length - 1].groups.push Object.assign(hour, {
      unit: 'hour', depth: 1, label: hour.beginning.hours,
      inclusions: includedRanges(timeline, hour),
      exclusions: excludedRanges(timeline, hour),
      flags: flagsInRange(timeline, hour)
    })
  units

coincidentRanges = (rangeArr = [], range) ->
  coincidents = []
  rangeArr.forEach (t) ->
    [tBegin, tEnd] = [new Time(t.beginning), new Time(t.end)]
    return unless tBegin.earlierThan range.end
    return unless tEnd.laterThan range.beginning
    b = if tBegin.earlierThan range.beginning then range.beginning else tBegin
    e = if tEnd.laterThan range.end then range.end else tEnd
    coincidents.push beginning: b, end: e
  coincidents

includedRanges = (timeline, range) ->
  mustBeTimeline timeline
  coincidentRanges timeline._inclusions, range

excludedRanges = (timeline, range) ->
  mustBeTimeline timeline
  coincidentRanges timeline._exclusions, range

flagsInRange = (timeline, range) ->
  mustBeTimeline timeline
  timeline._flags.filter((t) ->
    return false if range.beginning.laterThan t.time
    return false if range.end.earlierThan t.time
    true
  ).map (flag) -> Object.assign {}, flag, {time: new Time flag.time}

Timeline.prototype.years = -> years this

Timeline.prototype.months = -> months this

Timeline.prototype.weeks = -> weeks this

Timeline.prototype.days = -> days this

Timeline.prototype.hours = -> hours this



export {
  years
  months
  weeks
  days
  hours
}

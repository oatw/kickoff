import {Time, mustBeNumber, mustBeValidCount} from './time.coffee'



Time.prototype.since = (date...) ->
  s = new Time date...
  s = new Date s.year, s.month - 1, s.day, s.hours, s.minutes, s.seconds
  current = new Date @year, @month - 1, @day, @hours, @minutes, @seconds
  seconds = (current - s) / 1000
  minutes = seconds / 60
  hours = minutes / 60
  days = hours / 24
  weeks = days / 7
  months = days / 30
  years = days / 365
  {years, months, days, hours, minutes, seconds, weeks}

Time.prototype.to = (date...) -> new Time(date...).since(this)

Time.prototype.calcYear = (count) ->
  mustBeNumber count
  new Time @year + count

Time.prototype.calcMonth = (count) ->
  mustBeNumber count
  new Time new Date(@year, @month - 1 + count)

Time.prototype.calcDay = (count) ->
  mustBeNumber count
  new Time new Date(@year, @month - 1, @day + count)

Time.prototype.calcHours = (count) ->
  mustBeNumber count
  new Time new Date(@year, @month - 1, @day, @hours + count)

Time.prototype.calcMinutes = (count) ->
  mustBeNumber count
  new Time new Date(@year, @month - 1, @day, @hours, @minutes + count)

Time.prototype.calcSeconds = (count) ->
  mustBeNumber count
  date = new Date(@year, @month - 1, @day, @hours, @minutes, @seconds + count)
  new Time date

Time.prototype.calcWeeks = (count) ->
  mustBeNumber count
  daysCount = Math.abs(count * 7)
  if count > 0 then @nextDay daysCount else @prevDay daysCount

addPrototypeMethods = (unit) ->
  s = if ['Hour', 'Minute', 'Second', 'Week'].includes(unit) then 's' else ''
  Time.prototype["prev#{unit}"] = (count = 1) ->
    mustBeValidCount count
    @["calc#{unit}#{s}"] -count
  Time.prototype["next#{unit}"] = (count = 1) ->
    mustBeValidCount count
    @["calc#{unit}#{s}"] count

for unit in ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second', 'Week']
  addPrototypeMethods unit

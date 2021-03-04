parseArguments = (date...) ->
  defaultDate = [new Date().getFullYear(), 1, 1, 0, 0, 0]
  if not date[0] or date[0] instanceof Date
    date = if date[0] then date[0] else new Date()
    return [
      date.getFullYear()
      date.getMonth() + 1
      date.getDate()
      date.getHours()
      date.getMinutes()
      date.getSeconds()
  ]
  if date[0] instanceof Time
    return (date[0][d] for d in [
      'year', 'month', 'day',
      'hours', 'minutes', 'seconds'
    ])
  if typeof date[0] is 'string' and date[0].length
    [date, time] = date[0].split(/\s+/)
    date = if date then date.split(/-|\//) else []
    time = if time then time.split(/:/) else []
    date.push 0 while date.length < 3
    time.push 0 while time.length < 3
    return date.concat(time).map (d, i) -> parseInt(d) or defaultDate[i]
  defaultDate.map (d, i) -> date[i] or d

mustBeValidYear = (year, silence) ->
  unless Number.isInteger(year) and year >= 1
    return false if silence
    throw new Error 'year must be an integer larger than 1'
  true

mustBeValidMonth = (month, silence) ->
  unless Number.isInteger(month) and 1 <= month <= 12
    return false if silence
    throw new Error 'month must be an integer between 1 to 12'
  true

mustBeValidDay = (year, month, day, silence) ->
  lastDay = Time.lastDayOfTheMonth year, month
  unless Number.isInteger(day) and 1 <= day <= lastDay
    return false if silence
    throw new Error "day must be an integer between 1 to #{lastDay}"
  true

mustBeValidHours = (hours, silence) ->
  unless Number.isInteger(hours) and 0 <= hours <= 23
    return false if silence
    throw new Error 'hours must be an integer between 0 and 23'
  true

mustBeValidMinutes = (minutes, _prefix = 'minutes', silence) ->
  unless Number.isInteger(minutes) and 0 <= minutes <= 59
    return false if silence
    throw new Error "#{_prefix} must be an integer between 0 and 59"
  true

mustBeValidSeconds = (seconds, silence) ->
  mustBeValidMinutes(seconds, 'seconds', silence)

mustBeValidCount = (count, silence) ->
  unless Number.isInteger(count) and count >= 0
    return false if silence
    throw new Error 'count must be a positive integer'
  true

mustBeNumber = (num, silence) ->
  unless typeof num is 'number'
    return false if silence
    throw new Error 'num must be a number'
  true



class Time

  constructor: (date...) ->
    [@year, @month, @day, @hours, @minutes, @seconds] = parseArguments date...
    mustBeValidYear @year
    mustBeValidMonth @month
    mustBeValidDay @year, @month, @day
    mustBeValidHours @hours
    mustBeValidMinutes @minutes
    mustBeValidSeconds @seconds



export {
  Time
  Time as default
  parseArguments
  mustBeValidYear
  mustBeValidMonth
  mustBeValidDay
  mustBeValidHours
  mustBeValidMinutes
  mustBeValidSeconds
  mustBeValidCount
  mustBeNumber
}

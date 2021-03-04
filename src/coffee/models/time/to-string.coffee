import {
  Time
  parseArguments
  mustBeValidYear
  mustBeValidMonth
  mustBeValidDay
  mustBeValidHours
  mustBeValidMinutes
  mustBeValidSeconds
} from './time.coffee'



double = (num) -> if num >= 10 then "#{num}" else "0#{num}"

toString = (time, format = '{yyyy}-{mm}-{dd} {HH}:{MM}:{SS}') ->
  unless Object.prototype.toString.call(time) is "[object Object]" \
  or time instanceof Time
    throw new Error 'time must be an object or an instance of Time'
  return format time if typeof format is 'function'
  mustBeValidYear time.year if 'year' of time
  mustBeValidMonth time.month if 'month' of time
  if 'day' of time and 'year' of time and 'month' of time
    mustBeValidDay time.year, time.month, time.day
  mustBeValidHours time.hours if 'hours' of time
  mustBeValidMinutes time.minutes if 'minutes' of time
  mustBeValidSeconds time.seconds if 'seconds' of time
  str = format.replace /\{yyyy\}/g, double(time.year)
  loopObj = {
    m: time.month or 1, d: time.day or 1,
    H: time.hours or 0, M: time.minutes or 0, S: time.seconds or 0
  }
  for placeholder, value of loopObj
    pattern = new RegExp "\\{#{placeholder}\\}", 'g'
    dbPattern = new RegExp "\\{#{placeholder}#{placeholder}\\}", 'g'
    str = str.replace dbPattern, double(value)
    str = str.replace pattern, value
  str.trim()

Time.toString = (time, format) -> toString time, format

Time.prototype.toString = (format) -> Time.toString this, format



export {
  toString
  toString as default
}

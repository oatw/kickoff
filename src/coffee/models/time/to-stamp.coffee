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



toStamp = (date...) ->
  [year, month, day, hours, minutes, seconds] = parseArguments date...
  mustBeValidYear year
  mustBeValidMonth month
  mustBeValidDay year, month, day
  mustBeValidHours hours
  mustBeValidMinutes minutes
  mustBeValidSeconds seconds
  new Date(year, month - 1, day, hours, minutes, seconds).getTime() / 1000

Time.toStamp = toStamp

Time.prototype.toStamp = -> Time.toStamp this



export {
  toStamp
  toStamp as default
}

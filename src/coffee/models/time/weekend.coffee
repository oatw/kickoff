import {
  Time
  parseArguments
  mustBeValidYear
  mustBeValidMonth
  mustBeValidDay
} from './time.coffee'
import {whatDay} from './what-day.coffee'



isWeekend = (year, month, day) ->
  mustBeValidYear year
  mustBeValidMonth month
  mustBeValidDay year, month, day
  [0, 6].includes whatDay(year, month, day)

Time.isWeekend = (date...) ->
  [year, month, day] = parseArguments date...
  isWeekend year, month, day

Time.isWeekday = (date...) -> not Time.isWeekend date...

Time.prototype.isWeekend = -> Time.isWeekend this

Time.prototype.isWeekday = -> not Time.isWeekend this



export {
  isWeekend
  isWeekend as default
}

import {
  Time
  parseArguments
  mustBeValidYear
  mustBeValidMonth
  mustBeValidDay
} from './time.coffee'



whatDay = (year, month, day) ->
  mustBeValidYear year
  mustBeValidMonth month
  mustBeValidDay year, month, day
  new Date(year, month - 1, day).getDay()

Time.whatDay = (date...) ->
  [year, month, day] = parseArguments date...
  whatDay year, month, day

Time.prototype.whatDay = -> Time.whatDay this



export {
  whatDay
  whatDay as default
}

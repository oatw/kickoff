import {Time, mustBeValidYear, parseArguments} from './time.coffee'



isLeapYear = (year) ->
  mustBeValidYear year
  return true if year % 400 is 0
  year % 4 is 0 and year % 100 isnt 0

Time.isLeapYear = (date...) ->
  [year] = parseArguments date...
  isLeapYear year

Time.prototype.isLeapYear = -> Time.isLeapYear this



export {
  isLeapYear
  isLeapYear as default
}

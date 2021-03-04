import {
  Time
  parseArguments
  mustBeValidYear
  mustBeValidMonth
} from './time.coffee'
import {isLeapYear} from './leap-year.coffee'



lastDayOfTheMonth = (year, month) ->
  mustBeValidYear year
  mustBeValidMonth month
  return 30 if [4, 6, 9, 11].includes month
  return 29 if month is 2 and isLeapYear year
  return 28 if month is 2 and not isLeapYear year
  31

Time.lastDayOfTheMonth = (date...) ->
  [year, month] = parseArguments date...
  lastDayOfTheMonth year, month

Time.prototype.lastDayOfTheMonth = -> Time.lastDayOfTheMonth this



export {
  lastDayOfTheMonth
  lastDayOfTheMonth as default
}

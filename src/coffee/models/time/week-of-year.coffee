import {
  Time
  parseArguments
  mustBeValidYear
  mustBeValidMonth
  mustBeValidDay
} from './time.coffee'
import {lastDayOfTheMonth} from './last-day.coffee'



weekOfTheYear = (year, month, day) ->
  mustBeValidYear year
  mustBeValidMonth month
  mustBeValidDay year, month, day
  firstDayWeekDay = new Date(year, 0, 1).getDay()
  firstWeekDaysCount = 7 - firstDayWeekDay
  return 1 if month is 1 and 1 <= day <= firstWeekDaysCount
  [m, daysCount] = [0, 0]
  daysCount += lastDayOfTheMonth(year, m) while (m += 1) < month
  daysCount += day
  1 + Math.ceil((daysCount - firstWeekDaysCount) / 7)

Time.weekOfTheYear = (date...) ->
  [year, month, day] = parseArguments date...
  weekOfTheYear year, month, day

Time.prototype.weekOfTheYear = -> Time.weekOfTheYear this



export {
  weekOfTheYear
  weekOfTheYear as default
}

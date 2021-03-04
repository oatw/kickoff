import {Time} from './time.coffee'
import './last-day.coffee'
import './what-day.coffee'
import './calc.coffee'



Time.prototype.beginningOfTheYear = -> new Time @year, 1, 1, 0, 0, 0

Time.prototype.endOfTheYear = -> new Time @year, 12, 31, 23, 59, 59

Time.prototype.beginningOfTheMonth = -> new Time @year, @month, 1, 0, 0, 0

Time.prototype.endOfTheMonth = ->
  new Time @year, @month, @lastDayOfTheMonth(), 23, 59, 59

Time.prototype.beginningOfTheDay = -> new Time @year, @month, @day, 0, 0, 0

Time.prototype.endOfTheDay = -> new Time @year, @month, @day, 23, 59, 59

Time.prototype.beginningOfTheHour = ->
  new Time @year, @month, @day, @hours, 0, 0

Time.prototype.endOfTheHour = -> new Time @year, @month, @day, @hours, 59, 59

Time.prototype.beginningOfTheWeek = -> @prevDay(@whatDay()).beginningOfTheDay()

Time.prototype.endOfTheWeek = -> @nextDay(6 - @whatDay()).endOfTheDay()

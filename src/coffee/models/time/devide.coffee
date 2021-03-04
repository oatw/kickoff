import {Time} from './time.coffee'
import './calc.coffee'



devideByUnit = (unit, ruleFn, beginning, end) ->
  [beginning, end, splited] = [new Time(beginning), new Time(end), []]
  while ruleFn beginning, end
    splited.push {
      beginning: beginning["beginningOfThe#{unit}"]()
      end: beginning["endOfThe#{unit}"]()
    }
    beginning = beginning["next#{unit}"]()
  splited

yearRuleFn = (beginning, end) ->
  new Date(
    end.year
  ) - new Date(
    beginning.year
  ) >= 0

monthRuleFn = (beginning, end) ->
  new Date(
    end.year,
    end.month - 1
  ) - new Date(
    beginning.year,
    beginning.month - 1
  ) >= 0

dayRuleFn = (beginning, end) ->
  new Date(
    end.year,
    end.month - 1,
    end.day
  ) - new Date(
    beginning.year,
    beginning.month - 1,
    beginning.day
  ) >= 0

hourRuleFn = (beginning, end) ->
  new Date(
    end.year,
    end.month - 1,
    end.day,
    end.hours
  ) - new Date(
    beginning.year,
    beginning.month - 1,
    beginning.day,
    beginning.hours
  ) >= 0

bindMethods = (unit, ruleFn) ->
  Time["devideBy#{unit}"] = (beginning, end) ->
    devideByUnit unit, ruleFn, beginning, end

ruleFns =
  Year: yearRuleFn
  Month: monthRuleFn
  Day: dayRuleFn
  Week: dayRuleFn
  Hour: hourRuleFn

bindMethods(unit, ruleFn) for unit, ruleFn of ruleFns

import {Time} from './time.coffee'
import {toStamp} from './to-stamp.coffee'



equals = (one, two) ->
  [one, two] = [new Time(one), new Time(two)]
  toStamp(one) is toStamp(two)

latest = (times...) ->
  return null unless times.length
  times = times.map (t) -> new Time t
  times.sort((a, b) -> toStamp(b) - toStamp(a))[0]

earlist = (times...) ->
  return null unless times.length
  times = times.map (t) -> new Time t
  times.sort((a, b) -> toStamp(a) - toStamp(b))[0]

Time.equals = equals

Time.latest = latest

Time.earlist = earlist

Time.prototype.equals = (time) -> Time.equals this, new Time(time)

Time.prototype.laterThan = (time) -> this.toStamp() > new Time(time).toStamp()

Time.prototype.earlierThan = (time) -> this.toStamp() < new Time(time).toStamp()



export {
  equals
  equals as default
}

import {Time} from './time.coffee'



methodNames = (unit = 'day') ->
  s = if ['hour', 'minute', 'second', 'week'].includes unit then 's' else ''
  {
    nextUnit: luda.camelCase "next-#{unit}"
    prevUnit: luda.camelCase "prev-#{unit}"
    beginningOfUnit: luda.camelCase "beginning-of-the-#{unit}"
    endOfUnit: luda.camelCase "end-of-the-#{unit}"
    calcUnit: luda.camelCase "calc-#{unit}#{s}"
    devideByUnit: luda.camelCase "devide-by-#{unit}"
  }

Time.methodNames = methodNames



export {
  methodNames,
  methodNames as default
}

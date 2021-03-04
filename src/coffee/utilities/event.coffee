class CustomEvent

  constructor: (target, event, detail = null, original = {}) ->
    {type} = parseEvent event
    @type = type
    @target = target
    @originalTarget = original.target or target
    @original = Object.assign {target: @originalTarget}, original
    @detail = detail
    @_stopped = false
    @_immediateStopped = false
    @_prevented = false

  stopImmediatePropagation: -> @_immediateStopped = true

  stopPropagation: -> @_stopped = true

  preventDefault: -> @_prevented = true

  isImmediatePropagationStopped: -> @_immediateStopped is true

  isPropagationStopped: -> @_stopped is true

  isDefaultPrevented: -> @_prevented is true


mustBeValidCallback = (callback) ->
  unless luda.isFunction callback
    throw new Error "Invalid callback: #{callback}"

parseEvent = (event = '') ->
  unless luda.isString(event) and event.trim().length
    throw new Error "Invalid event #{event}"
  splited = event.split '.'
  {type: splited[0], namespace: splited.slice 1}

nsMatches = (ns, definedNs) -> ns.every (n) -> definedNs.includes n



export {
  CustomEvent
  mustBeValidCallback
  parseEvent
  nsMatches
}

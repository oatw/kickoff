triggerDelay = 100
timestamp = null
triggered = false
target = null
hoverTarget = null
endTarget = null

reset = ->
  timestamp = null
  triggered = false
  target = null
  hoverTarget = null
  endTarget = null

createEvent = (name, originalEvent) ->
  props = ['screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY']
  event = new CustomEvent name,
    bubbles: true
    cancelable: true
    composed: true
  event.startTarget = target
  event.hoverTarget = hoverTarget
  event.endTarget = endTarget
  event[key] = originalEvent[key] for key in props
  event

mousedownHandler = (e) ->
  reset()
  return if e.isDefaultPrevented()
  target = e.target
  timestamp = Date.now()

mousemoveHandler = (e) ->
  return if e.isDefaultPrevented()
  if triggered
    hoverTarget = e.target
    return luda(target).trigger createEvent('dragging', e)
  return unless timestamp
  triggered = Date.now() - timestamp >= triggerDelay
  return reset() unless triggered
  ev = luda(target).trigger(createEvent('draggingstart', e), null, true)[0]
  return reset() if ev.isDefaultPrevented()
  mousemoveHandler e

mouseupHandler = (e) ->
  return reset() unless triggered
  return reset() if e.isDefaultPrevented()
  endTarget = e.target
  luda(target).trigger createEvent('draggingend', e)
  reset()

luda(document).on 'mousedown.simulateddrag', mousedownHandler
luda(document).on 'mousemove.simulateddrag', mousemoveHandler
luda(document).on 'mouseup.simulateddrag', mouseupHandler

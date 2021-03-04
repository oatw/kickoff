clientX = clientY = 0

luda.component 'kickoffProper'

.protect

  action: -> @root.data('proper-action') or 'hover'

.protect

  deferTime: 300

.protect

  viewPortDimensions: ->
    width: luda(window).innerWidth()
    height: luda(window).innerHeight()

  selfDimensions: ->
    @root.get(0).getBoundingClientRect()

  popoverDimensions: ->
    @popover.get(0).getBoundingClientRect()

.include

  activate: (event) ->
    return unless @popover.length
    return if @root.hasClass 'kickoff-proper-active'
    @root.addClass 'kickoff-proper-preactive'
    selfDimensions = @selfDimensions()
    popoverDimensions = @popoverDimensions()
    viewPortDimensions = @viewPortDimensions()
    maxLeft = viewPortDimensions.width - popoverDimensions.width
    maxTop = viewPortDimensions.height - popoverDimensions.height
    # left = event.clientX or selfDimensions.left
    left = clientX or selfDimensions.left
    top = selfDimensions.bottom
    if left > maxLeft
      @popover.addClass('kickoff-proper-popover-right').css {right: 0}
    else
      @popover.addClass('kickoff-proper-popover-left').css {left}
    if top > maxTop
      top = selfDimensions.top - popoverDimensions.height
      @popover.addClass('kickoff-proper-popover-top').css {top}
    else
      @popover.addClass('kickoff-proper-popover-bottom').css {top}
    @root.removeClass('kickoff-proper-preactive')
    .addClass 'kickoff-proper-active'

  deactivate: (event) ->
    return unless @popover.length
    return unless @root.hasClass 'kickoff-proper-active'
    @root.removeClass('kickoff-proper-active kickoff-proper-preactive')
    @popover.removeClass("kickoff-proper-popover-left kickoff-proper-popover-top
    kickoff-proper-popover-right kickoff-proper-popover-bottom")
    .removeCss('left').removeCss('top').removeCss('right')

  deferActivate: (event) ->
    clearTimeout @_defer
    @_defer = setTimeout (=> @activate event), @deferTime

  deferDeactivate: (event) ->
    clearTimeout @_defer
    @_defer = setTimeout (=> @deactivate event), @deferTime

.protect

  mouseupActivateForHoverAction: ->
    return unless @action() is 'hover'
    clearTimeout @_mousedownDeactivateDefer
    setTimeout (=> @root.removeClass 'kickoff-proper-tmp-hide'), @deferTime

  mousedownDeactivateForHoverAction: (event) ->
    return unless @action() is 'hover'
    return if event and event.eventPath().includes @popover.get(0)
    clearTimeout @_mousedownDeactivateDefer
    @root.addClass 'kickoff-proper-tmp-hide'

.help

  create: ->
    return unless @action() is 'focus'
    @root.attr('tabindex', 0) unless @root.attr('tabindex') >= 0

  destroy: ->
    clearTimeout @_defer
    @deactivate()
    @mousedownDeactivateForHoverAction()

  listen: ->
    [
      ['mouseenter focus', @deferActivate]
      ['mouseleave blur', @deferDeactivate]
      ['mousedown', @mousedownDeactivateForHoverAction]
      ['mouseup', @mouseupActivateForHoverAction]
      ['mousemove', (event) -> {clientX, clientY} = event]
      ['mousewheel', -> luda.kickoffProper().deactivate()]
    ]

  find: ->
    popover: '.kickoff-proper-popover'


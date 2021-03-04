luda.component 'kickoffModal'

.include

  activate: ->
    @root.addClass 'kickoff-modal-active'
    @root.trigger 'after-activate'

  deactivate: ->
    @root.removeClass 'kickoff-modal-active'
    @root.trigger 'after-deactivate'

  toggle: -> @root.toggleClas 'kickoff-modal-active'

.protect

  tryDeactivate: (event) ->
    return @deactivate() if event.eventPath().includes @closeButton.get(0)
    return if event.eventPath().includes @modalBody.get(0)
    @deactivate()

.help

  listen: ->
    [['click', @tryDeactivate]]

  find: ->
    modalBody: '.kickoff-modal-body'
    closeButton: '.kickoff-button-close-modal'

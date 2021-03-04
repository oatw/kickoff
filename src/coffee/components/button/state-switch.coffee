import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonsStateSwitch'

.protect modelable.all()

.protect localeable.all()

.protect

  template: ->
    uid = @model().uid
    "<button class='kickoff-button-state-undo' data-uid='#{uid}'>
      #{@l 'header.actions.undo'}
     </button>
     <button class='kickoff-button-state-redo' data-uid='#{uid}'>
      #{@l 'header.actions.redo'}
     </button>"

  setButtonsStates: ->
    canUndo = @model().stacks.undo.length > 0
    canRedo = @model().stacks.redo.length > 0
    @undoButton.attr 'disabled', if canUndo then null else ''
    @redoButton.attr 'disabled', if canRedo then null else ''

  undo: -> @model().undo()

  redo: -> @model().redo()

.help

  create: ->
    @root.html @template()
    @setButtonsStates()
    @model().on "after-update-state-stack.#{@id}", (event, detail) =>
      @setButtonsStates()

  listen: ->
    [
      ['click', '.kickoff-button-state-undo', @undo]
      ['click', '.kickoff-button-state-redo', @redo]
    ]

  find: ->
    undoButton: '.kickoff-button-state-undo'
    redoButton: '.kickoff-button-state-redo'

  destroy: ->
    @model().off "after-update-state-stack.#{@id}"

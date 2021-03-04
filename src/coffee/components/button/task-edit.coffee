import {capitalize} from '../../utilities/string.coffee'
import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonEditTask'

.protect modelable.all()

.protect localeable.all()

.protect

  edit: ->
    return if @model().isRoot()
    modal = luda(".kickoff-modal-edit-task[data-uid='#{@model().uid}']")
    unless modal.length
      kickoffSelector = ".kickoff[data-uid='#{@rootTask().uid}']"
      luda(kickoffSelector).append modal = @modalNode()
      form = modal.find '.kickoff-modal-task-form'
      closeModal = -> luda.kickoffModal(modal).deactivate()
      renderName = "render#{capitalize @model().type()}Form"
      return r(@model(), form.get(0), closeModal) if r = @config()[renderName]
      form.append @defaultFormNode()
    luda.kickoffModal(modal).activate()

  modalNode: ->
    return @_modalNode if @_modalNode
    node = luda "<div class='kickoff-modal kickoff-modal-edit-task'
      data-uid='#{@model().uid}'>
      <div class='kickoff-modal-body'>
        <button class='kickoff-button-close-modal'>
          <i class='kickoff-ico-cross'></i>
        </button>
        <div class='kickoff-modal-task-form'></div>
      </div>
    </div>"
    node.toggleClass 'is-milestone', @model().isMilestone()
    detail = {$form: node.find('.kickoff-modal-task-form').get 0}
    [oldState, newState] = [null, null]
    node.on "after-activate.#{@id}", =>
      clearTimeout @_isActivatingForm
      clearTimeout @_isDeactivatingForm
      @_isActivatingForm = setTimeout =>
        oldState = @model().pushUndoState()
        @model().stopTrackingHistory()
        @model().trigger 'after-activate-form', detail
    node.on "after-deactivate.#{@id}", =>
      clearTimeout @_isActivatingForm
      clearTimeout @_isDeactivatingForm
      @_isDeactivatingForm = setTimeout =>
        @model().trigger 'after-deactivate-form', detail
        @model().startTrackingHistory()
        newState = @model().pushUndoState()
        return @model().popUndoState() if newState
        @model().popUndoState() if oldState
    @_modalNode = node

  defaultFormNode: ->
    return @_defaultFormNode if @_defaultFormNode
    node = luda "<div class='kickoff-form' data-uid='#{@model().uid}'></div>"
    @_defaultFormNode = node

.help

  create: ->
    return unless @model()
    html = "<i class='kickoff-ico-edit'></i>"
    @root.html html
    @root.attr 'title', @l("task.actions.update#{capitalize @model().type()}")
    @model().on "after-destroy.#{@id}", (e) =>
      clearTimeout @_isActivatingForm
      clearTimeout @_isDeactivatingForm
      @modalNode().remove()

  listen: -> [['click', @edit]]

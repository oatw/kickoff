import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'
import {capitalize} from '../../utilities/string.coffee'



luda.component 'kickoffButtonDestroyTask'

.protect modelable.all()

.protect localeable.all()

.protect

  tasksToBeDestroied: ->
    @model().picked().filter (t) -> t.canBeDestroied()

  destroy: ->
    return @model().destroy() unless @model().isRoot()
    return unless (picked = @tasksToBeDestroied()).length
    @model().destroy picked...

  enableOrDisableButton: ->
    return @root.removeAttr 'disabled' if @tasksToBeDestroied().length
    @root.attr 'disabled', ''

.help

  create: ->
    return unless @model()
    if @model().isRoot()
      html = @l 'task.actions.destroyDescendants'
    else
      html = "<i class='kickoff-ico-delete'></i>"
    @root.html html
    title = @l "task.actions.destroy#{capitalize @model().type()}"
    @root.attr('title', title) unless @model().isRoot()
    return unless @model().isRoot()
    @enableOrDisableButton()
    @model().on "after-create.#{@id}", => @enableOrDisableButton()
    @model().on "after-update.#{@id}", (event, updated) =>
      @enableOrDisableButton() if 'isPicked' of updated
    @model().on "after-destroy.#{@id}", =>
      setTimeout => @enableOrDisableButton()

  listen: -> [['click', @destroy]]

import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonPickTask'

.protect modelable.all()

.protect localeable.all()

.protect

  render: ->
    if @model().isPicked
      title = @l 'task.actions.unpick'
      html = "<i class='kickoff-ico-minus'></i>"
      @root.addClass 'is-picked'
    else
      title = @l 'task.actions.pick'
      html = "<i class='kickoff-ico-plus'></i>"
      @root.removeClass 'is-picked'
    @root.attr('title', title).html html

.protect

  toggle: -> @model().pick not @model().isPicked

.help

  create: ->
    return unless model = @model()
    @render()
    @model().on "after-update.#{@id}", (event, updated) =>
      return unless event.target is @model()
      @render() if 'isPicked' of updated

  destroy: ->
    @model()?.off "after-update.#{@id}"

  listen: ->
    [['click', @toggle]]

import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonFoldTask'

.protect modelable.all()

.protect localeable.all()

.protect

  render: ->
    if @model().isFolded
      title = @l 'task.actions.unfold'
      html = "<i class='kickoff-ico-right'></i>"
      @root.addClass 'is-folded'
    else
      title = @l 'task.actions.fold'
      html = "<i class='kickoff-ico-down'></i>"
      @root.removeClass 'is-folded'
    @root.toggleClass('is-hidden', @model().children().length is 0)
    .attr('title', title).html html

.protect

  toggle: -> @model().fold not @model().isFolded

.help

  create: ->
    return unless model = @model()
    @render()
    model.on "after-create.#{@id}", (event) =>
      return if event.target is model
      @render()
    model.on "after-destroy.#{@id}", (event) =>
      return if event.target is model
      @render()
    model.on "after-update.#{@id}", (event, updated) =>
      return unless event.target is model
      @render() if 'isFolded' of updated

  destroy: ->
    clearTimeout @_isRendering
    @model()?.off "after-create.#{@id}"
    @model()?.off "after-update.#{@id}"

  listen: ->
    [['click', @toggle]]

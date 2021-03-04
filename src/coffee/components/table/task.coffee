import modelable from '../../mixins/modelable.coffee'
import {capitalize} from '../../utilities/string.coffee'
import {taskActions} from '../../models/task/task.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffTableTask'

.protect modelable.all()

.protect localeable.all()

.include

  render: ->
    clearTimeout @_rendering
    @_rendering = setTimeout =>
      return unless model = @model()
      @root.html @template()
      @setCls()
      @executeCustomRenderers()
      model.trigger 'after-render-in-table'

.protect

  template: ->
    model = @model()
    @config().tableColumns.map((column) =>
      {prop, render} = column
      dashedProp = luda.dashCase prop
      hasCustomRender = luda.isFunction render
      hasCustomRender ||= prop is 'actions' and @customRenderers().renderActions
      if hasCustomRender
        html = "<div class='with-custom-#{dashedProp}-renderer'></div>"
      else
        tplName = "#{prop}Template"
        html = if tplName of this then @[tplName](column) else model.data[prop]
        html = '' unless html?
      "<td data-prop='#{prop}'>#{html}</td>"
    ).join ''

  typeTemplate: (column = {}) ->
    @l "task.types.#{@model().data.type}"

  durationTemplate: (column = {}) ->
    dayCount = Math.round @model().duration().days
    "#{dayCount} #{@l 'task.durationUnits.day'}"

  predecessorsTemplate: (column = {}) ->
    @model().deps().map((depc) -> depc.data.wbs).join ', '

  successorsTemplate: (column = {}) ->
    @model().depd().map((depd) -> depd.data.wbs).join ', '

  actionsTemplate: (column = {}) ->
    [model, renderers] = [@model(), @customRenderers()]
    [uid, actions] = [model.uid, model.actions()]
    return '' unless actions.length
    customRendererSlot = (action) ->
      "<div class='with-custom-action-renderer-#{luda.dashCase action}'></div>"
    defaultRenderer = (action) ->
      if ['pick', 'fold', 'destroy'].includes action
        cls = "#{action}-task"
      else if action is 'update'
        cls = 'edit-task'
      else if ['createTask', 'createMilestone'].includes action
        cls = luda.dashCase action
      if cls
        "<button class='kickoff-button-#{cls}' data-uid='#{uid}'></button>"
      else
        customRendererSlot action
    html = ""
    for action in actions
      customRenderer = renderers["renderAction#{capitalize action}"]
      render = if customRenderer then customRendererSlot else defaultRenderer
      html += render action
    html

.protect

  setCls: ->
    oldHidden = Boolean @_isHidden
    @_isHidden = Boolean @model().isHidden
    @root.toggleClass 'is-picked', Boolean(@model().isPicked)
    @root.toggleClass 'is-milestone', @model().isMilestone()
    @root.toggleClass 'is-task', @model().isTask()
    @root.toggleClass 'is-folded', Boolean(@model().isFolded)
    @root.toggleClass 'is-hidden', @_isHidden
    return if oldHidden is @_isHidden
    @model().trigger 'after-toggle-in-table', @_isHidden

  customRenderers: ->
    [renderers, modelType] = [{}, capitalize(@model().type())]
    customActionsRenderer = @config()["renderTable#{modelType}Actions"]
    renderers.renderActions = customActionsRenderer if customActionsRenderer
    actionTypes = (action for action in @model().actions())
    for t in actionTypes
      cap = capitalize t
      configRendererName = "renderTable#{modelType}Action#{cap}"
      customRenderer = @config()[configRendererName]
      unless taskActions.includes t
        console.error "Custom action #{t} is defined, but #{configRendererName}
                      is not defined." unless customRenderer
      renderers["renderAction#{cap}"] = customRenderer if customRenderer
    renderers

  executeCustomRenderers: ->
    for column in @config().tableColumns
      {prop, render} = column
      if prop is 'actions'
        @executeCustomActionRenderers column
      else if render
        selector = ".with-custom-#{luda.dashCase prop}-renderer"
        container = @root.find(selector).get 0
        render.call @model(), @model(), container

  executeCustomActionRenderers: (column = {}) ->
    renderers = @customRenderers()
    renderActions = column.render or renderers.renderActions
    @root.toggleClass 'with-custom-actions-renderer', Boolean(renderActions)
    if renderActions
      return if @model().isHidden
      actionsContainer = @root.find('.with-custom-actions-renderer').get 0
      return renderActions.call @model(), @model(), actionsContainer
    for action in @model().actions()
      if renderAction = renderers["renderAction#{capitalize action}"]
        actionSlot = ".with-custom-action-renderer-#{luda.dashCase action}"
        actionContainer = @root.find(actionSlot).get(0)
        renderAction.call @model(), @model(), actionContainer

.help

  create: ->
    return unless model = @model()
    @render()
    model.on "after-update.#{@id}", (event, updated) =>
      @render() if model is event.target

  destroy: ->
    clearTimeout @_rendering
    @model()?.off "after-update.#{@id}"

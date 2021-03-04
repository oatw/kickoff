import modelable from '../../mixins/modelable.coffee'
import {capitalize} from '../../utilities/string.coffee'
import {rootTaskActions} from '../../models/task/task.coffee'



luda.component 'kickoffHeader'

.protect modelable.all()

.protect

  render: ->
    clearTimeout @_rendering
    @_rendering = setTimeout =>
      @root.html @template()
      @executeCustomActionsRenderer()
      @executeCustomNavigationsRenderer()

  customRenderers: ->
    [renderers, actions] = [{}, @model().actions()]
    for type in ['Actions', 'Navigations']
      renderer = @config()["renderHeader#{type}"]
      renderers["render#{type}"] = renderer if renderer
    for action in actions
      rendererName = "renderHeaderAction#{capitalize action}"
      renderer = @config()[rendererName]
      unless rootTaskActions.includes action
        console.error "Custom action #{action} is defined, but custom render
        #{rendererName} is not defined." unless renderer
      renderers["render#{capitalize action}"] = renderer if renderer
    renderers

  executeCustomActionsRenderer: ->
    renderers = @customRenderers()
    renderActions =  renderers.renderActions
    if renderActions
      actionsContainer = @root.find('.kickoff-header-actions').get 0
      return renderActions.call @model(), @model(), actionsContainer
    for action in @model().actions()
      if renderAction = renderers["render#{capitalize action}"]
        actionSlot = ".kickoff-header-actions
                     .with-custom-action-renderer-#{luda.dashCase action}"
        actionContainer = @root.find(actionSlot).get(0)
        renderAction.call @model(), @model(), actionContainer

  executeCustomNavigationsRenderer: ->
    {renderNavigations} = @customRenderers()
    return unless renderNavigations
    navigationsContainer = @root.find('.kickoff-header-navigations').get 0
    renderNavigations.call @model(), @model(), navigationsContainer

  template: ->
    "#{@actionsTemplate()}#{@navigationsTemplate()}"

  actionsTemplate: ->
    [uid, renderers] = [@model().uid, @customRenderers()]
    if renderers.renderActions
      return "<div class='kickoff-header-actions
              with-custom-actions-renderer'></div>"
    return '' unless (actions = @model().actions()).length
    customRendererSlot = (action) ->
      action = luda.dashCase action
      "<div class='with-custom-action-renderer-#{action}'></div>"
    defaultRenderer = (action) ->
      return "<div class='kickoff-buttons-state-switch'
             data-uid='#{uid}'></div>" if action is 'switchState'
      if action is 'destroyDescendants'
        cls = 'destroy-task'
      else if ['createTask', 'createMilestone'].includes action
        cls = luda.dashCase action
      return "<button class='kickoff-button-#{cls}'
             data-uid='#{uid}'></button>" if cls
      customRendererSlot action
    html = ""
    for action in actions
      customRenderer = renderers["render#{capitalize action}"]
      render = if customRenderer then customRendererSlot else defaultRenderer
      html += render action
    "<div class='kickoff-header-actions'>#{html}</div>"

  navigationsTemplate: ->
    [uid, renderers] = [@model().uid, @customRenderers()]
    if renderers.renderNavigations
      return "<div class='kickoff-header-navigations
              with-custom-navigations-renderer'></div>"
    tpl = "<div class='kickoff-header-navigations'>"
    if @config().renderGantt
      tpl += "<div class='kickoff-buttons-unit-zoom'
              data-uid='#{uid}'>
              </div>"
    if @config().renderTable and @config().renderGantt
      tpl += "<div class='kickoff-buttons-view-switch'
              data-uid='#{uid}'>
              </div>"
    tpl += "</div>"
    tpl

.help

  create: ->
    @render()
    @model().on "after-update.#{@id}", (event, updated) =>
      return unless event.target is @model()
      return unless updated.actions
      @render()

  destroy: ->
    clearTimeout @_rendering
    @model()?.off "after-update.#{@id}"

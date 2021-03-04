import modelable from '../../mixins/modelable.coffee'
import {capitalize} from '../../utilities/string.coffee'
import {taskActions} from '../../models/task/task.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffGanttTask'

.protect modelable.all()

.protect localeable.all()

.include

  render: ->
    clearTimeout @_rendering
    @_rendering = setTimeout =>
      return unless model = @model()
      unless @container.length
        @root.html '<div class="kickoff-gantt-task-content"></div>'
      @setCls()
      @container.html @template()
      @renderRange()
      @executeCustomGraphRenderer()
      @executeCustomActionsRenderer()
      @executeCustomLinkActionsRenderer()
      @executeCustomSummaryRenderer()
      model.trigger 'after-render-in-gantt'

  left: (pos) ->
    if pos?
      pos += @root.height() / 2 if @model().isMilestone()
      @model().beginning @pxToTime(pos)
      @render()
    else
      pos = @timeToPx @model().beginning()
      pos -= @root.height() / 2 if @model().isMilestone()
      pos

  right: (pos) ->
    if pos?
      pos -= @root.height() / 2 if @model().isMilestone()
      @model().end @pxToTime(pos)
      @render()
    else
      pos = @timeToPx @model().end()
      pos += @root.height() / 2 if @model().isMilestone()
      pos

  move: (pos) ->
    return unless pos
    @model().travel parseInt(pos / @pxPerSec(), 10)
    @render()

.protect

  pxPerSec: ->
    @root.width() / @timeline().duration().seconds

  pxToTime: (px) ->
    @timeline().beginning().nextSecond parseInt(px / @pxPerSec(), 10)

  timeToPx: (time) ->
    time.since(@timeline().beginning()).seconds * @pxPerSec()

.protect

  renderRange: ->
    [left, right] = [@left(), @right()]
    width = right - left
    @container.css {left, width}

  customRenderers: ->
    [renderers, modelType] = [{}, capitalize(@model().type())]
    rendererTypes = ['Graph', 'Actions', 'LinkActions', 'Summary']
    for t in rendererTypes
      customRenderer = @config()["renderGantt#{modelType}#{t}"]
      renderers["render#{t}"] = customRenderer if customRenderer
    actionTypes = (action for action in @model().actions())
    for t in actionTypes
      cap = capitalize t
      configRendererName = "renderGantt#{modelType}Action#{cap}"
      customRenderer = @config()[configRendererName]
      unless taskActions.includes t
        console.error "Custom action #{t} is defined, but #{configRendererName}
                      is not defined." unless customRenderer
      renderers["renderAction#{cap}"] = customRenderer if customRenderer
    renderers

  executeCustomGraphRenderer: ->
    {renderGraph} =  @customRenderers()
    @root.toggleClass 'with-custom-graph-renderer', Boolean(renderGraph)
    return unless renderGraph
    return if @model().isHidden
    graphContainer = @root.find('.kickoff-gantt-task-bar-body').get 0
    renderGraph.call @model(), @model(), graphContainer

  executeCustomActionsRenderer: ->
    renderers = @customRenderers()
    renderActions =  renderers.renderActions
    @root.toggleClass 'with-custom-actions-renderer', Boolean(renderActions)
    if renderActions
      return if @model().isHidden
      actionsContainer = @root.find('.kickoff-gantt-task-popover-actions').get 0
      return renderActions.call @model(), @model(), actionsContainer
    for action in @model().actions()
      if renderAction = renderers["renderAction#{capitalize action}"]
        actionSlot = ".kickoff-gantt-task-popover-actions
                     .with-custom-action-renderer-#{luda.dashCase action}"
        actionContainer = @root.find(actionSlot).get(0)
        renderAction.call @model(), @model(), actionContainer

  executeCustomLinkActionsRenderer: ->
    {renderLinkActions} =  @customRenderers()
    hasClass = Boolean renderLinkActions
    @root.toggleClass 'with-custom-link-actions-renderer', hasClass
    return unless renderLinkActions
    return if @model().isHidden
    selector = '.kickoff-gantt-task-popover-link-actions'
    actionsContainer = @root.find(selector).get 0
    renderLinkActions.call @model(), @model(), actionsContainer

  executeCustomSummaryRenderer: ->
    {renderSummary} =  @customRenderers()
    @root.toggleClass 'with-custom-summary-renderer', Boolean(renderSummary)
    return unless renderSummary
    return if @model().isHidden
    summaryContainer = @root.find('.kickoff-gantt-task-popover-summary').get 0
    renderSummary.call @model(), @model(), summaryContainer

.protect

  dragDimensions: (event) ->
    @dragStartLeft = @left() unless 'dragStartLeft' of this
    @dragStartRight = @right() unless 'dragStartRight' of this
    @dragStartX = event.screenX unless 'dragStartX' of this
    {
      startLeft: @dragStartLeft, startRight: @dragStartRight,
      startX: @dragStartX, startWidth: @dragStartRight - @dragStartLeft,
      distance: event.screenX - @dragStartX
    }

  resetDragDimensions: ->
    delete @dragStartLeft
    delete @dragStartRight
    delete @dragStartX

  previewTravel: (event) ->
    return if luda(event.target).hasClass 'is-readonly'
    {startLeft, distance} = @dragDimensions event
    @container.css 'left', startLeft + distance
    @model().trigger 'after-range-in-gantt'

  travel: (event) ->
    return if luda(event.target).hasClass 'is-readonly'
    @move @dragDimensions(event).distance
    @resetDragDimensions()

  previewBegin: (event) ->
    {startWidth, startLeft, distance} = @dragDimensions event
    @container.css {width: startWidth - distance, left: startLeft + distance}
    @model().trigger 'after-range-in-gantt'

  setBegin: (event) ->
    {startLeft, distance} = @dragDimensions event
    @left startLeft + distance
    @resetDragDimensions()

  previewEnd: (event) ->
    {startWidth, distance} = @dragDimensions event
    @container.css 'width', startWidth + distance
    @model().trigger 'after-range-in-gantt'

  setEnd: (event) ->
    {startRight, distance} = @dragDimensions event
    @right startRight + distance
    @resetDragDimensions()

.protect

  linkNode: -> luda ".kickoff-gantt-link[data-uid='#{@model().uid}']"

  previewLinkFrom: (type, to) ->
    successorsPropIsReadonly = @model().readonly 'successors'
    @con._isLinkingFrom = {task: @model(), type}
    point = if type is 'finish' then @linksEnd else @linksBeginning
    point.addClass 'is-linking'
    cursorCls = if successorsPropIsReadonly then 'is-invalid' else 'is-valid'
    point.addClass cursorCls
    @linksContainer.addClass 'is-linking'
    luda.kickoffGanttLink(@linkNode()).preview type, to

  resetPreviewLinkFrom: ->
    return unless @rootTask()?
    luda.kickoffGanttLink(@linkNode()).resetPreview()
    @linksEnd.removeClass 'is-linking is-valid is-invalid'
    @linksBeginning.removeClass 'is-linking is-valid is-invalid'
    @linksContainer.removeClass 'is-linking'
    delete @con._isLinkingFrom

  previewLinkFromStart: (event) ->
    @previewLinkFrom 'start', {pageX: event.pageX, pageY: event.pageY}

  previewLinkFromFinish: (event) ->
    @previewLinkFrom 'finish', {pageX: event.pageX, pageY: event.pageY}

  previewLinkTo: (type) ->
    return unless from = @con._isLinkingFrom
    predecessorsPropIsReadonly = @model().readonly 'predecessors'
    @con._isLinkingTo = {task: @model(), type}
    return if from.task is @model()
    point = if type is 'finish' then @linksEnd else @linksBeginning
    point.addClass 'is-linking'
    return if point.hasClass 'is-valid'
    return if point.hasClass 'is-invalid'
    if predecessorsPropIsReadonly
      isValid = false
    else
      isValid = @con._isLinkingFrom.task.isValidDepcOf @con._isLinkingTo.task
    cursorCls = if isValid then 'is-valid' else 'is-invalid'
    point.addClass cursorCls

  previewLinkToStart: (event) -> @previewLinkTo 'start'

  previewLinkToFinish: (event) -> @previewLinkTo 'finish'

  resetPreviewLinkTo: ->
    return unless to = @con._isLinkingTo
    selector = ".kickoff-gantt-task[data-uid='#{to.task.uid}']
          .kickoff-gantt-task-links *"
    @root.parent('.kickoff-gantt-tasks').find(selector)
    .removeClass 'is-linking is-valid is-invalid'
    delete @con._isLinkingTo

  addLink: ->
    return unless from = @con._isLinkingFrom
    return @resetPreviewLinkFrom() if from.task.readonly 'successors'
    @resetPreviewLinkFrom()
    return unless to = @con._isLinkingTo
    return @resetPreviewLinkTo() if to.task.readonly 'predecessors'
    type = luda.camelCase("#{from.type}-to-#{to.type}")
    to.task.addPredecessors type, from.task
    @resetPreviewLinkTo()

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
    @model().trigger 'after-toggle-in-gantt', @_isHidden

  closeProper: ->
    luda.kickoffProper(@proper).deactivate()

.protect

  template: ->
    "<label class='kickoff-gantt-task-label'>#{@labelTemplate()}</label>
    <div class='kickoff-gantt-task-bar kickoff-proper'>#{@barTemplate()}</div>
    <div class='kickoff-gantt-task-links'>#{@linkPointsTemplate()}</div>"

  labelTemplate: ->
    name = @model().data.name
    name = '' unless name?
    "#{@model().data.wbs} #{name}"

  barTemplate: ->
    model = @model()
    [html, isTask] = ['', model.isTask()]
    if isTask and not model.readonly 'beginning'
      html += "<div class='kickoff-gantt-task-bar-beginning'></div>"
    bodyCls = 'kickoff-gantt-task-bar-body'
    if model.readonly('beginning') or model.readonly('end')
      bodyCls += ' is-readonly'
    html += "<div class='#{bodyCls}'></div>"
    if isTask and not model.readonly 'end'
      html += "<div class='kickoff-gantt-task-bar-end'></div>"
    html += "<div class='kickoff-proper-popover kickoff-gantt-task-popover'>
      #{@popoverTemplate()}
    </div>"

  linkPointsTemplate: ->
    "<div class='kickoff-gantt-task-links-beginning'></div>
    <div class='kickoff-gantt-task-links-end'></div>"

  popoverTemplate: ->
    html = ''
    {renderActions, renderLinkActions, renderSummary} = @customRenderers()
    if renderActions
      html += "<div class='kickoff-gantt-task-popover-actions'></div>"
    else
      html += @popoverActionsTemplate()
    if renderLinkActions
      html += "<div class='kickoff-gantt-task-popover-link-actions'></div>"
    else
      html += @popoverLinkActionsTemplate()
    if renderSummary
      html += "<div class='kickoff-gantt-task-popover-summary'></div>"
    else
      html += @popoverSummaryTemplate()
    html

  popoverActionsTemplate: ->
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
    "<div class='kickoff-gantt-task-popover-actions'>#{html}</div>"

  popoverLinkActionsTemplate: ->
    [html, model] = ["", @model()]
    [uid, linkButtons] = [model.uid, {s2s: '', s2f: '', f2f: '', f2s: ''}]
    deps = model.deps()
    return '' if deps.length is 0 or model.readonly 'predecessors'
    deps.forEach (depc) ->
      key = model.depcType(depc).shortcut
      disabled = if depc.readonly 'successors' then 'disabled' else ''
      linkButtons[key] += "<button class='kickoff-button-destroy-link'
                           data-uid='#{uid}'
                           data-from='#{depc.uid}' #{disabled}>
                           </button>"
    html += fragment for type, fragment of linkButtons
    "<div class='kickoff-gantt-task-popover-link-actions'>#{html}</div>"

  popoverSummaryTemplate: ->
    html = "<h6 class='kickoff-gantt-task-popover-summary-title'>
              #{@labelTemplate()}
            </h6>"
    if @model().isMilestone()
      html += "<p class='kickoff-gantt-task-popover-summary-item'>
                 <span>#{@l 'task.props.time'}:</span>
                 <span>#{@model().data.end}</span>
               </p>"
    else
      dayCount = Math.round @model().duration().days
      html += "<p class='kickoff-gantt-task-popover-summary-item'>
                 <span>#{@l 'task.props.beginning'}:</span>
                 <span>#{@model().data.beginning}</span>
               </p>
               <p class='kickoff-gantt-task-popover-summary-item'>
                 <span>#{@l 'task.props.end'}:</span>
                 <span>#{@model().data.end}</span>
               </p>
               <p class='kickoff-gantt-task-popover-summary-item'>
                 <span>#{@l 'task.props.duration'}:</span>
                 <span>
                   #{dayCount}
                   #{@l 'task.durationUnits.day'}
                 </span>
               </p>"
    "<div class='kickoff-gantt-task-popover-summary'>#{html}</div>"

.help

  create: ->
    return unless model = @model()
    @render()
    model.on "after-touch.#{@id}", (event, touched) =>
      return unless model is event.target
      @render() if 'beginning' of touched or 'end' of touched
    model.on "after-update.#{@id}", (event, updated) =>
      return unless model is event.target
      ks = Object.keys updated
      if ks.length is 1 and ks[0] is 'isPicked'
        return @setCls()
      if ks.some (k) -> k in ['wbs', 'name', 'beginning', 'end', 'isHidden']
        return @render()
      @setCls()
      @popover.html @popoverTemplate()
      @executeCustomGraphRenderer()
      @executeCustomActionsRenderer()
      @executeCustomLinkActionsRenderer()
      @executeCustomSummaryRenderer()
      model.trigger 'after-render-in-gantt'

  destroy: ->
    clearTimeout @_rendering
    @resetPreviewLinkTo()
    @resetPreviewLinkFrom()
    @model()?.off "after-touch.#{@id}"
    @model()?.off "after-update.#{@id}"

  listen: ->
    [
      ['dragging', '.kickoff-gantt-task-bar-body', @previewTravel]
      ['draggingend', '.kickoff-gantt-task-bar-body', @travel]
      ['dragging', '.kickoff-gantt-task-bar-beginning', @previewBegin]
      ['draggingend', '.kickoff-gantt-task-bar-beginning', @setBegin]
      ['dragging', '.kickoff-gantt-task-bar-end', @previewEnd]
      ['draggingend', '.kickoff-gantt-task-bar-end', @setEnd]
      ['dragging', '.kickoff-gantt-task-links-beginning', @previewLinkFromStart]
      ['draggingend', '.kickoff-gantt-task-links-beginning', @addLink]
      ['dragging', '.kickoff-gantt-task-links-end', @previewLinkFromFinish]
      ['draggingend', '.kickoff-gantt-task-links-end', @addLink]
      ['mouseenter', '.kickoff-gantt-task-links-beginning', @previewLinkToStart]
      ['mouseleave', '.kickoff-gantt-task-links-beginning', @resetPreviewLinkTo]
      ['mouseenter', '.kickoff-gantt-task-links-end', @previewLinkToFinish]
      ['mouseleave', '.kickoff-gantt-task-links-end', @resetPreviewLinkTo]
      ['click', '.kickoff-button-edit-task', @closeProper]
    ]

  find: ->
    container: '.kickoff-gantt-task-content'
    linksContainer: '.kickoff-gantt-task-links'
    linksBeginning: '.kickoff-gantt-task-links-beginning'
    linksEnd: '.kickoff-gantt-task-links-end'
    proper: '.kickoff-proper'
    popover: '.kickoff-gantt-task-popover'

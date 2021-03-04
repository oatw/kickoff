import modelable from '../../mixins/modelable.coffee'



luda.component 'kickoffGanttTimeline'

.protect modelable.all()

.protect

  foregroundTemplate: (groups) ->
    html = ""
    return html unless groups and groups.length
    for group in groups
      cls  = "kickoff-gantt-timeline-#{group.unit} "
      cls += "kickoff-gantt-timeline-depth#{group.depth} "
      cls += "kickoff-gantt-timeline-weekend " if group.isWeekend
      cls += "kickoff-gantt-timeline-cell " unless group.groups
      html += "<div class='#{cls}'>"
      html += "<div class='kickoff-gantt-timeline-label'>#{group.label}</div>"
      if group.groups
        html += "<div class='kickoff-gantt-timeline-group'>"
        html += @foregroundTemplate group.groups
        html += "</div>"
      else
        html += @exclusionTemplate group
        html += @inclusionTemplate group
        html += @foregroundFlagTemplate group
      html += "</div>"
    html

  backgroundTemplate: (groups) ->
    html = ""
    return html unless groups and groups.length
    for group in groups
      if group.groups
        html += @backgroundTemplate group.groups
      else
        cls  = "kickoff-gantt-timeline-cell "
        cls += "kickoff-gantt-timeline-#{group.unit} "
        cls += "kickoff-gantt-timeline-weekend " if group.isWeekend
        html += "<div class='#{cls}'>"
        html += @exclusionTemplate group
        html += @inclusionTemplate group
        html += @backgroundFlagTemplate group
        html += "</div>"
    html

  specialDurationTemplate: (cell, type = 'exclusion') ->
    return '' unless (cells = cell["#{type}s"]).length
    [cellB, cellE] = [cell.beginning, cell.end]
    totalSeconds = cell.end.since(cell.beginning).seconds
    cells.map((t) ->
      style = "width:#{t.end.since(t.beginning).seconds / totalSeconds * 100}%;"
      if t.end.equals cell.end
        style += "right:0"
      else
        left = t.beginning.since(cell.beginning).seconds / totalSeconds
        style += "left:#{left * 100}%"
      cls  = "kickoff-gantt-timeline-#{type} "
      cls += "kickoff-gantt-timeline-#{type}-left " if t.beginning.equals cellB
      cls += "kickoff-gantt-timeline-#{type}-right " if t.end.equals cellE
      "<div class='#{cls}' style='#{style}'></div>"
    ).join ''

  inclusionTemplate: (cell) ->
    @specialDurationTemplate cell, 'inclusion'

  exclusionTemplate: (cell) ->
    @specialDurationTemplate cell, 'exclusion'

  foregroundFlagTemplate: (cell) ->
    return '' unless cell.flags.length
    totalSeconds = cell.end.since(cell.beginning).seconds
    cell.flags.map((flag) ->
      left = flag.time.since(cell.beginning).seconds / totalSeconds
      style = "left:#{left * 100}%"
      cls  = "kickoff-gantt-timeline-flag-label "
      cls += flag.cls if flag.cls
      "<label class='#{cls}' style='#{style}'>#{flag.label or 'FLAG'}</label>"
    ).join ''

  backgroundFlagTemplate: (cell) ->
    return '' unless cell.flags.length
    totalSeconds = cell.end.since(cell.beginning).seconds
    cell.flags.map((flag) ->
      left = flag.time.since(cell.beginning).seconds / totalSeconds
      style = "left:#{left * 100}%"
      cls  = "kickoff-gantt-timeline-flag-line "
      cls += flag.cls if flag.cls
      "<div class='#{cls}' style='#{style}'></div>"
    ).join ''

.protect

  ensureOccupyFullWidth: ->
    timelineWidth = @root.outerWidth()
    ganttWidth = @root.parent('.kickoff-gantt').width()
    return true if timelineWidth >= ganttWidth
    duration = @timeline().duration().seconds
    pxPerSec = timelineWidth / duration
    leastDuration = ganttWidth / pxPerSec
    @timeline().duration Math.ceil(leastDuration)
    false

  renderForeground: (groups) ->
    @root.html @foregroundTemplate(groups)

  renderBackground: (groups) ->
    uid = @rootTask().uid
    [cls, dataAttr] = ['kickoff-gantt-timeline-background', "data-uid='#{uid}'"]
    unless (background = luda ".#{cls}[#{dataAttr}]").length
      @root.before background = luda "<div class='#{cls}' #{dataAttr}>"
    background.html(@backgroundTemplate groups)

.protect

  ensureResizeDetectorExist: ->
    return @resizeDetector if @resizeDetector
    uid = @rootTask().uid
    [cls, dataAttr] = [
      "kickoff-gantt-timeline-resize-detector"
      "data-uid='#{uid}'"
    ]
    unless (detector = luda ".#{cls}[#{dataAttr}]").length
      @root.before detector = luda "<iframe class='#{cls}' #{dataAttr}>"
    @resizeDetector = detector.get(0).contentWindow

  listenResize: ->
    @stopListeningResize()
    detector = @ensureResizeDetectorExist()
    @lastRenderWidth = detector.innerWidth
    @resizeRender = (->
      clearTimeout @_resizeRendering
      @_resizeRendering = setTimeout (=>
        currentWidth = detector.innerWidth
        return if currentWidth <= @lastRenderWidth
        @lastRenderWidth = currentWidth
        @render()
      ), @config().resizeRenderDelay
    ).bind this
    detector.addEventListener 'resize', @resizeRender

  stopListeningResize: ->
    @ensureResizeDetectorExist()?.removeEventListener 'resize', @resizeRender
    @resizeRender = null

  render: ->
    clearTimeout @_rendering
    @_rendering = setTimeout =>
      unit = @timeline().unit()
      groups = @timeline()["#{unit}s"]()
      @renderForeground groups
      @renderBackground groups
      return unless @ensureOccupyFullWidth()
      @listenResize()
      @timeline().trigger 'after-render'

.help

  create: ->
    @timeline().on "after-update.#{@id}", (event, updated) =>
      @render()
    @render()

  destroy: ->
    clearTimeout @_rendering
    clearTimeout @_resizeRendering
    @stopListeningResize()
    @timeline()?.off "after-update.#{@id}"

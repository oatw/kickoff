import modelable from '../../mixins/modelable.coffee'



luda.component 'kickoffGanttLink'

.protect modelable.all()

.protect

  arrowWidth: 8
  arrowHeight: 8

.include

  render: ->
    clearTimeout @_rendering
    @_rendering = setTimeout =>
      return unless @model()
      return unless @findTaskContentDom(@model()).length
      [lines, shouldKeep] = [@findLineDoms(), luda()]
      ['s2s', 'f2f', 's2f', 'f2s'].forEach (type) =>
        @model()["#{type}Deps"]().forEach (depc) =>
          isExisted = (line = lines.filter "[data-uid='#{depc.uid}']").length
          @root.append(line = @lineDom depc) unless isExisted
          shouldKeep = shouldKeep.add line
          polyline = line.children 'polyline'
          drawLine = ->
            clearTimeout @_showingLine
            shouldHide = Boolean depc.isHidden
            shouldHide ||= not linePoints = @points type, depc
            return line.addClass 'is-hidden' if shouldHide
            polyline.attr 'points', linePoints
            @_showingLine = setTimeout (-> line.removeClass 'is-hidden'), 50
          return drawLine.call this if isExisted
          drawLine.call this if @findTaskContentDom(depc).length
          depc.on "after-render-in-gantt.#{@id}", drawLine.bind(this)
          depc.on "after-range-in-gantt.#{@id}", drawLine.bind(this)
      lines.not(shouldKeep).remove().each (line) =>
        return unless depc = @rootTask().find luda(line).data('uid')
        depc.off "after-render-in-gantt.#{@id}"
        depc.off "after-range-in-gantt.#{@id}"

  preview: (type, to) ->
    dict = {start: 'Beginning', finish: 'End'}
    pointDom = @["findTaskLinks#{dict[type]}Dom"] @model()
    {left, top} = pointDom.offset()
    rootPos = @root.offset()
    left = left - rootPos.left + pointDom.outerWidth() / 2
    top = top - rootPos.top + pointDom.outerHeight() / 2
    points = [[left, top], [to.pageX - rootPos.left, to.pageY - rootPos.top]]
    points = points.concat points.slice().reverse()
    points = points.map((arr) -> arr.join ' ').join ','
    isExisted = (line = @findPreviewLineDom()).length
    @root.prepend(line = @previewLineDom()) unless isExisted
    line.addClass('is-previewing').children('polyline').attr 'points', points

  resetPreview: ->
    @findPreviewLineDom().removeClass 'is-previewing'

.protect

  lineDom: (depc) ->
    luda "<svg class='kickoff-gantt-link-line' data-uid='#{depc.uid}'>
          <polyline />
          </svg>"

  previewLineDom: ->
    luda '<svg class="kickoff-gantt-link-preview-line"><polyline /></svg>'

  findLineDom: (depc) ->
    @root.find ".kickoff-gantt-link-line[data-uid='#{depc.uid}']"

  findLineDoms: -> @root.children '.kickoff-gantt-link-line'

  findTaskDom: (task) -> luda(".kickoff-gantt-task[data-uid='#{task.uid}']")

  findTaskContentDom: (task) ->
    @findTaskDom(task).find '.kickoff-gantt-task-content'

  findPreviewLineDom: ->
    @root.find '.kickoff-gantt-link-preview-line'

  findTaskLinksBeginningDom: (task) ->
    @findTaskDom(task).find '.kickoff-gantt-task-links-beginning'

  findTaskLinksEndDom: (task) ->
    @findTaskDom(task).find '.kickoff-gantt-task-links-end'

.protect

  points: (type, depc) ->
    @["#{type}Polyline"](depc).map((arr) -> arr.join ' ').join ','

  s2sPolyline: (depc) ->
    [from, to] = [@position(depc), @position(@model())]
    return [] unless from and to
    minXWidth = @timelineCellWidth() / 2
    arrow = @arrowRightPoints to
    x1 = Math.min from.left, to.left
    [from, to, exchanged] = [to, from, true] unless from.left is x1
    y1 = from.top
    [x2, y2] = [x1 - minXWidth, y1]
    [x4, y4] = [to.left, to.top]
    [x3, y3] = [x2, y4]
    points = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    return points.concat arrow, points.slice().reverse() unless exchanged
    points.concat points.slice().reverse(), arrow

  f2fPolyline: (depc) ->
    [from, to] = [@position(depc), @position(@model())]
    return [] unless from and to
    minXWidth = @timelineCellWidth() / 2
    arrow = @arrowLeftPoints to
    x1 = Math.max from.right, to.right
    [from, to, exchanged] = [to, from, true] unless from.right is x1
    y1 = from.top
    [x2, y2] = [x1 + minXWidth, y1]
    [x4, y4] = [to.right, to.top]
    [x3, y3] = [x2, y4]
    points = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    return points.concat arrow, points.slice().reverse() unless exchanged
    points.concat points.slice().reverse(), arrow

  s2fPolyline: (depc) ->
    [from, to] = [@position(depc), @position(@model())]
    return [] unless from and to
    minXWidth = @timelineCellWidth() / 2
    arrow = @arrowLeftPoints to
    if to.right + minXWidth > from.left - minXWidth
      [x1, y1] = [from.left, from.top]
      [x2, y2] = [x1 - minXWidth, y1]
      [x6, y6] = [to.right, to.top]
      [x5, y5] = [x6 + minXWidth, y6]
      [x3, x4] = [x2, x5]
      rowGap = @findTaskDom(@model()).outerHeight() / 2
      y3 = y4 = if y1 < y6 then y5 - rowGap else y5 + rowGap
      line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x5, y5], [x6, y6]]
    else
      [x1, y1] = [from.left, from.top]
      [x4, y4] = [to.right, to.top]
      [x3, y3] = [x4 + minXWidth, y4]
      [x2, y2] = [x3, y1]
      line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    line.concat arrow, line.slice().reverse()

  f2sPolyline: (depc) ->
    [from, to] = [@position(depc), @position(@model())]
    return [] unless from and to
    minXWidth = @timelineCellWidth() / 2
    arrow = @arrowRightPoints to
    if from.right + minXWidth > to.left - minXWidth
      [x1, y1] = [from.right, from.top]
      [x2, y2] = [x1 + minXWidth, y1]
      [x6, y6] = [to.left, to.top]
      [x5, y5] = [x6 - minXWidth, y6]
      [x3, x4] = [x2, x5]
      rowGap = @findTaskDom(@model()).outerHeight() / 2
      y3 = y4 = if y1 < y6 then y5 - rowGap else y5 + rowGap
      line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x5, y5], [x6, y6]]
    else
      [x1, y1] = [from.right, from.top]
      [x4, y4] = [to.left, to.top]
      [x3, y3] = [x4 - minXWidth, y4]
      [x2, y2] = [x3, y1]
      line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    line.concat arrow, line.slice().reverse()

  arrowRightPoints: (to) ->
    arrowX = to.left - @arrowWidth
    [arrowT, arrowB] = [to.top + @arrowHeight / 2, to.top - @arrowHeight / 2]
    [[arrowX, arrowT], [arrowX, arrowB], [to.left, to.top]]

  arrowLeftPoints: (to) ->
    arrowX = to.right + @arrowWidth
    [arrowT, arrowB] = [to.top + @arrowHeight / 2, to.top - @arrowHeight / 2]
    [[arrowX, arrowT], [arrowX, arrowB], [to.right, to.top]]

  position: (model) ->
    node = @findTaskContentDom model
    return unless node.length
    width = luda(node).outerWidth()
    height = luda(node).outerHeight()
    {left, top} = luda(node).position()
    {left, top: top + height / 2, right: left + width}

  timelineCellWidth: ->
    s = ".kickoff-gantt-timeline-background[data-uid='#{@rootTask().uid}']
    .kickoff-gantt-timeline-cell"
    luda(s).outerWidth()

.help

  create: ->
    return unless model = @model()
    @render()
    @model().on "after-render-in-gantt.#{@id}", (event) =>
      @render() if @model() is event.target
    @model().on "after-range-in-gantt.#{@id}", (event) =>
      @render() if @model() is event.target

  destroy: ->
    clearTimeout @_rendering
    clearTimeout @_showingLine
    @model()?.off "after-render-in-gantt.#{@id}"
    @model()?.off "after-range-in-gantt.#{@id}"
    @model()?.deps().forEach (depc) =>
      depc.off "after-render-in-gantt.#{@id}"
      depc.off "after-range-in-gantt.#{@id}"

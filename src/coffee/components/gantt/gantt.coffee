import Time from '../../models/time/index.coffee'
import Task from '../../models/task/index.coffee'
import modelable from '../../mixins/modelable.coffee'



luda.component 'kickoffGantt'

.protect modelable.all()

.protect

  ascTasks: ->
    Task.asc @rootTask().descendants()...

  adjustTimelineRange: (mode) ->
    @timeline().fit(
      @rootTask().beginning() or new Time(),
      @rootTask().end() or new Time(),
      mode
    )

.protect

  template: ->
    "<div class='kickoff-gantt-timeline' data-uid='#{@rootTask().uid}'></div>
    <div class='kickoff-gantt-links' data-uid='#{@rootTask().uid}'></div>
    <div class='kickoff-gantt-tasks' data-uid='#{@rootTask().uid}'></div>"

  render: -> @root.html @template()

.protect

  linkTemplate: (task) ->
    "<div class='kickoff-gantt-link' data-uid='#{task.uid}'></div>"

  findLinkDom: (task) ->
    @linksContainerDom.find ".kickoff-gantt-link[data-uid='#{task.uid}']"

  findLinkDoms: (tasks) ->
    s = tasks.map (task) -> ".kickoff-gantt-link[data-uid='#{task.uid}']"
    @linksContainerDom.children s.join(',')

  refreshLinkDomSiblings: (task) ->
    ascTasks = @ascTasks()
    i = ascTasks.indexOf task
    return if i is ascTasks.length - 1
    [prevs, nexts] = [ascTasks.slice(0, i), ascTasks.slice(i + 1)]
    prevs = prevs.filter (t) -> t.deps().some (d) -> nexts.includes d
    luda.kickoffGanttLink(@findLinkDoms prevs.concat(nexts)).render()

  insertLinkDom: (task) ->
    return luda.kickoffGanttLink(d).render() if (d = @findLinkDom task).length
    @linksContainerDom.append @linkTemplate(task)
    @refreshLinkDomSiblings task

  removeLinkDom: (task) ->
    @refreshLinkDomSiblings task
    @findLinkDom(task).remove()

  insertLinkDoms: ->
    @linksContainerDom.html @ascTasks().map((t) => @linkTemplate t).join('')

.protect

  taskTemplate: (task) ->
    "<div class='kickoff-gantt-task' data-uid='#{task.uid}'></div>"

  findTaskDom: (task) ->
    @tasksContainerDom.find ".kickoff-gantt-task[data-uid='#{task.uid}']"

  insertTaskDom: (task) ->
    return luda.kickoffGanttTask(d).render() if (d = @findTaskDom task).length
    prev = task.prevSibling()
    prev = prevLastChd if prev and prevLastChd = prev.lastChild()
    prev ||= task.parent()
    task.one "after-render-in-gantt.#{@id}", =>
      node = @findTaskDom(task).find('.kickoff-gantt-task-content').get 0
      if node.scrollIntoViewIfNeeded
        node.scrollIntoViewIfNeeded()
      else
        node.scrollIntoView()
    return @findTaskDom(prev).after @taskTemplate(task) if prev
    @tasksContainerDom.prepend @taskTemplate(task)

  removeTaskDom: (task) -> @findTaskDom(task).remove()

  insertTaskDoms: ->
    @tasksContainerDom.html @ascTasks().map((t) => @taskTemplate t).join('')

.help

  create: ->
    @adjustTimelineRange()
    @rootTask().on "after-create.#{@id}", (event) =>
      return if event.target.isRoot()
      return if @adjustTimelineRange('grow') or @_reinserting?
      @insertLinkDom event.target
      @insertTaskDom event.target
    @rootTask().on "after-destroy.#{@id}", (event) =>
      return if event.target.isRoot()
      @removeTaskDom event.target
      @removeLinkDom event.target
    @rootTask().on "after-update.#{@id}", (event) =>
      return if event.target.isRoot()
      return if @adjustTimelineRange 'grow'
    @rootTask().on "after-toggle-in-gantt.#{@id}", (event) =>
      @refreshLinkDomSiblings event.target
    @timeline().on "after-update.#{@id}", (event) =>
      event.stopImmediatePropagation() if @adjustTimelineRange()
    @timeline().on "after-render.#{@id}", (event) =>
      clearTimeout @_reinserting
      @_reinserting = setTimeout =>
        @insertLinkDoms()
        @insertTaskDoms()
        @_reinserting = null
    @render()

  destroy: ->
    clearTimeout @_reinserting
    @rootTask()?.off "after-create.#{@id}"
    @rootTask()?.off "after-destroy.#{@id}"
    @rootTask()?.off "after-update.#{@id}"
    @rootTask()?.off "after-toggle-in-gantt.#{@id}"
    @timeline()?.off "after-update.#{@id}"
    @timeline()?.off "after-render.#{@id}"

  find: ->
    tasksContainerDom: '.kickoff-gantt-tasks'
    linksContainerDom: '.kickoff-gantt-links'

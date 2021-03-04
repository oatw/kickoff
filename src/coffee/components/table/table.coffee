import Task from '../../models/task/index.coffee'
import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'
import {capitalize} from '../../utilities/string.coffee'



luda.component 'kickoffTable'

.protect modelable.all()

.protect localeable.all()

.protect

  ascTasks: ->
    Task.asc @rootTask().descendants()...

.protect

  template: ->
    "<table class='kickoff-table-content'>
      #{@headTemplate()}#{@bodyTemplate()}
    </table>"

  headTemplate: ->
    titles = ''
    for column in @config().tableColumns
      if 'title' of column
        titleText = column.title
      else
        titleText = @l("task.props.#{column.prop}") or capitalize(column.prop)
      titles += "<th>#{titleText}</th>"
    "<thead class='kickoff-table-header' data-uid='#{@rootTask().uid}'>
      <tr class='kickoff-table-header-row'>#{titles}</tr>
     </thead>"

  bodyTemplate: ->
    "<tbody class='kickoff-table-tasks' data-uid='#{@rootTask().uid}'></tbody>"

  taskTemplate: (task) ->
    "<tr class='kickoff-table-task' data-uid='#{task.uid}'></tr>"

  render: ->
    @root.html @template()
    @insertTaskDoms()

.protect

  tasksContainerDom: -> @root.find '.kickoff-table-tasks'

  findTaskDom: (task) ->
    @tasksContainerDom().find ".kickoff-table-task[data-uid='#{task.uid}']"

  insertTaskDom: (task) ->
    return luda.kickoffTableTask(d).render() if (d = @findTaskDom task).length
    task.one "after-render-in-table.#{@id}", =>
      node = @findTaskDom(task).get 0
      if node.scrollIntoViewIfNeeded
        node.scrollIntoViewIfNeeded()
      else
        node.scrollIntoView()
    rowIndex = @ascTasks().indexOf task
    taskRow = luda @tasksContainerDom().get(0).insertRow(rowIndex)
    taskRow.prop 'outerHTML', @taskTemplate(task)

  removeTaskDom: (task) -> @findTaskDom(task).remove()

  insertTaskDoms: ->
    @tasksContainerDom().html @ascTasks().map((t) => @taskTemplate t).join('')

.help

  create: ->
    @rootTask().on "after-create.#{@id}", (event) =>
      return if event.target.isRoot()
      @insertTaskDom event.target
    @rootTask().on "after-destroy.#{@id}", (event) =>
      return if event.target.isRoot()
      @removeTaskDom event.target
    @render()

  destroy: ->
    @rootTask()?.off "after-create.#{@id}"
    @rootTask()?.off "after-destroy.#{@id}"

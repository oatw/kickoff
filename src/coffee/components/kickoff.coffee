import Time from '../models/time/index.coffee'
import Task from '../models/task/index.coffee'
import Timeline from '../models/timeline/index.coffee'
import store from '../models/store.coffee'



class Kickoff

  constructor: (conf = {}, tasks = []) ->
    @node = luda conf.target
    unless @node.length
      throw new Error "No HTML element detected by: #{conf.target}"
    if @node.length > 1
      console.warn "Models are shared among multiple kickoff components"
    if @node.hasClass 'kickoff'
      {root, timeline, config} = store.relations(@node.data 'uid')
      [@task, @timeline, @config] = [root, timeline, config]
      console.warn "The kickoff instance being constructed has already been
      initialized. You don't have to construct it again.
      If you need rerender it, use the `render` method. For reconfiguring,
      use the `configure` method.
      If it's really necessary to reconstruct the instance, please call the
      `destroy` method first, then construct a new instance."
      return this
    conf = @configure conf, true
    @task = Task.create conf.task
    @task.create tasks...
    @task.popUndoState() if tasks.length
    @timeline = Timeline.create conf.timeline
    store.create @task, @timeline, @config
    @render()

  render: ->
    tpl = "<main class='kickoff-main' data-uid='#{@task.uid}'>"
    if @config.renderHeader
      tpl += "<header class='kickoff-header' data-uid='#{@task.uid}'></header>"
    if @config.renderGantt
      tpl += "<div class='kickoff-gantt' data-uid='#{@task.uid}'></div>"
    if @config.renderTable
      tpl += "<div class='kickoff-table' data-uid='#{@task.uid}'></div>"
    tpl += "</main>"
    rootCls = 'kickoff'
    if @config.renderTable and not @config.renderGantt
      rootCls += ' view-switch-to-table'
    @node.addClass(rootCls).data('uid', @task.uid).html tpl
    this

  configure: (conf = {}, _returnSplited) ->
    delete conf.uid
    isCreated = @task and @timeline
    return this if isCreated and Object.keys(conf).length is 0
    @config = {uid: luda.guid()} unless isCreated
    Object.assign(
      @config,
      (taskConf = @_taskConf conf),
      (timelineConf = @_timelineConf conf),
      (uiConf = @_uiConf conf)
    )
    splitedReturnValue = {task: taskConf, timeline: timelineConf, ui: uiConf}
    unless isCreated
      return if _returnSplited then splitedReturnValue else this
    @node.html ''
    @task.update taskConf
    @timeline.update timelineConf
    @render()
    if _returnSplited then splitedReturnValue else this

  destroy: ->
    uid = @task.uid
    @node.html('').removeClass('kickoff').data('uid', null)
    store.destroy uid
    delete @[key] for key of this

  _taskConf: (conf = {}) ->
    config = {
      exclusions: []
      excludeWeekends: true
      inclusions: []
      minDurationSeconds: 3600 * 24 - 1
      maxHistorySize: Infinity
      actions: [
        'createTask', 'createMilestone', 'destroyDescendants', 'switchState'
      ]
    }
    @_mergeConf config, conf
    config

  _timelineConf: (conf = {}) ->
    config = {
      exclusions: []
      excludeWeekends: true
      inclusions: []
      flags: []
    }
    @_mergeConf config, conf
    config

  _uiConf: (conf = {}) ->
    config =
      resizeRenderDelay: 1000
      renderHeader: true
      renderHeaderActions: null
      renderHeaderNavigations: null
      renderHeaderActionCreateTask: null
      renderHeaderActionCreateMilestone: null
      renderHeaderActionDestroyDescendants: null
      renderHeaderActionSwitchState: null
      enableGanttAccurateTimeOperations: true
      renderGantt: true
      renderGanttTaskGraph: null
      renderGanttTaskSummary: null
      renderGanttTaskActions: null
      renderGanttTaskActionPick: null
      renderGanttTaskActionFold: null
      renderGanttTaskActionUpdate: null
      renderGanttTaskActionDestroy: null
      renderGanttTaskActionCreateTask: null
      renderGanttTaskActionCreateMilestone: null
      renderGanttTaskLinkActions: null
      renderGanttMilestoneGraph: null
      renderGanttMilestoneSummary: null
      renderGanttMilestoneActions: null
      renderGanttMilestoneActionPick: null
      renderGanttMilestoneActionUpdate: null
      renderGanttMilestoneActionDestroy: null
      renderGanttMilestoneLinkActions: null
      tableColumns: [
        {prop: 'actions', render: null}
        {prop: 'wbs', render: null}
        {prop: 'type', render: null}
        {prop: 'name', render: null}
        {prop: 'beginning', render: null}
        {prop: 'end', render: null}
        {prop: 'duration', render: null}
        {prop: 'predecessors', render: null}
        {prop: 'successors', render: null}
      ]
      renderTable: true
      renderTableTaskActions: null
      renderTableTaskActionPick: null
      renderTableTaskActionFold: null
      renderTableTaskActionUpdate: null
      renderTableTaskActionDestroy: null
      renderTableTaskActionCreateTask: null
      renderTableTaskActionCreateMilestone: null
      renderTableMilestoneActions: null
      renderTableMilestoneActionPick: null
      renderTableMilestoneActionUpdate: null
      renderTableMilestoneActionDestroy: null
      # If the render property is defined:
      # 1. If the data type of the filed value need be converted,
      #    the convertion should be fullfilled by the custom render.
      # 2. The options property of a select type editor is ignored.
      # else
      # 1. Field value type convertion can be automatically fullfiled according
      #    to the type property and enum value types of the options property
      # 2. The options property of a select type editor can be an array
      #    or a function with a param named 'use' which is a function will be
      #    called to fill the select options.
      renderTaskForm: null
      renderMilestoneForm: null
      formFields: [
        {
          prop: 'wbs', type: 'text',
          placeholder: 'E.g., 1.1', render: null
        }
        {
          prop: 'name', type: 'text',
          placeholder: 'E.g., A New Task', render: null
        }
        {
          prop: 'beginning', type: 'time',
          placeholder: 'E.g., 2020/01/01', render: null
        }
        {
          prop: 'end', type: 'time',
          placeholder: 'E.g., 2020/01/02', render: null
        }
        {
          prop: 'predecessors', render: null,
          fields: [{
            prop: 'predecessors.startToStart',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 1, 2', render: null
          }, {
            prop: 'predecessors.startToFinish',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 3, 4', render: null
          }, {
            prop: 'predecessors.finishToFinish',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 5, 6', render: null
          }, {
            prop: 'predecessors.finishToStart',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 7, 8', render: null
          }]
        }
        {
          prop: 'successors', render: null,
          fields: [{
            prop: 'successors.startToStart',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 1, 2', render: null
          }, {
            prop: 'successors.startToFinish',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 3, 4', render: null
          }, {
            prop: 'successors.finishToFinish',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 5, 6', render: null
          }, {
            prop: 'successors.finishToStart',
            type: 'select', multiple: true, options: [],
            placeholder: 'E.g., 7, 8', render: null
          }]
        }
      ]
      locale:
        header:
          actions:
            undo: 'Undo'
            redo: 'Redo'
          navigations:
            zoomIn: 'Zoom In'
            zoomOut: 'Zoom Out'
            zoomUnits:
              year: 'Year'
              month: 'Month'
              week: 'Week'
              day: 'Day'
              hour: 'Hour'
            chartView: 'Chart View'
            tableView: 'Table View'
        task:
          types:
            task: 'Task'
            milestone: 'Milestone'
          actions:
            createTask: 'New Task'
            createMilestone: 'New Milestone'
            destroyDescendants: 'Destroy Items'
            createSubTask: 'Create a sub task'
            createSubMilestone: 'Create a sub milestone'
            updateTask: 'Edit this task'
            updateMilestone: 'Edit this milestone'
            destroyTask: 'Destroy this task'
            destroyMilestone: 'Destroy this milestone'
            pick: 'Pick this item'
            unpick: 'Unpick this item'
            fold: 'Fold descendants'
            unfold: 'Unfold descendants'
          props:
            wbs: 'Wbs'
            name: 'Name'
            type: 'Type'
            beginning: 'Beginning'
            end: 'End'
            time: 'Time'
            duration: 'Duration'
            predecessors:
              $: 'Predecessors'
              startToStart: 'Start to Start'
              startToFinish: 'Start to Finish'
              finishToFinish: 'Finish to Finish'
              finishToStart: 'Finish to Start'
            successors:
              $: 'Successors'
              startToStart: 'Start to Start'
              startToFinish: 'Start to Finish'
              finishToFinish: 'Finish to Finish'
              finishToStart: 'Finish to Start'
            actions: 'Actions'
            readonlyProps: 'Readonly Properties'
          durationUnits:
            year: 'years'
            month: 'months'
            week: 'weeks'
            day: 'days'
            hour: 'hours'
        timePicker:
          whatDay:
            sun: 'Sun'
            mon: 'Mon'
            thu: 'Thu'
            wes: 'Wes'
            thr: 'Thr'
            fri: 'Fri'
            sat: 'Sat'
    modelConfKeys = Object.keys(
      @_taskConf()
    ).concat(
      Object.keys @_timelineConf()
    )
    for key, val of conf
      config[key] = val unless key is 'locale' or modelConfKeys.includes key
    @_mergeLocaleConf config.locale, conf.locale
    config

  _mergeLocaleConf: (defaultConf, custom) ->
    return defaultConf unless custom
    for key, val of defaultConf
      if typeof val is 'string'
        defaultConf[key] = custom[key] if key of custom
      else
        @_mergeLocaleConf defaultConf[key], custom[key]
    for key, val of custom
      defaultConf[key] = custom[key] unless key of defaultConf

  _mergeConf: (defaultConf, custom) ->
    for key of defaultConf
      defaultConf[key] = custom[key] if key of custom



kickoff = (args...) -> new Kickoff args...

[['time', Time]].forEach (item) ->
  [name, Con] = [item[0], item[1]]
  kickoff[name] = (args...) -> new Con args...
  for key, val of Con
    kickoff[name][key] = if typeof val is 'function' then val.bind Con else val

kickoff.asc = Task.asc
kickoff.desc = Task.desc



export default window.kickoff ||= kickoff

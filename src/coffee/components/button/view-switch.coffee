import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonsViewSwitch'

.protect modelable.all()

.protect localeable.all()

.include

  view: (type = 'gantt') ->
    luda(".kickoff[data-uid='#{@rootTask().uid}']")
    .toggleClass 'view-switch-to-table', type is 'table'
    @setButtonsStates type

.protect

  template: ->
    "<button class='kickoff-button-view-gantt'>
       #{@l 'header.navigations.chartView'}
     </button>
     <button class='kickoff-button-view-table'>
       #{@l 'header.navigations.tableView'}
     </button>"

  setGanttView: -> @view 'gantt'

  setTableView: -> @view 'table'

  setButtonsStates: (viewType) ->
    if viewType is 'gantt'
      @viewGanttButton.attr 'disabled', ''
      @viewTableButton.removeAttr 'disabled'
    else
      @viewGanttButton.removeAttr 'disabled'
      @viewTableButton.attr 'disabled', ''

.help

  create: ->
    @root.html @template()
    @view 'gantt'

  listen: ->
    [
      ['click', '.kickoff-button-view-gantt', @setGanttView]
      ['click', '.kickoff-button-view-table', @setTableView]
    ]

  find: ->
    viewGanttButton: '.kickoff-button-view-gantt'
    viewTableButton: '.kickoff-button-view-table'

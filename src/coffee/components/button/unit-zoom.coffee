import './view-switch.coffee'
import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonsUnitZoom'

.protect modelable.all()

.protect localeable.all()

.protect

  template: ->
    "<button class='kickoff-button-unit-zoom-in'>
       #{@l 'header.navigations.zoomIn'}
     </button>
     <span class='kickoff-buttons-unit-zoom-current'></span>
     <button class='kickoff-button-unit-zoom-out'>
      #{@l 'header.navigations.zoomOut'}
     </button>"

.protect

  unitState: ->
    current = @timeline().unit()
    all = @timeline().avaliableUnits()
    index = all.indexOf current
    zoomInAble = index isnt 0
    zoomOutAble = index isnt all.length - 1
    {current, all, index, zoomInAble, zoomOutAble}

  zoomIn: ->
    @ensureGanttView()
    {zoomInAble, index, all} = @unitState()
    @timeline().unit all[index - 1] if zoomInAble

  zoomOut: ->
    @ensureGanttView()
    {zoomOutAble, index, all} = @unitState()
    @timeline().unit all[index + 1] if zoomOutAble

  setButtonsStates: ->
    {zoomInAble, zoomOutAble} = @unitState()
    @zoomInButton.attr 'disabled', if zoomInAble then null else ''
    @zoomOutButton.attr 'disabled', if zoomOutAble then null else ''

  setCurrentUnitText: ->
    unit = @timeline().unit()
    @unitText.text @l("header.navigations.zoomUnits.#{unit}") or unit

  ensureGanttView: ->
    selector = ".kickoff-buttons-view-switch[data-uid='#{@rootTask().uid}']"
    switcher = luda(selector)
    return unless switcher.length
    luda.kickoffButtonsViewSwitch(switcher).view 'gantt'

.help

  create: ->
    @root.html @template()
    @setCurrentUnitText()
    @timeline().on "after-update.#{@id}", (event) =>
      @setCurrentUnitText()
      @setButtonsStates()

  destroy: ->
    @timeline()?.off "after-update.#{@id}"

  listen: ->
    [
      ['click', '.kickoff-button-unit-zoom-in', @zoomIn]
      ['click', '.kickoff-button-unit-zoom-out', @zoomOut]
    ]

  find: ->
    zoomInButton: '.kickoff-button-unit-zoom-in'
    zoomOutButton: '.kickoff-button-unit-zoom-out'
    unitText: '.kickoff-buttons-unit-zoom-current'

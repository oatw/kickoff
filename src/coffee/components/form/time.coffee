import modelable from '../../mixins/modelable.coffee'
import inputable from '../../mixins/inputable.coffee'
import localeable from '../../mixins/localeable.coffee'
import Time from '../../models/time/index.coffee'



luda.component 'kickoffFormTime'

.protect modelable.all()

.protect localeable.all()

.protect inputable.except(
  'inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue',
  'setInputValue', 'toggleInputReadonly'
)

.include

  showDropdown: -> @dropdown.removeClass 'is-hidden'

  hideDropdown: -> @dropdown.addClass 'is-hidden'

  toggleDropdown: (hide) -> @dropdown.toggleClass 'is-hidden', hide

.protect

  inputCls: 'kickoff-form-time-input'

  errorMarkerCls: 'kickoff-form-time-selected-label'

  inputTemplate: ->
    placeholder = @fieldConfig.placeholder or ''
    "<div class='kickoff-form-time-simulated'>
      <input class='kickoff-form-time-selected-label'
      readonly placeholder='#{placeholder}' data-auto='false'/>
      <div class='kickoff-form-time-dropdown is-hidden'>
        <div class='kickoff-form-time-dropdown-header'>
          <button class='kickoff-button-form-time-ctrl-prev-month'>
            <i class='kickoff-ico-left'></i>
          </button>
          <label class='kickoff-form-time-header-label'></label>
          <button class='kickoff-button-form-time-ctrl-next-month'>
            <i class='kickoff-ico-right'></i>
          </button>
        </div>
        <table class='kickoff-form-time-month'>
          <thead><tr>
            <th>#{@l 'timePicker.whatDay.sun'}</th>
            <th>#{@l 'timePicker.whatDay.mon'}</th>
            <th>#{@l 'timePicker.whatDay.thu'}</th>
            <th>#{@l 'timePicker.whatDay.wes'}</th>
            <th>#{@l 'timePicker.whatDay.thr'}</th>
            <th>#{@l 'timePicker.whatDay.fri'}</th>
            <th>#{@l 'timePicker.whatDay.sat'}</th>
          </tr></thead>
          <tbody class='kickoff-form-time-month-dates'></tbody>
        </table>
      </div>
    </div>"

  renderMonth: (time) ->
    clearTimeout @_isRenderingMonth
    @_isRenderingMonth = setTimeout =>
      prop = @fieldConfig.prop
      selected = new Time @getModelValue()
      [model, time] = [@model(), new Time(time or selected)]
      [monthB, monthE] = [time.beginningOfTheMonth(), time.endOfTheMonth()]
      monthDates = Time.devideByDay monthB, monthE
      firstDateWeekday = monthDates[0].beginning.whatDay()
      lastDateWeekday = monthDates[monthDates.length - 1].beginning.whatDay()
      monthDates.unshift null while (firstDateWeekday -= 1) >= 0
      monthDates.push null while (lastDateWeekday += 1) <= 6
      [datesHtml = '', monthLabel = time.toString('{yyyy}/{mm}')]
      monthDates.forEach (date, index) ->
        datesHtml += '<tr>' if index % 7 is 0
        datesHtml += '<td>'
        if date
          value = date.beginning.toString()
          label = date.beginning.toString '{yyyy}/{mm}/{dd}'
          checked = selected.beginningOfTheDay().equals date.beginning
          checkedAttr = if checked then 'checked' else ''
          datesHtml += "<label class='kickoff-form-time-date' data-auto='false'>
            <input class='kickoff-form-time-input' #{checkedAttr}
            name='kickoff_task_#{model.uid}_#{prop}' type='radio'
            value='#{value}' data-auto='false' data-prop='#{prop}'
            data-label='#{label}' />
            <span class='kickoff-form-time-input-label'>
              #{date.beginning.toString '{dd}'}
            </span>
          </label>"
        datesHtml += '</td>'
        datesHtml += '</tr>' if index % 7 is 6
      @headerLabel.html monthLabel
      @dates.html datesHtml
      @_renderedMonth = time

  renderPrevMonth: -> @renderMonth @_renderedMonth.prevMonth()

  renderNextMonth: -> @renderMonth @_renderedMonth.nextMonth()

  toggleInputReadonly: ->
    {prop, topLevelProp} = @fieldConfig
    model = @model()
    propIsReadonly = model.readonly(topLevelProp) or model.readonly(prop)
    @setInputValue() if propIsReadonly
    val = if propIsReadonly then '' else null
    @simulatedInput.toggleClass 'is-readonly', propIsReadonly
    @input.attr 'disabled', val
    @date.attr 'readonly', val

  setInputValue: -> @renderMonth @getModelValue()

  getInputValue: -> @input.filter(':checked').val()

  setInputValueWhenNoError: ->
    @setSimulatedInputValue()
    return if @model().error @fieldConfig.prop
    @setInputValue()

  setSimulatedInputValue: ->
    return unless (checkedInput = @input.filter ':checked').length
    @simulatedInput.val checkedInput.data('label')

  toggleDropdownHandler: (event) ->
    {prop, topLevelProp} = @fieldConfig
    return if @model().readonly(topLevelProp) or @model().readonly(prop)
    if event.type is 'focusin'
      @showDropdown()
    else if event.type is 'change'
      @hideDropdown()

  toggleDropdownBySimulatedInputHandler: (event) ->
    {prop, topLevelProp} = @fieldConfig
    return if @model().readonly(topLevelProp) or @model().readonly(prop)
    if event.type is 'focusin'
      isHidden = @dropdown.hasClass 'is-hidden'
      @showDropdown()
      @_handledByFocusin = isHidden
    else if event.type is 'click'
      @toggleDropdown() unless @_handledByFocusin
      delete @_handledByFocusin

.help

  create: -> @creator()

  destroy: -> @destroyer()

  listen: ->
    @listener().concat([
      ['click', '.kickoff-button-form-time-ctrl-next-month', @renderNextMonth]
      ['click', '.kickoff-button-form-time-ctrl-prev-month', @renderPrevMonth]
      ['change', '.kickoff-form-time-input', @setInputValueWhenNoError]
      ['focusin change', '.kickoff-form-time-input', @toggleDropdownHandler]
      [
        'focusin click',
        '.kickoff-form-time-selected-label',
        @toggleDropdownBySimulatedInputHandler
      ]
      [
        'focusin click', (e) ->
          focusedTime = null
          e.eventPath().some (element) ->
            if luda(element).is '.kickoff-form-time'
              focusedTime = element
              return true
          targets = luda('.kickoff-form-time').not(focusedTime)
          luda.kickoffFormTime(targets).hideDropdown()
      ]
    ])

  watch: ->
    node: [
      ['.kickoff-form-time-input', @setSimulatedInputValue]
    ]

  find: ->
    Object.assign @finder(), {
      simulatedInput: '.kickoff-form-time-selected-label'
      dropdown: '.kickoff-form-time-dropdown'
      date: '.kickoff-form-time-date'
      headerLabel: '.kickoff-form-time-header-label'
      dates: '.kickoff-form-time-month-dates'
    }

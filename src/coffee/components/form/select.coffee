import modelable from '../../mixins/modelable.coffee'
import inputable from '../../mixins/inputable.coffee'
import localeable from '../../mixins/localeable.coffee'
import {splitDeps} from '../../models/task/task.coffee'
import {asc} from '../../models/task/order.coffee'



luda.component 'kickoffFormSelect'

.protect modelable.all()

.protect localeable.all()

.protect inputable.except(
  'inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue',
  'setInputValue', 'toggleInputReadonly'
)

.include

  showOptions: -> @options.removeClass 'is-hidden'

  hideOptions: -> @options.addClass 'is-hidden'

  toggleOptions: (hide) -> @options.toggleClass 'is-hidden', hide

.protect

  inputCls: 'kickoff-form-select-input'

  errorMarkerCls: 'kickoff-form-select-selected-labels'

  inputTemplate: ->
    placeholder = @fieldConfig.placeholder or ''
    "<div class='kickoff-form-select-simulated'>
      <input class='kickoff-form-select-selected-labels' readonly
      placeholder='#{placeholder}' data-auto='false' />
      <div class='kickoff-form-select-options is-hidden'></div>
    </div>"

  optionsTemplate: (options = []) ->
    model = @model()
    {topLevelProp, prop, bottomLevelProp, label, multiple} = @fieldConfig
    inputType = if multiple then 'checkbox' else 'radio'
    if topLevelProp in ['predecessors', 'successors'] and not options.length
      asc(model.root().tasks...).map (t) ->
        if topLevelProp is 'predecessors'
          return unless model.predecessors(bottomLevelProp).includes(t) \
          or t.isValidPredecessorOf(model)
        if topLevelProp is 'successors'
          return unless model.successors(bottomLevelProp).includes(t) \
          or t.isValidSuccessorOf(model)
        options.push {value: t.data.wbs, label: "#{t.data.wbs} #{t.data.name}"}
    options.map((option) =>
      {label, value} = option
      {type, str} = @valueToStr value
      "<label class='kickoff-form-select-option' data-auto='false'>
         <input class='kickoff-form-select-input'
         name='kickoff_task_#{model.uid}_#{prop}'
         type='#{inputType}' value='#{value}' data-auto='false'
         data-prop='#{prop}' data-value-type='#{type}' data-label='#{label}' />
         #{label}
       </label>"
    ).join ''

  refreshOptions: ->
    self = this
    {options} = @fieldConfig
    @hideOptions()
    if luda.isFunction options
      useOptions = (deferOptions) ->
        self.options.html self.optionsTemplate(deferOptions)
      return options useOptions
    @options.html @optionsTemplate(options)

  toggleInputReadonly: ->
    {prop, topLevelProp} = @fieldConfig
    model = @model()
    rootTask = model.root()
    propIsReadonly = model.readonly(topLevelProp) or model.readonly(prop)
    @setInputValue()
    @simulatedInput.toggleClass 'is-readonly', propIsReadonly
    @input.each (item) ->
      isReadonly = propIsReadonly
      if topLevelProp in ['predecessors', 'successors']
        reverseP = {predecessors: 'successors', successors: 'predecessors'}
        reverseTask = rootTask.find(item.value)
        isReadonly ||= reverseTask.readonly reverseP[topLevelProp]
        isReadonly ||= reverseTask.readonly(
          prop.replace(topLevelProp, reverseP[topLevelProp])
        )
      val = if isReadonly then '' else null
      luda(item).attr 'disabled', val
      luda(item).parent('.kickoff-form-select-option').attr 'readonly', val
      undefined

  getInputValue: ->
    {multiple, topLevelProp} = @fieldConfig
    vals = []
    @input.each (item) =>
      return unless item.checked
      vals.push @strToValue(item.value, luda(item).data('value-type'))
      undefined
    return vals if multiple
    return vals[0] or '' if topLevelProp in ['predecessors', 'successors']
    vals[0]

  setInputValue: ->
    {multiple, topLevelProp} = @fieldConfig
    vals = @getModelValue()
    vals = splitDeps vals if multiple and typeof vals is 'string'
    vals = [vals] unless luda.isArray vals
    @input.each (item) =>
      checked = @strToValue(item.value, luda(item).data('value-type')) in vals
      luda(item).attr 'checked', if checked then '' else null
      item.checked = Boolean checked
      undefined
    @setSimulatedInputValue()

  setSimulatedInputValue: ->
    checkedLabels = []
    @input.each (item) ->
      return unless item.checked
      checkedLabels.push luda(item).data('label')
      undefined
    @simulatedInput.val checkedLabels.join(', ')

  toggleOptionsHandler: (event) ->
    {prop, topLevelProp} = @fieldConfig
    return if @model().readonly(topLevelProp) or @model().readonly(prop)
    if event.type is 'focusin'
      @showOptions()
    else if event.type is 'change'
      @toggleOptions not @fieldConfig.multiple

  toggleOptionsBySimulatedInputHandler: (event) ->
    {prop, topLevelProp} = @fieldConfig
    return if @model().readonly(topLevelProp) or @model().readonly(prop)
    if event.type is 'focusin'
      isHidden = @options.hasClass 'is-hidden'
      @showOptions()
      @_handledByFocusin = isHidden
    else if event.type is 'click'
      @toggleOptions() unless @_handledByFocusin
      delete @_handledByFocusin

.protect

  valueToStr: (value) ->
    type = Object.prototype.toString.call value
    if ['[object String]', '[object Boolean]', '[object Number]'].includes type
      str = String value
    else if value is undefined or value is null
      str = ''
    else
      str = JSON.stringify(type)
    {type, str}

  strToValue: (str, type) ->
    return str if type is '[object String]'
    return Number str if type is '[object Number]'
    return Boolean str if type is '[object Boolean]'
    return undefined if type is '[object Undefined]'
    return null if type is '[object Null]'
    JSON.parse str

.help

  create: ->
    @creator()
    @model().on "after-activate-form.#{@id}", (event) =>
      return unless event.target is @model()
      @refreshOptions()
    @model().on "after-update.#{@id}", (event, updated) =>
      return unless event.target is @model()
      {topLevelProp, prop} = @fieldConfig
      return unless topLevelProp in ['predecessors', 'successors']
      isAffected = false
      if updated.predecessors
        isAffected = Object.keys(updated.predecessors.newVal).some (type) ->
          return if prop is "predecessors.#{type}"
          newVals = splitDeps updated.predecessors.newVal[type]
          oldVals = splitDeps updated.predecessors.oldVal[type]
          not luda.arrayEqual newVals, oldVals
      if updated.successors
        isAffected ||= Object.keys(updated.successors.newVal).some (type) ->
          return if prop is "successors.#{type}"
          newVals = splitDeps updated.successors.newVal[type]
          oldVals = splitDeps updated.successors.oldVal[type]
          not luda.arrayEqual newVals, oldVals
      @refreshOptions() if isAffected

  destroy: -> @destroyer()

  listen: ->
    [
      ['change', '.kickoff-form-select-input', @setSimulatedInputValue]
      ['focusin change', '.kickoff-form-select-input', @toggleOptionsHandler]
      [
        'focusin click',
        '.kickoff-form-select-selected-labels',
        @toggleOptionsBySimulatedInputHandler
      ]
      [
        'focusin click', (e) ->
          focusedSelect = null
          e.eventPath().some (element) ->
            if luda(element).is '.kickoff-form-select'
              focusedSelect = element
              return true
          targets = luda('.kickoff-form-select').not(focusedSelect)
          luda.kickoffFormSelect(targets).hideOptions()
      ]
    ]
    .concat @listener()

  watch: ->
    node: [
      ['.kickoff-form-select-input', @reset]
    ]

  find: ->
    Object.assign @finder(), {
      simulatedInput: '.kickoff-form-select-selected-labels'
      options: '.kickoff-form-select-options'
    }

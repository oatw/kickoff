import {capitalize} from '../utilities/string.coffee'



luda.mixin 'kickoffInputable',

  inputCls: 'kickoff-form-input'

  errorMarkerCls: 'kickoff-form-input'

  render: ->
    @root.html @template()
    # @reset()

  template: ->
    {bottomLevelProp, prop} = @fieldConfig
    if 'label' of @fieldConfig
      label = @fieldConfig.label
    else
      label = @l("task.props.#{prop}") or capitalize(bottomLevelProp)
    "<label class='kickoff-form-label'>#{label}</label>
     #{@inputTemplate()}
     <p class='kickoff-form-error is-hidden'></p>"

  inputTemplate: ->
    placeholder = @fieldConfig.placeholder or ''
    "<input class='#{@inputCls}' type='text' placeholder='#{placeholder}'
    data-auto='false'/>"

  getInputValue: ->
    String(@input.val()).trim()

  setInputValue: ->
    @input.val @getModelValue()

  toggleInputReadonly: ->
    {prop, topLevelProp} = @fieldConfig
    if @model().readonly(topLevelProp) or @model().readonly(prop)
      @input.attr 'readonly', ''
      @setInputValue()
    else
      @input.removeAttr 'readonly'

  toggleFieldError: (force) ->
    return @model().error(@fieldConfig.prop, null) if force is null
    propError = @model().error @fieldConfig.prop
    if propError
      @error.removeClass('is-hidden').html propError.join('</br>')
      @errorMarker.addClass 'is-invalid'
    else
      @error.addClass('is-hidden').html ''
      @errorMarker.removeClass 'is-invalid'

  reset: ->
    @setInputValue()
    @toggleInputReadonly()
    @toggleFieldError null

  getModelValue: ->
    {propTree, topLevelProp} = @fieldConfig
    if topLevelProp is 'successors'
      value = @model().depended
    else if topLevelProp in ['predecessors', 'dependencies']
      value = @model().data.dependencies
    else
      value = @model().data[topLevelProp]
    for p in propTree.slice(1)
      return unless value = value[p]
    value

  updateModelValue: ->
    @toggleFieldError null
    data = {}
    data[@fieldConfig.prop] = @getInputValue()
    @model().update data

  deferUpdateModelValue: ->
    clearTimeout @_isUpdating
    @_isUpdating = setTimeout (=> @updateModelValue()), 50

  afterUpdate: (event, updated) ->
    return unless event.target is @model()
    {topLevelProp, prop} = @fieldConfig
    @setInputValue() if updated[topLevelProp] or updated[prop]
    if updated.error
      {newVal, oldVal} = updated.error
      if newVal[topLevelProp] or oldVal[topLevelProp] \
      or newVal[prop] or oldVal[prop]
        @toggleFieldError()
    if updated.readonlyProps
      {newVal, oldVal} = updated.readonlyProps
      if newVal.includes(topLevelProp) or oldVal.includes(topLevelProp) \
      or newVal.includes(prop) or oldVal.includes(prop)
        @toggleInputReadonly()

  creator: ->
    fieldIndexes = String(@root.data 'field-index').split '-'
    conf = {fields: @config().formFields}
    conf = conf.fields[index] while (index = fieldIndexes.shift()) >= 0
    propTree = conf.prop.split '.'
    topLevelProp = propTree[0]
    bottomLevelProp = propTree[propTree.length - 1]
    @fieldConfig = Object.assign {propTree, topLevelProp, bottomLevelProp}, conf
    @render()
    @model().on "after-activate-form.#{@id}", (e) =>
      return unless e.target is @model()
      @reset e
    @model().on "after-deactivate-form.#{@id}", (e) =>
      return unless e.target is @model()
      @reset e
    @model().on "after-update.#{@id}", (e, u) =>
      return unless e.target is @model()
      @afterUpdate e, u

  destroyer: ->
    clearTimeout @_isUpdating
    @model()?.off "after-activate-form.#{@id}"
    @model()?.off "after-deactivate-form.#{@id}"
    @model()?.off "after-update.#{@id}"

  listener: ->
    [
      ['change', ".#{@inputCls}", @updateModelValue]
      ['keydown keyup', ".#{@inputCls}", @deferUpdateModelValue]
    ]

  finder: ->
    input: ".#{@inputCls}"
    error: '.kickoff-form-error'
    errorMarker: ".#{@errorMarkerCls}"



export default luda.mixin 'kickoffInputable'

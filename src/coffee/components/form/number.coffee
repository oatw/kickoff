import modelable from '../../mixins/modelable.coffee'
import inputable from '../../mixins/inputable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffFormNumber'

.protect modelable.all()

.protect localeable.all()

.protect inputable.except(
  'inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue'
)

.protect

  inputCls: 'kickoff-form-number-input'

  errorMarkerCls: 'kickoff-form-number-input'

  inputTemplate: ->
    placeholder = @fieldConfig.placeholder or ''
    "<input class='#{@inputCls}' type='number' placeholder='#{placeholder}'
    data-auto='false' />"

  getInputValue: ->
    value = @input.val()
    return value if typeof value is 'number'
    return NaN if typeof value is 'string' and not value.trim().length
    Number value

.help

  create: -> @creator()

  destroy: -> @destroyer()

  listen: -> @listener()

  find: -> @finder()

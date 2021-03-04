import modelable from '../../mixins/modelable.coffee'
import inputable from '../../mixins/inputable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffFormTextarea'

.protect modelable.all()

.protect localeable.all()

.protect inputable.except('inputCls', 'errorMarkerCls', 'inputTemplate')

.protect

  inputCls: 'kickoff-form-textarea-input'

  errorMarkerCls: 'kickoff-form-textarea-input'

  inputTemplate: ->
    placeholder = @fieldConfig.placeholder or ''
    "<textarea class='#{@inputCls}' placeholder='#{placeholder}'
    data-auto='false'></textarea>"

.help

  create: -> @creator()

  destroy: -> @destroyer()

  listen: -> @listener()

  find: -> @finder()

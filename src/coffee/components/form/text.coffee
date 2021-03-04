import modelable from '../../mixins/modelable.coffee'
import inputable from '../../mixins/inputable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffFormText'

.protect modelable.all()

.protect localeable.all()

.protect inputable.all()

.help

  create: -> @creator()

  destroy: -> @destroyer()

  listen: -> @listener()

  find: -> @finder()

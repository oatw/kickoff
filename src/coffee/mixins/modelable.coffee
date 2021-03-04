import store from '../models/store.coffee'



luda.mixin 'kickoffModelable',

  model: -> store.find @root.data('uid')

  relations: -> store.relations @root.data('uid')

  rootTask: -> @relations()?.root

  timeline: -> @relations()?.timeline

  config: -> @relations()?.config



export default luda.mixin 'kickoffModelable'

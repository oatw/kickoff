luda.mixin 'kickoffLocaleable',

  locale: (path = '') ->
    conf = @_locale ||= @config().locale
    pathes = path.split '.'
    for key in pathes
      conf = conf[key]
      return '' if conf is undefined or conf is null
    conf = conf.$ if Object.prototype.toString.call(conf) is '[object Object]'
    return '' if conf is undefined or conf is null
    String conf

  l: (path) -> @locale path



export default luda.mixin 'kickoffLocaleable'

import modelable from '../../mixins/modelable.coffee'



luda.component 'kickoffButtonDestroyLink'

.protect modelable.all()

.protect

  from: -> @root.data 'from'

.protect

  destroy: ->
    return if @model().isRoot()
    @model().removeDeps @from()

.help

  create: ->
    return unless model = @model()
    depc = @rootTask().find @from()
    return unless depc
    {type, shortcut} = @model().depcType depc
    return unless shortcut
    title = "Remove #{luda.dashCase(type).replace(/-/g, ' ')} association
             with #{depc.data.wbs} #{depc.data.name}"
    html = "<i class='kickoff-ico-cross'></i> #{shortcut} #{depc.data.wbs}"
    @root.attr('title', title).html html

  listen: -> [['click', @destroy]]

import Time from '../../models/time/index.coffee'
import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonCreateMilestone'

.protect modelable.all()

.protect localeable.all()

.protect

  create: ->
    return @model().create({type: 'milestone'}) unless @model().isRoot()
    unit = @timeline().unit()
    m = Time.methodNames unit
    beginning = end = new Time()[m.endOfUnit]()
    @model().create({type: 'milestone', beginning, end})

.help

  create: ->
    return unless model = @model()
    if @model().isRoot()
      html = @l 'task.actions.createMilestone'
    else
      html = "<i class='kickoff-ico-diamond'></i>"
    @root.html html
    unless @model().isRoot()
      @root.attr 'title', @l('task.actions.createSubMilestone')

  listen: -> [['click', @create]]

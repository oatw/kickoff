import Time from '../../models/time/index.coffee'
import modelable from '../../mixins/modelable.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffButtonCreateTask'

.protect modelable.all()

.protect localeable.all()

.protect

  create: ->
    return @model().create({}) unless @model().isRoot()
    unit = @timeline().unit()
    m = Time.methodNames unit
    beginning = new Time()[m.beginningOfUnit]()
    end = beginning[m.endOfUnit]()
    @model().create({beginning, end})

.help

  create: ->
    return unless model = @model()
    if @model().isRoot()
      html = @l 'task.actions.createTask'
    else
      html = "<i class='kickoff-ico-copy'></i>"
    @root.html html
    unless @model().isRoot()
      @root.attr 'title', @l('task.actions.createSubTask')

  listen: -> [['click', @create]]

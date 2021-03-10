import {Time} from '../../models/time/index.coffee'
import {capitalize} from '../../utilities/string.coffee'



builtInProps = [
  'uid', 'rootId', 'wbs', 'type', 'created', 'isHidden', 'stacks', 'errors',
  'operations', 'readonlys', 'tasks', 'events', 'pendingDeps'
]

enhancedProps = [
  'dependencies', 'predecessors', 'successors', 'end', 'beginning', 'duration',
  'isPicked', 'isFolded', 'actions', 'readonlyProps'
]

taskActions = [
  'pick', 'update', 'createTask', 'createMilestone', 'destroy', 'fold'
]

rootTaskActions = [
  'createTask', 'createMilestone', 'destroyDescendants', 'switchState'
]

milestoneActions = [
  'pick', 'update', 'destroy'
]

invalidMilestoneActions = [
  'createTask', 'createMilestone', 'fold'
]

depcTypes = ['finishToStart', 'startToStart', 'finishToFinish', 'startToFinish']

depcTypeShortcuts = ['f2s', 's2s', 'f2f', 's2f']

isTask = (task) -> task instanceof Task

mustBeTask = (task) ->
  throw new Error "Invalid Task instance" unless isTask task

mustLikeTask = (data = {}) ->
  return if isTask data
  error = new Error "Invalid Task like data"
  throw error unless data.data
  throw error unless (data.rootId or data.data.rootId)
  throw error unless (data.uid or data.data.uid)

root = (task) ->
  mustLikeTask task
  rootTask = Task.roots[task.rootId or task.data.rootId]
  throw new Error "Task root not found." unless rootTask
  rootTask

isRoot = (task) ->
  mustBeTask task
  task is root task

mustBeRoot = (task) ->
  throw new Error "Invalid root task" unless isRoot task

isExisted = (task) ->
  mustBeTask task
  return false unless rootId = task.rootId
  return false unless rootTask = Task.roots[rootId]
  isRoot(task) or rootTask.tasks.includes task

mustExist = (task) ->
  mustBeTask task
  throw new Error "Task doesn't exist" unless isExisted task

find = (rootTask, uidOrWbs) ->
  mustBeRoot rootTask
  rootTask.tasks.find (t) ->
    return t.data.wbs is uidOrWbs.trim() if luda.isString uidOrWbs
    t.uid is uidOrWbs

parent = (task, includeRoot = false) ->
  mustExist task
  return null if isRoot task
  unless parentTaskWbs = parentWbs task.data.wbs
    return if includeRoot then root task else null
  find root(task), parentTaskWbs

mustHasConsecutiveWbs = (task) ->
  mustBeTask task
  [wbs, rootTask] = [task.data.wbs, root task]
  throw new Error "wbs: #{wbs} has been occupied" if find rootTask, wbs
  return if wbs is '1'
  return if find rootTask, prevWbs(wbs)
  return if find rootTask, parentWbs(wbs)
  throw new Error "wbs: #{wbs} is not consecutive"

isValidWbs = (wbs) -> wbs and wbs.length

mustBeValidWbs = (wbs) ->
  throw new Error "Invalid wbs: #{wbs}" unless isValidWbs wbs

splitWbs = (wbs = '') ->
  mustBeValidWbs wbs
  (if luda.isArray wbs then wbs else wbs.split '.').map (n) ->
    number = parseInt n, 10
    unless Number.isInteger(number) and number > 0
      throw new Error "wbs: #{wbs} must be combined with positive integers"
    number

joinWbs = (wbs = []) -> splitWbs(wbs).join '.'

prevWbs = (wbs = '') ->
  return null unless isValidWbs wbs
  arr = splitWbs wbs
  arr[arr.length - 1] -= 1
  return null if arr[arr.length - 1] <= 0
  arr.join '.'

nextWbs = (wbs = '') ->
  return null unless isValidWbs wbs
  arr = splitWbs wbs
  arr[arr.length - 1] += 1
  arr.join '.'

parentWbs = (wbs = '') ->
  return null unless isValidWbs wbs
  arr = splitWbs wbs
  arr.pop()
  return null unless arr.length
  arr.join '.'

firstChildWbs = (wbs = '') ->
  return '1' unless isValidWbs wbs
  arr = splitWbs wbs
  arr.push 1
  arr.join '.'

splitDeps = (deps = '') ->
  arr = deps.trim().split(',')
  .map((str) -> str.trim())
  .filter((str) -> str.length)
  luda.unique(arr).sort()

joinDeps = (depsArr = []) ->
  arr = depsArr
  .map((str) -> str.trim())
  .filter((str) -> str.length)
  luda.unique(arr).sort().join ','

revokeTask = (task) ->
  allTasks =  root(task).tasks
  index = allTasks.indexOf this
  allTasks.splice index, 1 if index >= 0
  delete task.rootId



class Task

  @roots = {}

  constructor: (data = {}, options = {}) ->
    if options.source is 'history'
      @[key] = val for key, val of data
      return root(this).tasks.push this
    throw new Error "Task instance cannot be recreated" if isTask data
    # Common data structure
    @uid = luda.guid()
    @data = Object.assign {}, data
    delete @data.uid
    @created = false
    @errors = {}
    unless @data.wbs
      @constructor.roots[@uid] = this
      # Root task data structure
      @rootId = @uid
      delete @data.rootId
      @tasks = []
      @events = {}
      @stacks = {undo: [], redo: []}
      @data.exclusions ||= []
      @data.excludeWeekends = true unless 'excludeWeekends' of data
      @data.inclusions ||= []
      @data.minDurationSeconds ||= 3600 * 24 - 1
      @data.maxHistorySize ||= Infinity
      @data.actions ||= rootTaskActions.slice()
      @actions @data.actions...
    else
      rootId = @rootId = @data.rootId
      taskWbs = @data.wbs
      mustHasConsecutiveWbs this
      # Add the task to its root tasks store.
      root(this).tasks.push this
      return revokeTask(this) unless @trigger 'before-create', @data, true
      # Preventing wbs and rootId from being modified
      # in before-create event callback
      @rootId = rootId
      delete @data.rootId
      @data.wbs = taskWbs
      # Setting built-in default values
      isMilestone = @data.type is 'milestone'
      @data.type = 'task' unless isMilestone
      @data.name ||= "New #{capitalize @data.type}"
      if @data.end instanceof Time
        @data.end = @data.end.toString()
      else
        @data.end ||= ''
      if @data.beginning instanceof Time
        @data.beginning = @data.beginning.toString()
      else
        @data.beginning ||= ''
      @data.dependencies ||= {}
      @data.dependencies.finishToStart ||= ''
      @data.dependencies.startToStart ||= ''
      @data.dependencies.finishToFinish ||= ''
      @data.dependencies.startToFinish ||= ''
      @depended = {
        finishToStart: '', startToStart: '',
        finishToFinish: '', startToFinish: ''
      }
      @operations = []
      operations = @data.actions
      operations ||= if isMilestone then milestoneActions else taskActions
      @actions operations...
      delete @data.actions
      @readonlys = []
      readonlys = luda.unique builtInProps.concat(@data.readonlyProps or [])
      @readonlyProps readonlys...
      delete @data.readonlyProps
      isTopLevel = (p = parent this, true) is root this
      @isPicked = if isTopLevel then false else Boolean(p.isPicked)
      @isFolded = @isHidden = if isTopLevel then false else Boolean(p.isFolded)
      if p.data.type is 'milestone'
        rollbackIndex = root(this).tasks.indexOf this
        root(this).tasks.splice rollbackIndex, 1 if rollbackIndex >= 0
        throw new Error "A milestone cannot be a parent"
      if isMilestone
        # Making sure the duration of a milestone is 0.
        # Setting the time of a top level milestone default to current time if
        # without an initial time.
        if isTopLevel
          end = beginning = new Time @data.end or @data.beginning
          @data.end = @data.beginning = end.toString()
        # Making sure the duration of a milestone is 0.
        # Setting the time of a non-top level milestone to
        # its parent's end time before creating.
        else
          end = beginning = @data.end or @data.beginning
          @data.end = @data.beginning = p.data.end
      else
        # Making sure the duration of a top level task
        # isn't shorter than the min duration setting before creating.
        # If without an initial time range, make it default to current time to
        # current time + minDurationSeconds.
        if isTopLevel
          [end, beginning] = [new Time(@data.end), new Time(@data.beginning)]
          earlistEnd = beginning.nextSecond root(this).data.minDurationSeconds
          end = earlistEnd if end.earlierThan earlistEnd
          @data.end = end.toString()
          @data.beginning = beginning.toString()
        # Setting the beginning and end of a child
        # the same as its parent before creating.
        else
          [end, beginning] = [@data.end, @data.beginning]
          [@data.end, @data.beginning] = [p.data.end, p.data.beginning]
      # Setting dependencies
      # and caching the wbs numbers of dependencies not created yet
      Object.keys(@data.dependencies).forEach (type) =>
        wbses = splitDeps @data.dependencies[type]
        @_addDeps type, wbses...
        added = splitDeps @data.dependencies[type]
        pending = wbses.filter (wbs) -> not added.includes wbs
        @pendingDeps = ({type, wbs} for wbs in pending) if pending.length
      # Adjusting the beginning and end
      return revokeTask(this) unless @_tryUpdateSchedule {beginning}
      return revokeTask(this) unless @_tryUpdateSchedule {end}
      # Adding this task as a dependency of the ones,
      # which are depended on this but created earlier.
      root(this).tasks.forEach (task) =>
        return unless task.pendingDeps
        task.pendingDeps = task.pendingDeps.filter (p) =>
          return true unless p.wbs is @data.wbs
          task.addDeps p.type, this
          false
        delete task.pendingDeps unless task.pendingDeps.length
    @created = true
    @trigger 'after-create'



Task.prototype.isRoot = -> isRoot this



export {
  Task
  Task as default
  isTask
  mustBeTask
  root
  isRoot
  mustBeRoot
  isExisted
  mustExist
  find
  parent
  splitWbs
  joinWbs
  splitDeps
  joinDeps
  prevWbs
  nextWbs
  parentWbs
  firstChildWbs
  builtInProps
  enhancedProps
  taskActions
  rootTaskActions
  milestoneActions
  invalidMilestoneActions
  depcTypes
  depcTypeShortcuts
}

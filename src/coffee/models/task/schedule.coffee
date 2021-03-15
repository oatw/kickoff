import {Time} from '../../models/time/index.coffee'
import {
  Task
  mustExist
  root
  isRoot
  joinDeps
} from './task.coffee'
import {
  isMilestone
  isTask
} from './type.coffee'
import {
  children
  ancestors
  descendants
} from './query.coffee'
import {
  s2fDeps
  s2sDeps
  f2fDeps
  f2sDeps
} from './predecessor.coffee'
import {
  s2fDepd
  s2sDepd
  f2fDepd
  f2sDepd
} from './successor.coffee'
import {desc} from './order.coffee'
import {triggerEvent} from './event.coffee'



earlistTaskEnd = (task, newBegin) ->
  return new Time newBegin if isMilestone task
  minDuration = root(task).data.minDurationSeconds
  new Time(newBegin).nextSecond minDuration

checkEarlistTaskEnd = (task, newBegin) ->
  current = new Time task.data.end
  earlist = earlistTaskEnd task, newBegin
  ok = not current.earlierThan earlist
  {ok, current, earlist}

taskEndByBeginDiff = (task, newBegin) ->
  diff = new Time(task.data.beginning).to(newBegin).seconds
  new Time(task.data.end).calcSeconds diff

taskBeginByEndDiff = (task, newEnd) ->
  diff = new Time(task.data.end).to(newEnd).seconds
  new Time(task.data.beginning).calcSeconds diff

hasNoTaskChildren = (task) ->
  return true if (taskChildren = children task).length is 0
  not taskChildren.some (chd) -> not isMilestone chd

createS2SDepdEntries = (task, newBegin, filter, mode = 'travel') ->
  entries = []
  s2sDepd(task, filter).forEach (depd) ->
    currentBegin = new Time depd.data.beginning
    return unless currentBegin.earlierThan newBegin
    entry = {mode, task: depd, newBegin}
    if mode is 'travel' or isMilestone depd
      entry.newEnd = taskEndByBeginDiff depd, entry.newBegin
    else
      {ok, earlist} = checkEarlistTaskEnd depd, entry.newBegin
      entry.newEnd = earlist unless ok
    entries.push entry
  entries

createS2FDepdEntries = (task, newBegin, filter, mode = 'travel') ->
  entries = []
  s2fDepd(task, filter).forEach (depd) ->
    currentEnd = new Time depd.data.end
    return unless currentEnd.earlierThan newBegin
    entry = {mode, task: depd, newEnd: newBegin}
    if mode is 'travel' or isMilestone depd
      entry.newBegin = taskBeginByEndDiff depd, entry.newEnd
    entries.push entry
  entries

createF2FDepdEntries = (task, newEnd, filter, mode = 'travel') ->
  entries = []
  f2fDepd(task, filter).forEach (depd) ->
    currentEnd = new Time depd.data.end
    return unless currentEnd.earlierThan newEnd
    entry = {mode, task: depd, newEnd}
    if mode is 'travel' or isMilestone depd
      entry.newBegin = taskBeginByEndDiff depd, entry.newEnd
    entries.push entry
  entries

createF2SDepdEntries = (task, newEnd, filter, mode = 'travel') ->
  entries = []
  f2sDepd(task, filter).forEach (depd) ->
    currentBegin = new Time depd.data.beginning
    return unless currentBegin.earlierThan newEnd
    entry = {mode, task: depd, newBegin: newEnd}
    if mode is 'travel' or isMilestone depd
      entry.newEnd = taskEndByBeginDiff depd, entry.newBegin
    else
      {ok, earlist} = checkEarlistTaskEnd depd, entry.newBegin
      entry.newEnd = earlist unless ok
    entries.push entry
  entries

collectTreeLeafForwardBeginResources = (task, newBegin) ->
  [depdEntries, leafResources] = [[], []]
  treeDownNodes = descendants task
  belongsToTask = (t) -> treeDownNodes.includes t
  notBelongsToTask = (t) -> not belongsToTask t
  leafsWithEarlierBegin = treeDownNodes.filter (n) ->
    new Time(n.data.beginning).earlierThan(newBegin) and hasNoTaskChildren(n)
  leafsWithEarlierBegin.concat(task).forEach (leaf) ->
    leafResource = {task: leaf, beginning: newBegin}
    {ok, earlist} = checkEarlistTaskEnd leaf, newBegin
    leafResource.end = earlist unless ok
    leafResource.end = newBegin if isMilestone leaf
    leafResources.push leafResource
    depdEntries = depdEntries.concat(
      createS2SDepdEntries(leaf, newBegin, belongsToTask, 'flex'),
      createS2FDepdEntries(leaf, newBegin, belongsToTask, 'flex'),
      createS2SDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'startToStart', newBegin
      ), notBelongsToTask),
      createS2FDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'startToFinish', newBegin
      ), notBelongsToTask)
    )
    depdEntries = depdEntries.concat(
      createF2FDepdEntries(leaf, leafResource.end, belongsToTask, 'flex'),
      createF2SDepdEntries(leaf, leafResource.end, belongsToTask, 'flex'),
      createF2FDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'finishToFinish', leafResource.end
      ), notBelongsToTask),
      createF2SDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'finishToStart', leafResource.end
      ), notBelongsToTask)
    ) if leafResource.end
  {depdEntries, leafs: leafsWithEarlierBegin.concat(task), leafResources}

collectTreeLeafForwardEndResources = (task, newEnd) ->
  [depdEntries, leafResources] = [[], []]
  treeDownNodes = descendants task
  belongsToTask = (t) -> treeDownNodes.includes t
  notBelongsToTask = (t) -> not belongsToTask t
  leafsWithSameEnd = treeDownNodes.filter (n) ->
    new Time(n.data.end).equals(task.data.end) and hasNoTaskChildren(n)
  leafsWithSameEnd.concat(task).forEach (leaf) ->
    leafResource = {task: leaf, end: newEnd}
    leafResource.beginning = newEnd if isMilestone leaf
    leafResources.push leafResource
    depdEntries = depdEntries.concat(
      createS2SDepdEntries(leaf, leafResource.beginning, belongsToTask, 'flex'),
      createS2FDepdEntries(leaf, leafResource.beginning, belongsToTask, 'flex'),
      createS2SDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'startToStart', leafResource.beginning
      ), notBelongsToTask),
      createS2FDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'startToFinish', leafResource.beginning
      ), notBelongsToTask)
    ) if leafResource.beginning
    depdEntries = depdEntries.concat(
      createF2FDepdEntries(leaf, newEnd, belongsToTask, 'flex'),
      createF2SDepdEntries(leaf, newEnd, belongsToTask, 'flex'),
      createF2FDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'finishToFinish', newEnd
      ), notBelongsToTask),
      createF2SDepdEntries(leaf, limitionWithCompensatory(
        leaf, 'finishToStart', newEnd
      ), notBelongsToTask)
    )
  {depdEntries, leafs: leafsWithSameEnd.concat(task), leafResources}

limitionWithCompensatory = (depc, type, time) ->
  compensatorySecs = root(depc).data["#{type}CompensatorySeconds"] or 0
  if type in ['finishToStart', 'finishToFinish']
    limitionWithoutCompensatory = time or depc.data.end
  else if type in ['startToStart', 'startToFinish']
    limitionWithoutCompensatory = time or depc.data.beginning
  else
    throw new Error "Unsupported dependency type."
  return limitionWithoutCompensatory unless compensatorySecs
  new Time(limitionWithoutCompensatory).calcSeconds(compensatorySecs)

checkEarlistTreeBegin = (task, newBegin, mode = 'flex') ->
  [earlist, ok] = [null, true]
  [f2sDepcEnds, s2sDepcBegins, f2fDepcEnds, s2fDepcBegins] = [[], [], [], []]
  affectedTreeDownNodes = descendants task, (n) ->
    new Time(n.data.beginning).equals task.data.beginning
  affectedTreeUpNodes = ancestors(task).filter (n) ->
    new Time(n.data.beginning).laterThan newBegin
  notBelongsToTask = (t) -> not affectedTreeDownNodes.includes t
  affectedTreeDownNodes.concat(task, affectedTreeUpNodes).forEach (n) ->
    for d in f2sDeps n, notBelongsToTask
      f2sDepcEnds.push limitionWithCompensatory(d, 'finishToStart')
    for d in s2sDeps n, notBelongsToTask
      s2sDepcBegins.push limitionWithCompensatory(d, 'startToStart')
    return unless isMilestone n
    for d in f2fDeps n, notBelongsToTask
      f2fDepcEnds.push limitionWithCompensatory(d, 'finishToFinish')
    for d in s2fDeps n, notBelongsToTask
      s2fDepcBegins.push limitionWithCompensatory(d, 'startToFinish')
  limitions = [].concat f2sDepcEnds, s2sDepcBegins, f2fDepcEnds, s2fDepcBegins
  return {earlist, ok} unless limitions.length
  earlist = Time.latest limitions...
  ok = not earlist.laterThan newBegin
  {earlist, ok}

checkEarlistTreeEnd = (task, newEnd, mode = 'flex') ->
  [earlist, ok] = [null, true]
  [f2fDepcEnds, s2fDepcBegins, earlistTaskEnds] = [[], [], []]
  [f2sDepcEnds, s2sDepcBegins] = [[], []]
  affectedTreeDownNodes = descendants task, (n) ->
    new Time(n.data.end).laterThan newEnd
  affectedTreeUpNodes = ancestors(task).filter (n) ->
    childrenWithSameOrLaterEnd = children n, (c) ->
      not new Time(c.data.end).earlierThan task.data.end
    childrenWithSameOrLaterEnd.length is 1
  notBelongsToTask = (t) -> not affectedTreeDownNodes.includes t
  affectedTreeDownNodes.concat(task, affectedTreeUpNodes).forEach (n) ->
    if mode is 'flex' and isTask n
      earlistTaskEnds.push earlistTaskEnd(n, n.data.beginning)
    for d in s2fDeps n, notBelongsToTask
      s2fDepcBegins.push limitionWithCompensatory(d, 'startToFinish')
    for d in f2fDeps n, notBelongsToTask
      f2fDepcEnds.push limitionWithCompensatory(d, 'finishToFinish')
    return unless isMilestone n
    for d in s2sDeps n, notBelongsToTask
      s2sDepcBegins.push limitionWithCompensatory(d, 'startToStart')
    for d in f2sDeps n, notBelongsToTask
      f2sDepcEnds.push limitionWithCompensatory(d, 'finishToStart')
  limitions = [].concat(
    f2fDepcEnds, s2fDepcBegins, earlistTaskEnds, f2sDepcEnds, s2sDepcBegins
  )
  return {earlist, ok} unless limitions.length
  earlist = Time.latest limitions...
  ok = not earlist.laterThan newEnd
  {earlist, ok}

collectTreeLeafBackwardBeginResources = (task, newBegin) ->
  leafResources = []
  treeDownNodes = descendants task
  leafsWithSameBegin = treeDownNodes.filter (n) ->
    new Time(n.data.beginning).equals(task.data.beginning) \
    and hasNoTaskChildren(n)
  leafsWithSameBegin.concat(task).forEach (leaf) ->
    leafResource = {task: leaf, beginning: newBegin}
    leafResource.end = newBegin if isMilestone leaf
    leafResources.push leafResource
  {leafs: leafsWithSameBegin.concat(task), leafResources}

collectTreeLeafBackwardEndResources = (task, newEnd) ->
  leafResources = []
  treeDownNodes = descendants task
  leafsWithLaterEnd = treeDownNodes.filter (n) ->
    new Time(n.data.end).laterThan(newEnd) and hasNoTaskChildren(n)
  leafsWithLaterEnd.concat(task).forEach (leaf) ->
    leafResource = {task: leaf, end: newEnd}
    leafResource.beginning = newEnd if isMilestone leaf
    leafResources.push leafResource
  {leafs: leafsWithLaterEnd.concat(task), leafResources}

collectTreeDownTravelResources = (task, newBegin, newEnd) ->
  [depdEntries, resources] = [[], []]
  beginDiff = new Time(task.data.beginning).to(newBegin).seconds if newBegin
  endDiff = new Time(task.data.end).to(newEnd).seconds if newEnd
  diff = Math.max beginDiff, endDiff if beginDiff? and endDiff?
  diff = beginDiff or endDiff unless diff?
  treeDownNodes = descendants task
  notBelongsToTask = (t) -> not treeDownNodes.includes t
  treeDownNodes.concat(task).forEach (instance) ->
    instanceOldBegin = new Time instance.data.beginning
    instanceOldEnd = new Time instance.data.end
    instanceNewBegin = instanceOldBegin.calcSeconds diff
    instanceNewEnd = instanceOldEnd.calcSeconds diff
    resources.push {
      task: instance, beginning: instanceNewBegin, end: instanceNewEnd
    }
    depdEntries = depdEntries.concat(
      createS2SDepdEntries(instance, limitionWithCompensatory(
        instance, 'startToStart', instanceNewBegin
      ), notBelongsToTask),
      createS2FDepdEntries(instance, limitionWithCompensatory(
        instance, 'startToFinish', instanceNewBegin
      ), notBelongsToTask)
    ) if instanceNewBegin.laterThan instanceOldBegin
    depdEntries = depdEntries.concat(
      createF2FDepdEntries(instance, limitionWithCompensatory(
        instance, 'finishToFinish', instanceNewEnd
      ), notBelongsToTask),
      createF2SDepdEntries(instance, limitionWithCompensatory(
        instance, 'finishToStart', instanceNewEnd
      ), notBelongsToTask)
    ) if instanceNewEnd.laterThan instanceOldEnd
  {depdEntries, resources}

addUniqueResource = (resources = [], newResources...) ->
  newResources.forEach (resource) ->
    [task, newB, newE] = [resource.task, resource.beginning, resource.end]
    newDeps = resource.dependencies
    if existed = resources.find (r) -> r.task is task
      [oldB, oldE] = [existed.beginning, existed.end]
      if newB
        newB = new Time newB
        existed.beginning = newB.toString() if not oldB or newB.laterThan oldB
      if newE
        newE = new Time newE
        existed.end = newE.toString() if not oldE or newE.laterThan oldE
      if newDeps
        existed.dependencies = newDeps
    else
      newResource = {task}
      newResource.beginning = new Time(newB).toString() if newB
      newResource.end = new Time(newE).toString() if newE
      newResource.dependencies = newDeps if newDeps
      resources.push newResource

propagateResources = (resources = [], targets = [], childFilter, mode) ->
  depdEntries = []
  targets.forEach (task) ->
    desc(ancestors(task)...).some (ancestor) ->
      return true unless (childTasks = children ancestor, childFilter).length
      [childrenBegins, childrenEnds] = [[], []]
      childTasks.forEach (child) ->
        childResource = resources.find (p) -> p.task is child
        childrenBegins.push childResource?.beginning or child.data.beginning
        childrenEnds.push childResource?.end or child.data.end
      correctBegin = Time.earlist childrenBegins...
      correctEnd = Time.latest childrenEnds...
      beginIsCorrect = correctBegin.equals ancestor.data.beginning
      endIsCorrect = correctEnd.equals ancestor.data.end
      if hasNoTaskChildren ancestor
        beginIsCorrect ||= correctBegin.laterThan ancestor.data.beginning
        endIsCorrect ||= correctEnd.earlierThan ancestor.data.end
      return true if beginIsCorrect and endIsCorrect
      ancestorResource = {task: ancestor}
      ancestorResource.beginning = correctBegin unless beginIsCorrect
      ancestorResource.end = correctEnd unless endIsCorrect
      if mode is 'destroy' and not endIsCorrect
        dependencies = JSON.parse JSON.stringify(ancestor.data.dependencies)
        newS2FDeps = joinDeps s2fDeps(
          ancestor, (d) -> not correctEnd.earlierThan d.data.beginning
        ).map((d) -> d.data.wbs)
        depsChanged = newS2FDeps isnt dependencies.startToFinish
        dependencies.startToFinish = newS2FDeps
        newF2FDeps = joinDeps f2fDeps(
          ancestor, (d) -> not correctEnd.earlierThan d.data.end
        ).map((d) -> d.data.wbs)
        depsChanged ||= newF2FDeps isnt dependencies.finishToFinish
        dependencies.finishToFinish = newF2FDeps
        ancestorResource.dependencies = dependencies if depsChanged
      addUniqueResource resources, ancestorResource
      depdEntries = depdEntries.concat(
        createS2SDepdEntries(ancestor, limitionWithCompensatory(
          ancestor, 'startToStart', correctBegin
        )),
        createS2FDepdEntries(ancestor, limitionWithCompensatory(
          ancestor, 'startToFinish', correctBegin
        ))
      ) if correctBegin.laterThan ancestor.data.beginning
      depdEntries = depdEntries.concat(
        createF2FDepdEntries(ancestor, limitionWithCompensatory(
          ancestor, 'finishToFinish', correctEnd
        )),
        createF2SDepdEntries(ancestor, limitionWithCompensatory(
          ancestor, 'finishToStart', correctEnd
        ))
      ) if correctEnd.laterThan ancestor.data.end
      false
  {depdEntries}

descResources = (resources = []) ->
  return resources unless resources.length > 1
  sortedResources = []
  descTasks = desc resources.map((resource) -> resource.task)...
  descTasks.forEach (task) ->
    resource = resources.find (r) -> r.task is task
    sortedResources.push resource
  sortedResources

collectResources = (entryTask, newVals = {}, mode = 'flex') ->
  uniqueResources = []
  entries = [Object.assign({mode, task: entryTask}, newVals)]
  {task, newBegin, newEnd} = entries[0]
  if newBegin and mode isnt 'destroy'
    {ok, earlist} = checkEarlistTreeBegin task, newBegin, mode
    entries[0].newBegin = earlist unless ok
  if newEnd and mode isnt 'destroy'
    {ok, earlist} = checkEarlistTreeEnd task, newEnd, mode
    entries[0].newEnd = earlist unless ok
  while entry = entries.shift()
    {mode, task, newBegin, newEnd} = entry
    if mode is 'destroy'
      fit = (child) -> child isnt task
      {depdEntries} = propagateResources uniqueResources, [task], fit, 'destroy'
      entries = entries.concat depdEntries if depdEntries?.length
    else if mode is 'travel'
      {
        resources, depdEntries
      } = collectTreeDownTravelResources task, newBegin, newEnd
      addUniqueResource uniqueResources, resources...
      entries = entries.concat depdEntries if depdEntries?.length
      {depdEntries} = propagateResources uniqueResources, [task], null
      entries = entries.concat depdEntries if depdEntries?.length
    else
      if newBegin
        if new Time(newBegin).earlierThan task.data.beginning
          collected = collectTreeLeafBackwardBeginResources task, newBegin
        else
          collected = collectTreeLeafForwardBeginResources task, newBegin
        {leafs, leafResources, depdEntries} = collected
        addUniqueResource uniqueResources, leafResources...
        entries = entries.concat depdEntries if depdEntries?.length
        {depdEntries} = propagateResources uniqueResources, leafs, null
        entries = entries.concat depdEntries if depdEntries?.length
      if newEnd
        if new Time(newEnd).earlierThan task.data.end
          collected = collectTreeLeafBackwardEndResources task, newEnd
        else
          collected = collectTreeLeafForwardEndResources task, newEnd
        {leafs, leafResources, depdEntries} = collected
        addUniqueResource uniqueResources, leafResources...
        entries = entries.concat depdEntries if depdEntries?.length
        {depdEntries} = propagateResources uniqueResources, leafs, null
        entries = entries.concat depdEntries if depdEntries?.length
  descResources uniqueResources

mergeOriginal = (task, newVals = {}, _original = {}) ->
  merged = []
  merged.push 'beginning' if newVals and 'beginning' of newVals
  merged.push 'end' if newVals and 'end' of newVals
  prop = merged.join ','
  Object.assign {target: task, prop}, _original

beforeUpdateSchedule = (task, newVals = {}, mode, _returnRes, _original = {}) ->
  original = mergeOriginal task, newVals, _original
  resources = collectResources(
    task, {newBegin: newVals.beginning, newEnd: newVals.end}, mode
  )
  isPrevented = resources.some (resource) ->
    {task, beginning, end, dependencies} = resource
    detail = {}
    if beginning and not new Time(beginning).equals task.data.beginning
      detail.beginning = {newVal: beginning, oldVal: task.data.beginning}
    if end and not new Time(end).equals task.data.end
      detail.end = {newVal: end, oldVal: task.data.end}
    if dependencies
      detail.dependencies = detail.predecessors = dependencies
    return unless Object.keys(detail).length
    triggerEvent(task, 'before-update', detail, original) is false
  return not isPrevented unless _returnRes
  {resources, triggered: not isPrevented}

touchSchedule = (task, newVals = {}, mode, _resources, _original = {}) ->
  original = mergeOriginal task, newVals, _original
  resources = _resources or collectResources(
    task, {newBegin: newVals.beginning, newEnd: newVals.end}, mode
  )
  resources.forEach (resource) ->
    {task, beginning, end, dependencies} = resource
    [touchDetail, updateDetail] = [{}, null]
    if newVal = beginning
      oldVal = task.data.beginning
      touchDetail.beginning = {newVal, oldVal}
      unless new Time(newVal).equals oldVal
        task.data.beginning = newVal
        updateDetail ||= {}
        updateDetail.beginning = {newVal, oldVal}
    if newVal = end
      oldVal = task.data.end
      touchDetail.end = {newVal, oldVal}
      unless new Time(newVal).equals oldVal
        task.data.end = newVal
        updateDetail ||= {}
        updateDetail.end = {newVal, oldVal}
    if mode is 'destroy' and newVal = dependencies
      oldVal = task.data.dependencies
      touchDetail.dependencies = touchDetail.predecessors = {newVal, oldVal}
      task.data.dependencies = newVal
      updateDetail ||= newVal
      updateDetail.dependencies = updateDetail.predecessors = {newVal, oldVal}
    triggerEvent task, 'after-touch', touchDetail, original
    return unless updateDetail
    triggerEvent task, 'after-update', updateDetail, original

tryUpdateSchedule = (task, newVals = {}, mode = 'flex') ->
  {triggered, resources} = beforeUpdateSchedule task, newVals, mode, true
  unless triggered
    resources = resources.map (r) ->
      resource = {task: r.task}
      resource.beginning = r.task.data.beginning if r.beginning
      resource.end = r.task.data.end if r.end
      resource.dependencies = r.task.data.dependencies if dependencies
  touchSchedule task, newVals, mode, resources
  triggered

Task.prototype._beforeUpdateSchedule = (newVals, mode, _returnRes, _original) ->
  beforeUpdateSchedule this, newVals, mode, _returnRes, _original

Task.prototype._touchSchedule = (newVals, mode, _resources, _original) ->
  touchSchedule this, newVals, mode, _resources, _original

Task.prototype._tryUpdateSchedule = (newVals, mode) ->
  tryUpdateSchedule this, newVals, mode



export {
  beforeUpdateSchedule
  touchSchedule
  tryUpdateSchedule
  tryUpdateSchedule as default
}

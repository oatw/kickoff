import {mustBeRoot} from '../models/task/task.coffee'
import {mustBeTimeline} from '../models/timeline/timeline.coffee'



stores = {}

create = (rootTask, timeline, config) ->
  mustBeRoot rootTask
  mustBeTimeline timeline
  stores[rootTask.uid] = {root: rootTask, timeline, config}

destroy = (rootId) ->
  throw new Error 'rootId must be present' unless rootId
  rootId = parseInt rootId, 10
  delete stores[rootId]

find = (uid) ->
  throw new Error 'uid must be present' unless uid
  uid = parseInt uid, 10
  matched = null
  return matched = store.root if store = stores[uid]
  Object.keys(stores).some (rootId) ->
    store = stores[rootId]
    matched = store.timeline if store.timeline.uid is uid
    matched = store.config if store.config.uid is uid
    return true if matched
    matched = store.root.find uid
  matched

relations = (uid) ->
  throw new Error 'uid must be present' unless uid
  uid = parseInt uid, 10
  matched = null
  return matched = store if store = stores[uid]
  Object.keys(stores).some (rootId) ->
    store = stores[rootId]
    matched = store if store.timeline.uid is uid
    matched = store if store.config.uid is uid
    return true if matched
    matched = store if store.root.find uid
  matched



export default {create, destroy, find, relations}

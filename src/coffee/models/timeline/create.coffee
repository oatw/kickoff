import {Timeline} from './timeline.coffee'



create = (args...) -> new Timeline args...

Timeline.create = create



export {
  create
  create as default
}

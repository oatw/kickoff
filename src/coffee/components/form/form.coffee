import modelable from '../../mixins/modelable.coffee'
import {capitalize} from '../../utilities/string.coffee'
import localeable from '../../mixins/localeable.coffee'



luda.component 'kickoffForm'

.protect modelable.all()

.protect localeable.all()

.protect

  fieldType: (type) ->
    return type if type in ['number', 'select', 'textarea', 'time']
    'text'

.protect

  render: ->
    formFields = @config().formFields
    @root.html @fieldTemplate(formFields)
    @executeCustomRenderers formFields

  fieldTemplate: (fields = [], parentIndex) ->
    model = @model()
    fields.map((field, index) =>
      {prop, type, render, multiple} = field
      if 'label' of field
        label = field.label
      else
        label = @l("task.props.#{prop}") or capitalize(prop)
      fieldIndex = if parentIndex? then "#{parentIndex}-#{index}" else index
      if field.fields
        return "<div class='kickoff-form-custom-field-group'
                data-uid='#{model.uid}' data-label='#{label}'
                data-field-index='#{fieldIndex}'></div>" if render
        return "<div class='kickoff-form-field-group' data-uid='#{model.uid}'
               data-field-index='#{fieldIndex}'>
                  <label class='kickoff-form-field-group-label'>
                    #{label}
                  </label>
                  <div class='kickoff-form-field-group-fields'>
                    #{@fieldTemplate field.fields, fieldIndex}
                  </div>
                </div>"
      return '' unless prop
      return "<div class='kickoff-form-custom-field'
              data-uid='#{model.uid}' data-prop='#{prop}'
              data-field-index='#{fieldIndex}'></div>" if render
      "<div class='kickoff-form-#{@fieldType type}' data-uid='#{model.uid}'
      data-prop='#{prop}' data-field-index='#{fieldIndex}'></div>"
    ).join ''

.protect

  executeCustomRenderers: (fields = [], parentIndex) ->
    model = @model()
    fields.forEach (field, index) =>
      {prop, render} = field
      if render
        fieldIndex = if parentIndex? then "#{parentIndex}-#{index}" else index
        if field.fields
          selector =  ".kickoff-form-custom-field-group"
          selector += "[data-field-index='#{fieldIndex}']"
        if prop
          selector = ".kickoff-form-custom-field"
          selector += "[data-field-index='#{fieldIndex}']"
        return unless selector
        render.call model, model, @root.find(selector).get(0)
      else
        @executeCustomRenderers field.fields, index if field.fields

.help

  create: -> @render()

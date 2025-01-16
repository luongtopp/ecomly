const { Schema, model } = require('mongoose')

const categorySchema = new Schema(
  {
    name: { type: String, require: true },
    colour: { type: String, defalt: '#00000' },
    image: { type: String, require: true },
    makedForDeletion: { type: Boolean, default: false }

  }
)

categorySchema.set('toObject', { virtuals: true })
categorySchema.set('toJSON', { virtuals: true })

exports.Category = model('Category', categorySchema)

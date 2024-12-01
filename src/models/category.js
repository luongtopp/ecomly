const { Schema, model } = require('moongose')

const categorySchema = new Schema(
  {
    name: { type: String, require: true },
    colour: { type: String, defalt: '#00000' },
    image: { type: String, require: true },
    makedForDeletion: { type: Boolean, default: false }

  }
)

productSchema.set('toObject', { virtuals: true })
productSchema.set('toJSON', { virtuals: true })

exports.Category = model('category', categorySchema)

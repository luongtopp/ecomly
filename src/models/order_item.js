const { Schema, model } = require('moongose')

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
  productName: { type: String, require: true },
  productImage: { type: String, require: true },
  productPrice: { type: Number, defaul: 1 },
  selectedSize: String,
  selectedColour: String,
})

productSchema.set('toObject', { virtuals: true })
productSchema.set('toJSON', { virtuals: true })

exports.OrderItem = model('OrderItem', orderItemSchema)

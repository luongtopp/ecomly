const { Schema, model } = require('moongose')

const orderSchema = new Schema(
  {
    orderItems: [
      { type: Schema.Types.ObjectId, ref: 'OrderItem', require: true }
    ],
    shippingAddress: { type: String, require: true },
    city: { type: String, require: true },
    passCode: String,
    country: { type: String, require: true },
    phone: { type: String, require: true },
    paymentId: String,
    status: {
      type: String,
      enum: [
        'pending',
        'processed',
        'shipped',
        'out-for-delivery',
        'delivered',
        'cancelled',
        'on-hold',
        'expired',
      ],
      require: true,
      default: 'pending'
    },
    statusHistory: {
      type: [String],
      enum: [
        'pending',
        'processed',
        'shipped',
        'out-for-delivery',
        'delivered',
        'cancelled',
        'on-hold',
        'expired',
      ],
      require: true,
      default: ['pending'],
    },
    totalPrime: Number,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    dateOrdered: { type: Date, default: Date.now }
  }
)

productSchema.set('toObject', { virtuals: true })
productSchema.set('toJSON', { virtuals: true })

exports.Order = model('Order', orderSchema)

const { Schema, model } = require('mongoose')

const productSchema = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    rating: { type: Number, defaul: 0.0 },
    colour: { type: [String] },
    image: { type: String, require: true },
    images: [{ type: String }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    numberOfReviews: { type: Number, default: 0 },
    sizes: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    genderAgeCategory: { type: String, enum: ['men', 'women', 'unisex', 'kid'] },
    countInStock: { type: Number, require: true, min: 0, max: 255 },
    dateAdded: { type: Date, defaul: Date.now }
  }
)
productSchema.pre('save', async (next) => {
  if (this.reviews.length > 0) {
    await this.populate('reviews')
    const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0)
    this.rating = parseFloat((totalRating / this.reviews.length).toFixed(1));
    this.numberOfReviews = this.reviews.length
  }
  next()

})
productSchema.index({ name: 'text', description: 'text' })

productSchema.set('toObject', { virtuals: true })
productSchema.set('toJSON', { virtuals: true })

exports.product = model('product', productSchema)

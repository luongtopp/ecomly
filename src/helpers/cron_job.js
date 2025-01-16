const cron = require('node-cron')
const { Category } = require('../models/category')
const { Product } = require('../models/product')

cron.schedule('0 * * * *', async () => {
  try {
    const categoriesToBeDeleted = await Category.find({
      markedForDeletion: true
    })
    for (const category of categoriesToBeDeleted) {
      const categoryProductsCount = await Product.countDocuments({
        category: category.id
      })
      if (categoryProductsCount < 1) await category.deleteOne()
    }
    console.log('CRON job completed at', new Date())
  } catch (error) {
    console.error('CRON job error:', error)
  }
})

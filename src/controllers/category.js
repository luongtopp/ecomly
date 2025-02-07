const { Category } = require('../models/category.js')

exports.getCategories = async (_, res) => {
  try {
    const categories = await Category.find()
    if (!categories) return res.status(404).json({ message: 'Categories not found' })
    return res.status(200).json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Categories not found' })
    return res.status(200).json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
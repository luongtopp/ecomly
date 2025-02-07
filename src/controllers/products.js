const { Product } = require('../models/product.js')

exports.getProducts = async (req, res) => {
  try {
    const page = req.query.page || 1
    const pageSize = 10
    let query = {}
    let product

    if (req.query.criteria) {
      switch (req.query.criteria) {
        case 'newArrivals': {
          const twoWeekAgo = new Date()
          twoWeekAgo.setDate(twoWeekAgo.getDate() - 14)
          query['dateAdded'] = { $gte: twoWeekAgo }
          break
        }
        case 'popular':
          query['rating'] = { $gte: twoWeeksAgo }
          break
        default:
          break
      }
    }
    if (req.query.category) {
      query['category'] = req.query.category
    }
    products = await Product.find(query)
      .select('-images -reviews -size')
      .skip((page - 1) * pageSize)
      .limit(pageSize)

    if (!products) {
      return res.status(404).json({ message: 'Products not found' })
    }
    return res.status(200).json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.searchProducts = async (req, res) => {
  try {
    const searchItem = req.query.q
    const page = req.query.page || 1
    const pageSize = 10

    let query = {}
    if (req.query.category) {
      query = { category: req.query.category }
      if (req.query.genderAgeCategory) {
        query['genderAgeCategory'] = req.query.genderAgeCategory.toLowerCase()
      }

    } else if (req.query.genderAgeCategory) {
      query = { genderAgeCategory: req.query.genderAgeCategory.toLowerCase() }
    }
    if (searchItem) {
      query = {
        ...query, $text: {
          $search: searchItem,
          $language: 'english',
          $caseSensitive: false,
        }
      }
    }
    const searchResults = await Product.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)

    return res.status(200).json(searchResults)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-reviews')
    if (!product) {
      res.status(404).json({ message: 'Product not found' })
    }
    return res.status(200).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

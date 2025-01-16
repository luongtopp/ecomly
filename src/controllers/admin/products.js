const { default: mongoose } = require('mongoose')
const media_helper = require('../../helpers/media_helper')
const { Category } = require('../../models/category')
const { Product } = require('../../models/product')
const { Review } = require('../../models/review')
const multer = require('multer')

exports.getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments()
    if (!count) {
      return res.status(500).json({ message: 'Could not count products' })
    }
    return res.json({ count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
exports.getProducts = async (req, res) => {
  try {

  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
exports.addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      media_helper.upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 10 }
      ])
    )
    try {
      await uploadImage(req, res)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        type: error.type,
        message: `${error.message}{${error.fields}}`,
        storageErrors: error.storageErrors
      })
    }
    const category = await Category.findById(req.body.category)
    if (!category) {
      return res.status(404).json({ message: 'Invalid Category' })

    }
    if (!category.markedForDeletion) {
      return res.status(404).json({
        message: 'Category marked for deletion, you cannot add products to this category'

      })
    }
    const image = req.files['image'][0]
    if (!image) return res.status(404).json({ message: 'No file found!' })
    req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`

    const gallery = req.files['image'][0]
    const imagePaths = []

    if (gallery) {
      for (const image of gallery) {
        const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`
        imagePaths.push(imagePath)
      }
    }
    if (imagePaths.length > 0) {
      req.body['images'] = imagePaths
    }
    const product = await new Product(req.body).save()
    if (!product) {
      res.status(500).json({ message: 'The product could not be created' })
    }
    return res.status(201).json(product)
  } catch (error) {
    console.error(error)
    if (error instanceof multer.MulterError) {
      return res.status(error.code).json({ message: error.message })

    }
    return res.status(500).json({ type: error.type, message: error.message })
  }
}
exports.editProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))) {
      return res.status(404).json({ message: 'Invalid Product' })
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category)
      if (!category) {
        return res.status(404).json({ message: 'Invalid Category' })
      }
      if (!category.markedForDeletion) {
        return res.status(404).json({
          message: 'Category marked for deletion, you cannot add products to this category'

        })
      }
      const product = await Product.findById(req.params.id)
      if (req.body.images) {
        const limit = 10 - product.images.length
        const galleryUpload = util.promisify(
          media_helper.upload.fields([{ name: 'images', maxCount: limit }])
        )
        try {
          await galleryUpload(req, res)
        } catch (error) {
          console.error(error)
          res.status(500).json({
            type: error.type,
            message: `${error.message}{${error.fields}}`,
            storageErrors: error.storageErrors
          })
        }
        const imageFiles = req.files['images']
        const updateGallery = imageFiles && imageFiles.length > 0
        if (updateGallery) {
          const imagePaths = []
          for (const image of gallery) {
            const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`
            imagePaths.push(imagePath)
          }
          req.body['image'] = [...product.images, ...imagePaths]
        }
      }
      if (req.body.image) {
        const uploadImage = media_helper.upload.fields([{ name: 'image', maxCount: 1 }])
        try {
          await uploadImage(req, res)

        } catch (error) {
          console.error(error)
          res.status(500).json(
            {
              type: error.code,
              message: `${error.message}{${error.field}`,
              storageErrors: error.storageErrors
            })
        }
        const image = req.files['image'][0]
        if (!image) return res.status(404).json({ message: 'No file found!' })
        req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json(updatedProduct)

  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
exports.deleteProductImages = async (req, res) => {
  try {
    const productId = req.params.id
    const { deletedImageUrls } = req.body

    if (!mongoose.isValidObjectId(productId) || !Array.isArray(deletedImageUrls)) {
      return res.status(400).json({ message: 'Invalid request data' })
    }
    await media_helper.deleteImages(deletedImageUrls)
    const product = await Product.findById(productId)

    if (!product) return res.status(404).json({ message: 'Product not found' })

    product.images = product.images.filter((image) => !deletedImageUrls.includes(image))

    await product.save()

    return res.status(204).end()
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`)
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'Image not found' })
    }
    res.status(500).json({ type: error.type, message: 'Image not found' })
  }
}
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ message: 'Invalid Product' })
    }
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    await media_helper.deleteImages([...product.image, ...product.images], 'ENOENT')
    await Review.deleteMany({ _id: { $in: product.reviews } })
    await res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.getProducts = async (req, res) => {
  try {
    const page = req.query.page || 1
    const pageSize = 10
    const products = await Product.find()
      .select('-reviews, -ratings')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
    if (!products) {
      return res.status(404).json({ message: 'Products not found' })
    }
    return res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}
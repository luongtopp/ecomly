const express = require('express')
const router = express.Router()
const categoriesController = require('../controllers/category')

router.get('/', categoriesController.getCategories)
router.get('/:id', categoriesController.getCategoryById)

module.exports = router

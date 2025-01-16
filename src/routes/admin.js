const express = require('express')
const router = express.Router()

const usersController = require('../controllers/admin/users.js')
const categoriesController = require('../controllers/admin/categories.js')
const ordersController = require('../controllers/admin/orders.js')
const productsController = require('../controllers/admin/products.js')

//USERS
router.get('/users/count', usersController.getUserCount)
router.delete('/users/:id', usersController.deleteUser)

//CATEGORIES
router.post('/categories/', categoriesController.addCategory)
router.put('/categories/:id', categoriesController.editCategory)
router.delete('/categories/:id', categoriesController.deleteCategory)

//PRODUCTS
router.get('/products/count', productsController.getProductsCount)
router.get('/products/', productsController.getProducts)
router.post('/products', productsController.addProduct)
router.put('/products/:id', productsController.editProduct)
router.delete('/products/:id/images', productsController.deleteProductImages)
router.delete('/products/test', (req, res) => { res.status(200).json({ message: 'Connection success!' }) })
router.delete('/products/:id', productsController.deleteProduct)

//ORDER
router.get('/orders', ordersController.getOrders)
router.get('/orders/count', ordersController.addOrdersCount)
router.put('/orders/:id', ordersController.changeOrderStatus)
router.delete('/orders/:id', ordersController.deleteOrder)

module.exports = router
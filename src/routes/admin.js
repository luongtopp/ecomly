const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin.js')

//USERS
router.get('/users/count', adminController.getUserCount)
router.delete('/users/:id', adminController.deleteUser)

//CATEGORIES
router.post('/categories/', adminController.addCategory)
router.put('/categories/:id', adminController.editCategory)
router.delete('/categories/:id', adminController.deleteCategory)

//PRODUCTS
router.get('/products/count', adminController.getProductsCount)
router.post('/products', adminController.addProduct)
router.put('/products/:id', adminController.editProduct)
router.delete('/products/:id/images', adminController.deleteProductImages)
router.delete('/products/:id', adminController.deleteProduct)

//ORDER
router.get('/orders', adminController.getOders)
router.get('/orders/count', adminController.addOrdersCount)
router.get('/orders/:id', adminController.changeOrderStatus)
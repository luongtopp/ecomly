const express = require('express')
const usersController = require('../controllers/users.js')

const router = express.Router()


router.get('/', usersController.getUsers)
router.get('/:id', usersController.getUserById)
router.put('/:id', usersController.updateUser)

module.exports = router

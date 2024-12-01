const express = require('express')
const authController = require('../controllers/auth.js')
const router = express.Router()
const { body } = require('express-validator')

const validateUser = [
  body('name').not().isEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter valid email address'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isStrongPassword().withMessage('Password must contain at least one uppercase, one lowercase, and one symbol.'),
  body('phone')
    .isMobilePhone().withMessage('Please enter a valid phone number')
    .not().isEmpty().withMessage('Phone number is required')
]

const validatePassword = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isStrongPassword().withMessage('Password must contain at least one uppercase, one lowercase, and one symbol.'),
]
router.post('/login', authController.login)
router.post('/register', validateUser, authController.register)
router.post('/verify-token', authController.verifyToken)
router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-otp', authController.verifyPasswordOTP)
router.post('/reset-password', validatePassword, authController.resetPassword)

module.exports = router

const { validationResult } = require('express-validator')
const { User } = require('../models/user.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Token } = require('../models/token.js')
const { sendMail } = require('../helpers/email_sender.js')

exports.register = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(
      (error) => ({
        file: error.path,
        message: error.msg,
      }))
    return res.status(400).json({ errors: errorMessages })
  }
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8)
    let user = new User({
      ...req.body,
      passwordHash: hashedPassword
    })
    user = await user.save()
    if (!user) {
      return res.status(500).json({ type: 'Internal Server Error', message: 'Could not create a new user' })
    }
    return res.status(201).json(user)
  } catch (error) {
    console.error(error)
    if (error.message.includes('email_1 dup key')) {
      return res.status(409).json({ type: 'AuthError', message: 'User with that email alrealy exists' })
    }
    return res.status(500).json({ type: error.name, message: error.message })
  }
}
exports.login = async function (req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })
    if (!user) {

      return res.status(404).json({
        message: 'User not found. Check your email and try again'
      })
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Incorrect password' })
    }

    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' },
    )

    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '60d' },
    )

    const token = await Token.findOne({ userId: user.id })
    if (token) await token.deleteOne();
    await new Token({ userId: user.id, accessToken, refreshToken }).save()
    user.passwordHash = undefined
    return res.json({ ...user.toObject(), accessToken })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ type: error.name, message: error.message })
  }
}
exports.verifyToken = async function (req, res) {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false)

    accessToken = accessToken.replace('Bearer ', '').trim()
    const token = await Token.findOne({ accessToken })

    const tokenData = jwt.decode(token.refreshToken)
    const user = await User.findById(tokenData.id)
    if (!user) return res.json(false)

    const isValid = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!isValid) return res.json(false)
    return true

  } catch (error) {
    console.error(error)
    return res.status(500).json({ type: error.name, message: error.message })
  }
}
exports.forgotPassword = async function (req, res) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        message: 'User with that email does NOT exist'
      })
    }
    const otp = Math.floor(1000 + Math.random() * 9000)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 600000
    const response = await sendMail(email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}`
    )

    if (response.statusCode === 500) {
      return res.status(500).json({ message: 'Error sending email' })
    } else if (response.statusCode === 200) {
      await user.save()
      return res.json({ message: 'Password reset OTP sent to your email' })
    }
    return res.status(500).json({ message: 'Something' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ type: error.name, message: error.message })
  }
}
exports.verifyPasswordOTP = async function (req, res) {
  try {
    const { email, otp } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.resetPasswordOtp !== +otp || Date.now() > user.resetPasswordOtpExpires) {
      return res.status(401).json({ message: 'Invalid or expired OTP' })
    }
    user.resetPasswordOtp = 1
    user.resetPasswordOtpExpires = undefined
    await user.save()
    return res.json({ message: 'OTP confirmed successfully' })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ type: error.name, message: error.message })
  }
}
exports.resetPassword = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(
      (error) => ({
        file: error.path,
        message: error.msg,
      }))
    return res.status(400).json({ errors: errorMessages })
  }
  try {
    const { email, newPassword } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.resetPasswordOtp !== 1) {
      return res.status(404).json({ message: 'Confirm OTP before reseting password' })
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 8)
    user.resetPasswordOtp = undefined
    await user.save()
    return res.json({ message: 'Passwrod reset successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ type: error.name, message: error.message })
  }
}

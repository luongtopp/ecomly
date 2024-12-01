const jwt = require('jsonwebtoken')

async function errorHandler(error, req, res, next) {
  if (error.name === 'UnauthorizedError') {
    if (!error.message.includes('jwt expired')) {
      return res
        .status(error.status)
        .json({ type: error.name, message: error.message })
    }
    try {
      const tokenHeader = req.header('Authorization')
      if (!tokenHeader) {
        return res.status(401).json({
          type: 'Unauthorized',
          message: 'Authorization header is missing'
        })
      }
      const accessToken = tokenHeader.split(' ')[1]
      let token = await Token.findOne({
        accessToken,
        refreshToken: { $exists: true }
      })
      if (!token) {
        return res.status(401).json({
          type: 'Unauthorized',
          message: 'Token does not exist'
        })
      }
      const userData = jwt.verify(
        token.refreshToken,
        process.env.REFRESH_TOKEN
      )

      const user = await User.findById(userData.id)
      if (!user) {
        return res.status(404).json({
          message: 'Invalid user!'
        })
      }
      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '24h' }
      )

      req.headers['authorization'] = `Bearer ${newAccessToken}`
      token.accessToken = newAccessToken
      await Token.updateOne(
        { _id: token.id },
        { accessToken: newAccessToken }
      ).exec()

      res.set('Authorization', `Bearer ${newAccessToken}`)
      return next()
    } catch (refreshError) {
      return res.status(401).json({
        type: 'Unauthorized',
        message: refreshError.message
      })
    }
  }
  return res.status(404).json({
    type: error.name, message: error.message
  })
}

module.exports = errorHandler
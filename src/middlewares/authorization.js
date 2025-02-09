const { default: mongoose } = require('mongoose')
const { token } = require('jsonwebtoken')

async function authorizePostRequests(req, res, next) {
  if (req.method !== 'POST') return next()

  const API = process.env.API_URL
  if (req.originalUrl.startWith(`${API}/admin`)) return next()
  const endpoints = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password'
  ].flatMap((path) => [`${API}${path}`])

  const isMatchingEndpoint = endpoints.some((endpoint) => req.originalUrl.includes(endpoint))
  if (isMatchingEndpoint) return next()

  const message = 'User conflict! \nThe user making the request doesn\'t match the user in request'

  const authHeader = req.header('Authorization')

  if (!authHeader) return next()
  const accessToken = authHeader.replace('Bearer', '').trim()
  const tokenData = jwt.decode(accessToken)

  if (req.body.user && tokenData.id !== req.body.user) {
    return res.status(401).json({ message })
  } else if (/\/users\/([^/]+)\//.test(req.originalUrl)) {
    const part = req.originalUrl.split('/')
    const usersIndex = part.indexOf('users')

    const id = parts[usersIndex + 1]
    if (!mongoose.isValidObjectId(id)) return next()
    if (tokenData.id !== id) return res.status(401).json()
  }
  return next()
}

module.exports = authorizePostRequests
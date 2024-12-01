const { expressjwt: expjwt } = require('express-jwt')
const { Token } = require('../models/token.js')

function authJwt() {
  const API = process.env.API_URL
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password'
  ].flatMap((path) => [`${API}${path}`, `${API}${path}/`])

  return expjwt({
    secret: process.env.ACCESS_TOKEN_SECRET,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({ path: publicPaths })
}

async function isRevoked(req, jwt, API) {
  try {
    console.log("Checking if token is revoked...");
    const authHeader = req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No valid Authorization header found.");
      return true
    }
    const accessToken = authHeader.replace('Bearer', '').trim()
    console.log("Access token:", accessToken);
    const token = await Token.findOne({ accessToken })
    if (!token) {
      console.log("Token not found in database.");
    }
    const adminRouterRegex = new RegExp(`${API}/admin`, 'i')

    const adminFault = !jwt.payload.isAdmin && adminRouterRegex.test(req.originalUrl)
    return adminFault || !token
  } catch (error) {
    console.error("Error in isRevoked:", error);
    return true
  }
}

module.exports = authJwt

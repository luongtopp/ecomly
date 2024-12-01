const express = require('express')
const mongoose = require('mongoose')
require('dotenv/config')
const authRouter = require('./routes/auth.js')
const productsRouter = require('./routes/products.js')
const authJwt = require('./middlewares/jwt.js')
const errorHandler = require('./middlewares/error_handler.js')
const app = express();
const morgan = require('morgan');
// app.use(morgan('combined'));

// Thêm middleware để parse JSON bodies
app.use(express.json());

// Thêm middleware để parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

app.use(authJwt())

app.use(errorHandler)


const env = process.env
const API = env.API_URL
app.use(`${API}`, authRouter)
app.get(`${API}/users`, (req, res) => {
  return res.json({ name: 'luong' })
})

app.use('/products', productsRouter)

mongoose.connect(env.MONGODB_CONNECTION_STRING).then(() => {
  console.log('Connected to Database')
}).catch((error) => {
  console.error('Error connecting to Database:', error.message)
})
// Start the server
const hostname = env.HOSTNAME
const port = env.PORT
app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`)
})


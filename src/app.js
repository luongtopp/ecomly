const express = require('express')
const mongoose = require('mongoose')
require('dotenv/config')
const authJwt = require('./middlewares/jwt.js')
const errorHandler = require('./middlewares/error_handler.js')
const morgan = require('morgan');
const bodyParser = require('body-parser')
const authorizePostRequests = require('./middlewares/authorization.js')

const app = express();
const env = process.env
const API = env.API_URL

app.use(morgan('tiny'));
// KHI NÀO TẠO ỨNG DỤNG CLIEN THÌ XÓA DÒNG NÀY ĐI THỬ
app.use(bodyParser.json());
// Thêm middleware để parse JSON bodies
app.use(express.json());
// Thêm middleware để parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(authJwt())
app.use(authorizePostRequests)
app.use(errorHandler)



const authRouter = require('./routes/auth.js')
const usersRouter = require('./routes/users.js')
const adminRouter = require('./routes/admin.js')
const categoriesRouter = require('./routes/categories.js')
const checkoutRouter = require('./routes/checkout.js')

app.get(`${API}/test`, (req, res) => { res.status(200).send('Connnected to server success!') })
app.use(`${API}`, authRouter)
app.use(`${API}/users`, usersRouter)
app.use(`${API}/admin`, adminRouter)
app.use(`${API}/categories`, categoriesRouter)
app.use(`${API}/checkout`, checkoutRouter)
app.use('/public', express.static(__dirname + '/public'))

require('./helpers/cron_job.js')
mongoose.connect(env.MONGODB_CONNECTION_STRING).then(() => {
  console.log('Connected to Database')
}).catch((error) => {
  console.error('Error connecting to Database:', error.message)
})

hostname = env.HOSTNAME
port = env.PORT
// Start the server
app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`)
})


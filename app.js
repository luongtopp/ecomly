const express = require('express')
const mong
require('dotenv/config')
const app = express();
const env = process.env

// Start the server
const hostname = env.HOSTNAME
const port = env.PORT
console.log('hostname is', hostname)
app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`)
}) 
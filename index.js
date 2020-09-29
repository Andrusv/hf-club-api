const express = require('express')
const app = express()

const { config } = require('./config/index.js')

const authApi = require('./routes/auth')
const withdrawalsApi = require('./routes/withdrawals')
const usersApi = require('./routes/users')
const couponsApi = require('./routes/coupons')

// BODY PARSER
app.use(express.json());

// ROUTES
authApi(app)
withdrawalsApi(app)
usersApi(app)
couponsApi(app)

app.listen(config.port, function() {
    console.log(`Listening to http://localhost:${config.port}`)
})
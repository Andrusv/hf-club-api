const express = require('express')
const app = express()

const { config } = require('./config/index.js')

const authApi = require('./routes/auth')
const withdrawalsApi = require('./routes/withdrawals')
const usersApi = require('./routes/users')

// BODY PARSER
app.use(express.json());

// ROUTES
authApi(app)
withdrawalsApi(app)
usersApi(app)

app.patch('/:coupon', function(req, res) {
    const { coupon } = req.params
    res.status(200).send(
        `<!DOCTYPE html>
        <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        </head>
        <body>${coupon}</body>
        </html>`)
});

app.listen(config.port, function() {
    console.log(`Listening to http://localhost:${config.port}`)
})
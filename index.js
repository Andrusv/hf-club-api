const express = require('express')
const app = express()

const { config } = require('./config/index.js')

const authApi = require('./routes/auth')

// routes
authApi(app)

app.post('/', async (req,res) => {
    const { name, email, password } = req.body

    res.json({
        "naimo": name,
        "emailo": email,
        "passowordo": password
    })
})

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
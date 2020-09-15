const express = require('express')
const { config } = require('./config/index.js')

const app = express()

const MySqlLib = require('./lib/mysql')

app.get('/:user_id', async function(req,res) {
    const { user_id } = req.params

    mysql= new MySqlLib()

    res.json({"Response": mysql.createTable(user_id)})

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
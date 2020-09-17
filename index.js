const express = require('express')
const app = express()

const { config } = require('./config/index.js')

const authApi = require('./routes/auth')

// BODY PARSER
app.use(express.json());

// ROUTES
authApi(app)


// PRUEBAS!!
const createUserSchema = require('./utils/schemas/createUserSchema')

app.post('/', async (req,res) => {
    const { character_name, email, password } = req.body

    try{
        const value = await createUserSchema.validateAsync({
            character_name: character_name,
            email: email,
            password: password
        })

        res.json({ value })
    } catch(err) {
        response = err.details[0].message
        res.json({ response })
    }


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
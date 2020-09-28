const express = require('express');
const passport = require('passport');

// CONFIG
const { config } = require('../config/index')

// SERVICES
const CryptoService = require('../services/crypto')
const UsersService = require('../services/users')

// SCHEMAS
const { generateSchema, exchangeSchema } = require('../utils/schemas/coupons')

// MIDDLEWARES
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

// JWT strategy
require('../utils/auth/strategies/jwt');

function couponsApi(app) {
    const router = express.Router();
    app.use('/api/coupons', router);

    const cryptoService = new CryptoService()
    const usersService = new UsersService()

    router.get('/generate',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:codes']),
    validationHandler(generateSchema),
    async (req,res) => {

        const { numberOfCoupons } = req.body

        try{
            for (let i = 0; i < numberOfCoupons; i++) {
                const coupon = await usersService.createHash(5) + '-' + await usersService.createHash(5) + '-' + await usersService.createHash(5)

                const url = `${config.domain}/api/coupons/${coupon}`


                const couponEncrypted = await cryptoService.encrypt(coupon)

                console.log("url",url)
            }

            res.status(200).json({"coupon": "couponEncrypted"})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })

    router.get('/exchange', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    validationHandler(exchangeSchema),
    async (req,res) => {

        const { user_id, coupon } = req.body

        try{
            const couponEncrypted = await cryptoService.encrypt(coupon)


            res.status(200).json({})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })

    router.get('/:coupon', function(req, res) {
        const { coupon } = req.params
        res.status(200).send(
            `<!DOCTYPE html>
            <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            </head>
            <body>${coupon}</body>
            </html>`)
    });
}

module.exports = couponsApi
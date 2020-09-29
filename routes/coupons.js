const express = require('express');
const passport = require('passport');

// CONFIG
const { config } = require('../config/index')

// SERVICES
const CryptoService = require('../services/crypto')
const CouponsService = require('../services/coupons')

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
    const couponsService = new CouponsService()

    router.get('/generate',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:codes']),
    validationHandler(generateSchema),
    async (req,res) => {
        
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
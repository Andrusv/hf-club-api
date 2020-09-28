const express = require('express');
const passport = require('passport');

// SERVICES
const ApiKeysService = require('../services/apiKeys');
const CryptoService = require('../services/crypto')

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
    const apiKeysService = new ApiKeysService();

    router.get('/generate',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:codes']),
    validationHandler(generateSchema),
    async (req,res) => {

        const { numberOfCoupons } = req.body

        try{
            
            res.status(200).json({"todo": "correcto"})
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

}

module.exports = couponsApi
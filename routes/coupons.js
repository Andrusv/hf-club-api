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
const coupons = require('../utils/schemas/coupons');
const Joi = require('joi');
const { userIdSchema } = require('../utils/schemas/users');

// JWT strategy
require('../utils/auth/strategies/jwt');

function couponsApi(app) {
    const router = express.Router();
    app.use('/api/coupons', router);

    const cryptoService = new CryptoService()
    const couponsService = new CouponsService()

    router.post('/generate',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:codes']),
    validationHandler(generateSchema),
    async (req,res) => {
        const { numberOfCoupons } = req.body
        try {
            const coupons = await couponsService.createCoupons(numberOfCoupons)

            const couponsEncrypted = await Promise.all(coupons.map( async coupon => {
                    return await cryptoService.encrypt(coupon)
            }))

            const existingCoupons = await Promise.all( couponsEncrypted.map( async coupon => {
                    return await couponsService.couponExists(coupon)
            }))

            const nonExistingCoupons = await Promise.all(existingCoupons.filter(couponExist => {
                if(couponExist){
                    return couponExist
                }
            }))

            const decryptedNonExistingCoupons = await Promise.all(nonExistingCoupons.map( async coupon => {
                return await cryptoService.decrypt(coupon)
            }))

            const linksWithCoupons = await Promise.all(
                decryptedNonExistingCoupons.map( async coupon => {
                    return`${config.domain}/api/coupons/${coupon}`
                })
            )

            const ouoLinks = linksWithCoupons

            const insertedCoupons = await couponsService.addCoupons(nonExistingCoupons,ouoLinks)

            return res.status(200).json({"couponsCreated": insertedCoupons.length})

        } catch(err) { 
            return res.status(401).json({"error": err})
        }
    })

    router.get('/get-link', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    validationHandler(Joi.object({user_id: userIdSchema})),
    async (req,res) => {

        const { user_id } = req.body

        try{
            let unusedLink = await couponsService.getUnusedLink(user_id)

            if ( !unusedLink ) {
                const asignedLink = await couponsService.asignLink(user_id)

                if (asignedLink) {
                    unusedLink = await couponsService.getUnusedLink(user_id)
                } else {
                    unusedLink = 0 //Se acabaron los cupones :(
                }
            }

            res.status(200).json({"link": unusedLink})
        } catch(err) {
            res.status(401).json({"error": error})
        }
    })

    router.post('/exchange', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    validationHandler(exchangeSchema),
    async (req,res) => {

        const { user_id, coupon } = req.body

        try{
            

            res.status(200).json({"CouponExist": "couponExist"})
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
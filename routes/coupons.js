const express = require('express');
const passport = require('passport');
const axios = require('axios')

// CONFIG
const { config } = require('../config/index')

// SERVICES
const CryptoService = require('../services/crypto')
const CouponsService = require('../services/coupons')
const UsersService = require('../services/users')

// SCHEMAS
const { generateSchema, exchangeSchema } = require('../utils/schemas/coupons')

// MIDDLEWARES
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');
const Joi = require('joi');
const { userIdSchema } = require('../utils/schemas/users');

// JWT strategy
require('../utils/auth/strategies/jwt');

function couponsApi(app) {
    const router = express.Router();
    app.use('/api/coupons', router);

    const cryptoService = new CryptoService()
    const couponsService = new CouponsService()
    const usersService = new UsersService()

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

            const insertedCoupons = await couponsService.addCoupons(nonExistingCoupons)

            return res.status(200).json({"couponsCreated": insertedCoupons.length})

        } catch(err) { 
            return res.status(401).json({"error": err})
        }
    })

    router.get('/asign-coupon', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    validationHandler(Joi.object({user_id: userIdSchema})),
    async (req,res, next) => {

        const { user_id } = req.body

        try{
            let unusedCoupon = await couponsService.getUnusedCoupon(user_id)

            console.log(await cryptoService.decrypt(unusedCoupon))
            
            if ( !unusedCoupon ) {
                const asignedCoupon = await couponsService.asignCoupon(user_id)

                if (asignedCoupon) {
                    res.status(200).json({"CouponAsigned": true})
                    next()
                } else {
                    res.status(200).json({"CouponAsigned": false})
                    next()
                }
            }

            res.status(200).json({"CouponAsigned": true})
            next()
        } catch(err) {
            res.status(401).json({"error": err})
            next(err)
        }
    })

    router.post('/exchange', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes','update:users']),
    validationHandler(exchangeSchema),
    async (req,res) => {

        const { user_id, coupon } = req.body

        try{
            const couponExchanged = await couponsService.verifyCoupon(user_id,coupon)

            res.status(200).json({"CouponExchanged": couponExchanged})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })

    router.post('/:userId',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    async (req,res, next) => {
        const { userId } = req.params
        const { authorization: jwt } = req.headers

        try{
            const { _id: userExist} = await usersService.getUserById({ referred_id: userId })

            if (userExist) {
                const url = `${config.domain}/api/coupons/coupon`

                const response = await axios({
                    method: 'get',
                    url: url,
                    headers: {
                        authorization: jwt
                    },
                    data: {
                        user_id: userId
                    }
                })

                if ( response ) {
                    res.status(200).send(response.data.page)
                    next()
                } else {
                    res.status(404).json({'null':null})
                    next()
                }                
            } else {
                res.status(401)
                next(new Error('Usuario inexistente'))
            }
        } catch(err) {
            // ERROR 404
            res.status(404)
            next(err)
        }
    });

    router.get('/coupon',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    async function(req, res) {
        const { user_id } = req.body 

        const couponEncrypted = await couponsService.getUnusedCoupon(user_id)

        const coupon = await cryptoService.decrypt(couponEncrypted)

        res.status(200).json({ 'page':
            `<!DOCTYPE html>
            <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            </head>
            <body>${coupon}</body>
            </html>`})
    });
}

module.exports = couponsApi
const express = require('express');
const passport = require('passport');

// SERVICES
const UsersService = require('../services/users')

// SCHEMAS
const { exchangeSchema } = require('../utils/schemas/coupons')

// MIDDLEWARES
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

// JWT strategy
require('../utils/auth/strategies/jwt');

function couponsApi(app) {
    const router = express.Router();
    app.use('/api/coupons', router);

    router.get('/exchange', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:codes']),
    validationHandler(exchangeSchema),
    async (req,res) => {

        const { user_id, coupon } = req.body

        try{
            res.status(200).json({"todo":"espectacular"})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })

}

module.exports = couponsApi
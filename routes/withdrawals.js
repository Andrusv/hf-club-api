const express = require('express');
const passport = require('passport');
const Joi = require('joi')

// SERVICES
const WithdrawalsService = require('../services/withdrawals');

// SCHEMAS
const { userIdSchema } = require('../utils/schemas/users')

// MIDDLEWARES
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

// CACHE
const cacheResponse = require('../utils/cache/cacheResponse');
const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS
} = require('../utils/cache/time');

// JWT strategy
require('../utils/auth/strategies/jwt');

function withdrawalsApi(app) {
    const router = express.Router();
    app.use('/api/withdrawals', router);

    const withdrawalsService = new WithdrawalsService()

    router.get('/refresh',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:withdrawals']),
    validationHandler(Joi.object({user_id:userIdSchema.required()})),
    async function (req,res) {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS);

        const { user_id: id } = req.body

        try{
            const withdrawals = await withdrawalsService.getWithdrawals(id)

            res.status(200).json({"withdrawals": withdrawals})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })
}

module.exports = withdrawalsApi
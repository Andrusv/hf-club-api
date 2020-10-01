const express = require('express');
const passport = require('passport');
const Joi = require('joi');

// SERVICES
const WithdrawalsService = require('../services/withdrawals');
const UsersService = require('../services/users')

// SCHEMAS
const { userIdSchema } = require('../utils/schemas/users')
const { withdrawSchema } = require('../utils/schemas/withdrawals')

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
    const usersService = new UsersService()

    const availablePayments = [1,10,20,50]

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

    router.post('/withdraw',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['create:withdrawals']),
    validationHandler(withdrawSchema),
    async (req, res) => {
        const { user_id, withdrawBalance } = req.body

        if( !availablePayments.includes(withdrawBalance) ) {
            res.status(402).json({"error": "Error al procesar cantidad de retiro"})
        }

        try{
            const { balance } = await usersService.getUserByIdMySQL(user_id)

            if ( balance < withdrawBalance ) {
                res.status(401).json({"error": "El usuario no posee suficientes creditos en su balance"})
            }

            const balanceDebited = await usersService.debitBalance(user_id,withdrawBalance)

            if (balanceDebited.changedRows === 1) {

                const withdrawalCreated = await withdrawalsService.createWithdrawal(user_id,withdrawBalance)

                res.json({"balance": balance-withdrawBalance, "withdrawals": withdrawalCreated})
            }
        } catch(err) {
            res.status(401).json({"error": error})
        }
    })
}

module.exports = withdrawalsApi
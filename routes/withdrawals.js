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
        const { user_id, withdrawBalance, couponWithdrawal } = req.body

        if( !availablePayments.includes(withdrawBalance) ) {
            res.status(402).json({"error": "Error al procesar cantidad de retiro"})
            return
        }

        try{
            const user = await usersService.getUserByIdMySQL(user_id)

            const response = await withdrawalsService.withdrawal(user, withdrawBalance, couponWithdrawal)

            res.status(200).json(response)
            return

        } catch(err) {
            res.status(401).json({"error": err})
            return(err)
        }
    })

    router.get('/pending-withdrawals',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:withdrawals']),
    async (req, res) => {
        res.json({"todo":"correcto"})
    })

    router.get('/aproved-withdrawals',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:withdrawals']),
    async (req, res) => {

        const aprovedWithdrawals = await withdrawalsService.getAprovedWithdrawals()
        
        res.json({aprovedWithdrawals})
    })

    router.post('/pay',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:withdrawals']),
    async (req, res) => {
        const { withdrawal_id } = req.body

        try{
            if (!withdrawal_id) {
                res.status(401).json({error: "Withdrawal_id inexistente"})
            } else {
                const payUser = await withdrawalsService.payWithdrawal(withdrawal_id)
                res.status(200).json({userPaid:payUser.changedRows})
            }
        } catch(err) {
            res.status(401).json({error: err})
        }
    })
}

module.exports = withdrawalsApi
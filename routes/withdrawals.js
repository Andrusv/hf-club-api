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
            const { balance, referrer_balance: referrerBalance } = await usersService.getUserByIdMySQL(user_id)

            if (couponWithdrawal){
                if ( balance < withdrawBalance ) {
                res.status(401).json({"error": "El usuario no posee suficientes creditos en su balance"})
                return
                }

                const balanceDebited = await usersService.debitBalance(user_id,withdrawBalance)

                if (balanceDebited.changedRows === 1) {

                    const withdrawalCreated = await withdrawalsService.createWithdrawal(user_id,withdrawBalance,couponWithdrawal)

                    res.json({"balance": balance-withdrawBalance, "withdrawalId": withdrawalCreated})
                    return
                }
            } else {
                if ( referrerBalance < withdrawBalance ) {
                    res.status(401).json({"error": "El usuario no posee suficientes creditos en su balance"})
                    return
                }

                const referrerBalanceDebited = await usersService.debitReferrerBalance(user_id,withdrawBalance)

                if (referrerBalanceDebited.changedRows === 1) {
                    const withdrawalCreated = await withdrawalsService.createWithdrawal(user_id,withdrawBalance,couponWithdrawal)

                    setTimeout(async () => {
                        console.log(await withdrawalsService.verifyReferrerCoupons(user_id,withdrawBalance))
                    }, 500)

                    res.json({"referrerBalance": referrerBalance-withdrawBalance, "withdrawalId": withdrawalCreated})
                    return
                }
            }
        } catch(err) {
            res.status(401).json({"error": err})
            return
        }
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
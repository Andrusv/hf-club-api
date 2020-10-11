const express = require('express');
const passport = require('passport');
const Joi = require('joi');

// SERVICES
const WithdrawalsService = require('../services/withdrawals');
const UsersService = require('../services/users')
const CouponsService = require('../services/coupons')

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
    const couponsService = new CouponsService()
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

            return res.status(200).json({"withdrawals": withdrawals})
        } catch(err) {
            return res.status(401).json({"error": err})
        }
    })

    router.post('/withdraw',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['create:withdrawals']),
    validationHandler(withdrawSchema),
    async (req, res) => {
        const { user_id, withdrawBalance, couponWithdrawal } = req.body

        if( !availablePayments.includes(withdrawBalance) ) {
            return res.status(402).json({"error": "Error al procesar cantidad de retiro"})
        }

        try{
            const user = await usersService.getUserByIdMySQL(user_id)

            const response = await withdrawalsService.withdrawal(user, withdrawBalance, couponWithdrawal)

            return res.status(200).json(response)

        } catch(err) {
            return res.status(401).json({"error": err})
        }
    })

    router.get('/pending-withdrawals',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['admin']),
    async (req, res) => {
        try{
            const pendingWithdrawals = await withdrawalsService.getPendingWithdrawals()

            return res.status(200).json({pendingWithdrawals})
        } catch(err) {
            return res.status(401).json({error: err})
        }
    })

    router.get('/get-user-views',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['admin']),
    async (req,res) => {
        const { user_id } = req.body

        try{
            const userViews = await couponsService.totalCouponsUsed(user_id)
            const { link: userLink } = await usersService.getUserByIdMySQL(user_id)

            return res.status(200).json({userLink,userViews})
        } catch(err) {
            return res.status(404).json({error: err})
        }

    })

    router.post('/aprove-withdrawals',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['admin']),
    async (req,res) => {
        const { user_id, aproveWithdrawals } = req.body

        if (!user_id) {
            return res.status(401).json({error: "Withdrawal_id inexistente"})
        }

        if (aproveWithdrawals) {
            const { changedRows: aproved } = await withdrawalsService.aproveWithdrawals(user_id)

            return res.status(200).json({aproved: aproved})
        } else {
            const { changedRows: rejected } = await withdrawalsService.denyWithdrawals(user_id)

            return res.status(200).json({rejected:rejected})
        }
    })

    router.get('/aproved-withdrawals',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['admin']),
    async (req, res) => {

        const aprovedWithdrawals = await withdrawalsService.getAprovedWithdrawals()
        
        const getCharacterNames = async (aprovedWithdrawals) => {
            for (let i = 0; i < aprovedWithdrawals.length; i++) {
                const { character_name } = await usersService.getUserById({ referred_id: aprovedWithdrawals[i].user_id})

                aprovedWithdrawals[i].characterName = character_name
            }
        }

        await getCharacterNames(aprovedWithdrawals)

        res.json({aprovedWithdrawals})
    })

    router.post('/pay',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['admin']),
    async (req, res) => {
        const { withdrawal_id } = req.body

        try{
            if (!withdrawal_id) {
                return res.status(401).json({error: "Withdrawal_id inexistente"})
            } else {
                const payUser = await withdrawalsService.payWithdrawal(withdrawal_id)
                return res.status(200).json({userPaid:payUser.changedRows})
            }
        } catch(err) {
            return res.status(401).json({error: err})
        }
    })
}

module.exports = withdrawalsApi
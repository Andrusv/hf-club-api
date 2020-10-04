const express = require('express');
const passport = require('passport');
const Joi = require('joi')

// SERVICES
const UsersService = require('../services/users')
const AdminService = require('../services/admin')

// SCHEMAS
const { changeInfoSchema, userIdSchema } = require('../utils/schemas/users')

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

function usersApi(app) {
    const router = express.Router();
    app.use('/api/users', router);

    const usersService = new UsersService()
    const adminService = new AdminService()

    router.patch('/change-info', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:users']),
    validationHandler(changeInfoSchema),
    async (req,res) => {
        cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);

        const { user_id, character_name, password } = req.body

        try{
            if (character_name) {
                console.log("changing character name")
                await usersService.changeCharacterName(character_name,user_id)
            }

            if (password) {
                console.log('Changing pass')
                await usersService.changeUserPassword(password,user_id)
            }

            res.status(200).json({"character_name": character_name})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })

    router.get('/refresh-stats', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:users', 'read:withdrawals', 'read:codes']),
    async (req, res) => {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS)

        try{
            const clubStats = await adminService.getStats()

            res.status(200).json({stats: clubStats})
        } catch(err) {
            res.status(401).json({err: err})
        }
    })  

    router.get('/refresh-referrer-balance',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:withdrawals']),
    validationHandler(Joi.object({user_id:userIdSchema.required()})),
    async function (req,res) {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS);

        const { user_id: id } = req.body

        try{
            const { referrer_balance : referrerBalance} = await usersService.getUserByIdMySQL(id)

            res.status(200).json({"referrerBalance": referrerBalance})
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })
    
    router.post('/ban', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:users']),
    validationHandler(Joi.object({"user_id":userIdSchema}).required()),
    async (req, res) => {
        try{
            res.status(200).json({tofo: "correct"})
        } catch(err) {
            res.status(401).json({err: err})
        }
    })
}

module.exports = usersApi
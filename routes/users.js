const express = require('express');
const passport = require('passport');

// SERVICES
const UsersService = require('../services/users')

// SCHEMAS
const { changeInfoSchema } = require('../utils/schemas/users')

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

    router.patch('/change-info', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:users']),
    validationHandler(changeInfoSchema),
    async (req,res) => {
        cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);

        const { user_id, character_name } = req.body

        try{
            const characterNameChanged = await usersService.changeCharacterName(character_name,user_id)

            if (characterNameChanged){
                res.status(200).json({ "character_name": character_name })
            }
        } catch(err) {
            res.status(401).json({"error": err})
        }
    })
}

module.exports = usersApi
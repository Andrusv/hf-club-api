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

    router.get('/', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:users']),
    validationHandler(changeInfoSchema),
    (req,res) => res.json({"hello": "moto"}))
}

module.exports = usersApi
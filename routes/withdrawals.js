const express = require('express');
const passport = require('passport');

// SERVICES
const WithdrawalsService = require('../services/withdrawals');

// SCHEMAS


// MIDDLEWARES
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

// JWT strategy
require('../utils/auth/strategies/jwt');

function withdrawalsApi(app) {
    const router = express.Router();
    app.use('/api/withdrawals', router);

    const withdrawalsService = new WithdrawalsService()

    router.get('/',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:withdrawals']),
    async function (req,res,next) {
        res.status(200).json({"todo": "correcto"})
    })
}

module.exports = withdrawalsApi
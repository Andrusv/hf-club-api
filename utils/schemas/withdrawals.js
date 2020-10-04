const Joi = require('joi')

const { userIdSchema } = require('./users')

const balanceSchema = Joi.number().min(1).max(50)

const withdrawSchema = Joi.object({
    user_id: userIdSchema.required(),
    withdrawBalance: balanceSchema.required(),
    couponWithdrawal: Joi.boolean().required()
})

module.exports = { withdrawSchema }
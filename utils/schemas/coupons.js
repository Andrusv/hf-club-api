const Joi = require('joi')

const { userIdSchema } = require('./users')

const generateSchema = Joi.object({
    numberOfCoupons: Joi.number().required()
})
const exchangeSchema = Joi.object({
    user_id: userIdSchema.required(),
    coupon: Joi.string().regex(/^[0-9a-z\-]{17}$/).required()
})

module.exports = { generateSchema ,exchangeSchema }
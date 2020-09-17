const Joi = require('joi')

const userIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(25).required(),
    character_name: Joi.string().min(1).max(25).required(),
    referred_id: userIdSchema.required(),
    apiKeyToken: Joi.string().required()
})

module.exports = { userIdSchema, createUserSchema }
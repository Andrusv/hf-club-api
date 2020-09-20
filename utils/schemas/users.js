const Joi = require('joi')

const userIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const emailSchema = Joi.string().email()
const apiKeyTokenSchema = Joi.string().min(64).max(64)

const createUserSchema = Joi.object({
    email: emailSchema.required(),
    password: Joi.string().min(5).max(25).required(),
    character_name: Joi.string().min(1).max(25).required(),
    referred_id: userIdSchema.required(),
    apiKeyToken: apiKeyTokenSchema.required()
})

const forgottenPasswordSchema = Joi.object({
    email: emailSchema.required(),
    apiKeyToken: apiKeyTokenSchema.required()
})

module.exports = { userIdSchema, createUserSchema, forgottenPasswordSchema }
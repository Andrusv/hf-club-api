const Joi = require('joi')

const userIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const emailSchema = Joi.string().email()
const apiKeyTokenSchema = Joi.string().min(64).max(64)
const characterNameSchema = Joi.string().min(1).max(25)
const passwordSchema = Joi.string().min(5).max(25)

const createUserSchema = Joi.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    character_name: characterNameSchema.required(),
    referred_id: userIdSchema.required(),
    apiKeyToken: apiKeyTokenSchema.required()
})

const forgottenPasswordSchema = Joi.object({
    email: emailSchema.required(),
    apiKeyToken: apiKeyTokenSchema.required()
})

const changeInfoSchema = Joi.object({
    user_id: userIdSchema.required(),
    character_name: characterNameSchema,
    password: passwordSchema
})

module.exports = { userIdSchema, createUserSchema, forgottenPasswordSchema, changeInfoSchema }
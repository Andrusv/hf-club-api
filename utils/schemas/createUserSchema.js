const Joi = require('joi')

const createUserSchema = Joi.object({
    character_name: Joi.string().min(1).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(25).required()
})

module.exports = createUserSchema
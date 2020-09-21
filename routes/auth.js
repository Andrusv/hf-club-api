const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const MailService = require('../services/mails')

// VALIDATION HANDLER
const validationHandler = require('../utils/middleware/validationHandler');

// SCHEMAS
const { createUserSchema, forgottenPasswordSchema } = require('../utils/schemas/users');

// CONFIG
const { config } = require('../config');

// BASIC AUTH
require('../utils/auth/strategies/basic');

function authApi(app) {
  const router = express.Router();
  app.use('/api/auth', router);

  const apiKeysService = new ApiKeysService();
  const usersService = new UsersService();
  const mailService = new MailService();

  router.post('/sign-in', async function(req, res, next) {
    const { apiKeyToken } = req.body;

    if (!apiKeyToken) {
      next(boom.unauthorized('apiKeyToken is required'));
    }

    passport.authenticate('basic', function(error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized());
        }

        req.login(user, { session: false }, async function(error) {
          if (error) {
            next(error);
          }

          const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

          if (!apiKey) {
            next(boom.unauthorized());
          }

          const { _id: id, character_name, email } = user;

          const payload = {
            sub: id,
            character_name,
            email,
            scopes: apiKey.scopes
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m'
          });

          return res.status(200).json({ token, user: { id, character_name, email } });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });
  
  router.post('/sign-up',
    validationHandler(createUserSchema),
    async function(req, res, next) {
      const { body } = req;
  
      const { apiKeyToken, ...user } = body;
  
      if (!apiKeyToken) {
        next(boom.unauthorized('apiKeyToken is required'));
      }
  
      try {
        const referrerExists = await usersService.getUserById(user)

        if (referrerExists) {
          const queriedUser = await usersService.getOrCreateUser({ user });

          if ( !queriedUser ) {
            return res.status(400).json({
              "message": "El usuario ya se encuentra registrado!"
            })
          } else {
            const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });
    
            if (!apiKey) {
              next(boom.unauthorized());
            }
      
            // AGREGAR A LISTA DE REFERIDOS
            await usersService.addReferrer(queriedUser.referred_id,queriedUser._id)

            // AGREGAR USUARIO A BASE DE DATOS MYSQL
            await usersService.addUser(queriedUser._id)

            const { _id: id, character_name, email } = queriedUser;
      
            const payload = {
              sub: id,
              character_name,
              email,
              scopes: apiKey.scopes
            };
      
            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: '15m'
            });
      
            return res.status(200).json({ token, user: { id, character_name, email } });
          }
        } else {
          res.status(404).json({
              message: 'Usuario referido no existe'
          })
        }
      } catch (error) {
        next(error);
      }
    }
  );

  router.post('/forgotten-password',
    validationHandler(forgottenPasswordSchema),
    async (req,res,next) => {
      const { apiKeyToken, ...user } = req.body

      try{
        const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

        if (!apiKey) {
          next(boom.unauthorized());
          res.status(401).json({"message": "unauthorized!"})
        }

        const { email, _id: id, character_name } = await usersService.getUserByEmail(user)

        if (!email) {
          next(boom.badRequest('Esta direccion de email no se encuentra registrada'))
          res.status(401).json({"error": "Direccion de email no registrada"})
        }

        // CREATE NEW PASSWORD
        const newHashedPassword = usersService.createHash(5)

        // CHANGE USERS PASSWORD
        const passwordChanged = await usersService.changeUserPassword(newHashedPassword,id)

        if (!passwordChanged) {
          next(boom.conflict('Error changing user password'))

          res.status(401).json({ "error": "Error changing user password" })
        }

        // EMAIL SEND
        const subject = 'HF - Cambio de contraseña'
        const message = `Hola ${character_name}! tu nueva contraseña momentánea es: \n\n${newHashedPassword}\n\nRecuerda que siempre que estés dentro del sistema, podrás cambiar la contraseña a tu preferencia pulsando el ícono de engranaje que se encuentra en la parte superior izquierda de la pantalla luego de iniciar sesión.`

        const emailSended = await mailService.mailUser(email,subject,message)

        delete newHashedPassword

        if (emailSended == []){
          res.status(401).json({"message": "Error sending the email with new password, please contact support."})
        } else {
          res.status(200).json({"message": "Password changed succesfully"})
        }
      } catch(err) {
        next(err)
      }
  })
}

module.exports = authApi;

const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

// SERVICES
const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const MailService = require('../services/mails')
const WithdrawalsService = require('../services/withdrawals')
const AdminService = require('../services/admin')

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
  const withdrawalsService = new WithdrawalsService();
  const adminService = new AdminService();

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
            expiresIn: '1d'
          });

          const { balance, referrer_balance } = await usersService.getUserByIdMySQL(id)

          const withdrawals = await withdrawalsService.getWithdrawals(id)

          return res.status(200).json({ token, user: { id, character_name, email, balance, referrer_balance }, withdrawals: withdrawals || [] });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });
  
  router.post('/sign-in-admin', async function(req, res, next) {
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

          if (apiKey.token != config.adminApi) {
            next(boom.unauthorized());
          }

          const { _id: id, character_name, email } = user;

          if (email != config.adminEmail) {
            next(boom.unauthorized());
          }

          const payload = {
            sub: id,
            character_name,
            email,
            scopes: apiKey.scopes
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '1d'
          });

          const clubStats = await adminService.getStats();

          return res.status(200).json({ token, stats: clubStats});
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
      
            const balance = 0.0000
            const referrer_balance = 0.0000

            const payload = {
              sub: id,
              character_name,
              email,
              scopes: apiKey.scopes
            };
      
            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: '1d'
            });
      
            return res.status(200).json({ token, user: { id, character_name, email, balance, referrer_balance}, withdrawals: [] });
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

        const emailSended = await mailService.sendNewPassword(character_name,email,newHashedPassword)

        delete newHashedPassword

        if (emailSended === email){
          res.status(200).json({"message": "Password changed succesfully"})
        } else {
          res.status(401).json(emailSended)
        }

      } catch(err) {
        next(err)
      }
  })
}

module.exports = authApi;

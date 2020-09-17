const Boom = require('@hapi/boom')

function validationHandler(schema, check = 'body') {
    return async function(req, res, next) {
      try{
        await schema.validateAsync(req[check])
        next()
      } catch(err) {
        next(Boom.badRequest(err.details[0].message))
      }
    };
}
  
module.exports = validationHandler;
  
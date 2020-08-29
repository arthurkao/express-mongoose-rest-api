const Boom = require('boom');
const debug = require('debug')('controller:auth');
const Joi = require('joi');

const { UserService } = require('../service');

const loginJSONSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
});


/**
 * AuthController.js
 *
 * @description:: /login related route controller
 * 1. Validate input param/req.body
 * 2. Invoke respective service
 * 3. Setup http status code and call res.send(...)
 * 3.1 throw Boom unauthorized if auth failed.
 * @type {{authenticate: Function}}
 */
module.exports = {
  authenticate: (req, res) => {
    debug('authenticate invoked');
    const userJSON = (({username, password}) => ({username, password}))(req.body);
    const result = loginJSONSchema.validate(userJSON);
    if(result.error){
      return Promise.reject(Boom.badData(result.error));
    }
    return UserService.loginUser(userJSON).then((token) => {
      debug('login succeeded, token generated: ', token);
      res.status(201).send(token);
    }, (err) => {
      // login failed
      debug('login failed, err ', err.message);
      throw Boom.unauthorized('username / password do not match');
    });
  }
};

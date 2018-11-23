const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');
const Joi = require('joi');

const { filterObjByKeys, isMongoId, ra } = require('../util');
const { UserService } = require('../service');

const UserJSONSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  email: Joi.string().email({ minDomainAtoms: 2 })
});

/**
 * UserController.js
 *
 * @description :: Controller for /user api that
 * 1. Validate input in param/req.body
 * 2. Invoke respective service to provide data
 * 3.1 Setup http status code and call res.send(...)
 * 3.2 throw Boom http error (will be handled in a custom Boom error handler middleware)
 */
module.exports = {
  /**
   * UserController.list()
   */
  list: (req, res) => {
    debug('list invoked');
    const allowed = ['filter', 'range', 'sort', 'limit', 'skip'];
    const opt = filterObjByKeys(req.query, allowed);
    return UserService.getUsers(opt)
      .then((r) => {
        const users = r.data;
        const range = opt.range;

        // add 'Content-Range' header so clients handle pagination properly.
        if (!!range && Array.isArray(range) && range.length === 2) {
          const [start, end, total] = ra.calculateContentRange(opt.range[0], opt.range[1], r.total);
          res.set('Content-Range', start + '-' + end + '/' + total);
        }
        return res.json(users);
      }, (err) => {
        throw Boom.internal('Error when finding users', err);
      });
  },

  /**
   * UserController.show()
   */
  show: (req, res) => {
    var id = req.params.id;
    debug('show invoked with id: ', id);
    if(!isMongoId(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    return UserService.getUser(id)
      .then((user) => {
        if(user){
          return res.json(user);
        } else {
          throw Boom.notFound('User not found');
        }
      }, (err) => {
        throw Boom.internal('MongoError when find user', err);
      });
  },

  /**
   * UserController.create()
   */
  create: function (req, res) {
    const allowed = ['username', 'password', 'email'];
    const userJSON = filterObjByKeys(req.body, allowed);
    debug('create invoked with userJSON: ', userJSON);
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      return Promise.reject(Boom.badData(result.error));
    }
    debug('attempt to save new User');
    return UserService.createUser(userJSON)
      .then((createdUser) => {
        return res.status(201).json(createdUser);
      }, (err) => {
        if(err.message === UserService.USER_EXIST){
          // user exists in database, likely caused by dup key(s)
          throw Boom.internal(err);
        } else {
          throw Boom.internal('Error creating user', err);
        }
      });
  },

  /**
   * UserController.update()
   */
  update: function (req, res) {
    const id = req.params.id;
    const allowed = ['username', 'password', 'email'];
    const userJSON = filterObjByKeys(req.body, allowed);
    debug('update invoked with id: ', id, 'userJSON: ', userJSON);
    if(!isMongoId(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      return Promise.reject(Boom.badData(result.error));
    }
    return UserService.updateUser(id, userJSON).then((updatedUser) => {
      return res.json(updatedUser);
    }, (err) => {
      if(err.message === UserService.USER_NOT_EXIST){
        throw Boom.notFound('User not Found');
      }else{
        throw Boom.internal('Error updating user', err);
      }
    });
  },

  /**
   * UserController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    debug('remove invoked with id: ', id);
    if(!isMongoId(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    return UserService.deleteUser(id).then((_) => {
      return res.status(204).json();
    }, (err) => {
      throw Boom.internal('Error deleting user', err);
    });
  }
};

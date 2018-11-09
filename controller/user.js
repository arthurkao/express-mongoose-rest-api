const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');
const Joi = require('joi');
const db = require('mongoose');

const { UserService } = require('../service');

const isMongoID = function(id) {
  const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(id);
};

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
    return UserService.getUsers()
      .then((users) => {
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
    if(!isMongoID(id)){
      throw Boom.badData('Invalid ID');
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
    const userJSON = (({username, password, email}) => ({username, password, email}))(req.body);
    debug('create invoked with userJSON: ', userJSON);
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      throw Boom.badData(result.error);
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
    const userJSON = (({username, password, email}) => ({username, password, email}))(req.body);
    debug('update invoked with id: ', id, 'userJSON: ', userJSON);
    if(!isMongoID(id)){
      throw Boom.badData('Invalid ID');
    }
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      throw Boom.badData(result.error);
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
    if(!isMongoID(id)){
      throw Boom.badData('Invalid ID');
    }
    return UserService.deleteUser(id).then((_) => {
      return res.status(204).json();
    }, (err) => {
      throw Boom.internal('Error deleting user', err);
    });
  }
};

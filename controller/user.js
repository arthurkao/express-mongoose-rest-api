const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');

const db = require('mongoose');
const { UserService } = require('../service');

const isMongoID = function(id) {
  const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(id);
};
// TODO 1. validate params and args with joi,
// 2. call Services(MODEL) to fulfill the REST request
// 3. setup http status code and call res.send(...)
//TODO 4. crud test case (supertest)
//TODO 5. User login logout signup (JWT token)
/**
 * UserController.js
 *
 * @description :: Controller for /user api
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
    debug('create invoked');
    const userJSON = {
      username : req.body.username,
      password : req.body.password,
      email : req.body.email

    };
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

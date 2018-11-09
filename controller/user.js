const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');

const db = require('mongoose');
const { UserService } = require('../service');

// TODO 1. validate params and args with joi,
// TODO 2. call Services(MODEL) to full fill the REST request
// TODO 3. setup http status code and call res.send(...)
//TODO: crud test case
//TODO: User login logout signup (JWT token)
/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
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
    return UserService.deleteUser(id).then((_) => {
      return res.status(204).json();
    }, (err) => {
      throw Boom.internal('Error deleting user', err);
    });
  }
};

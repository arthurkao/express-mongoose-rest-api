const _debug = require('debug');
const debug = _debug('controller:user');
const mongoose = require('mongoose');

//TODO: error handling middleware
//TODO: DI mongoose model into route handler (instead of req.db.model())
//TODO: refactor reuse CRUD code in controller
//TODO: api doc swagger like
//TODO: crud test case
//TODO: login logout signup (JWT token)
/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */
module.exports = {

  /**
   * UserController.list()
   */
  list: function (req, res) {
    debug('list invoked');
    req.db.model('User').find(function (err, Users) {
      if (err) {
        debug('error finding user model');
        return res.status(500).json({
          message: 'Error when getting User.',
          error: err
        });
      }
      return res.json(Users);
    });
  },

  /**
   * UserController.show()
   */
  show: function (req, res) {
    var id = req.params.id;
    debug('show invoked with id: ', id);
    req.db.model('User').findOne({_id: id}, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting User.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such User'
        });
      }
      return res.json(user);
    });
  },

  /**
   * UserController.create()
   */
  create: function (req, res) {
    debug('create invoked');
    const user = req.db.model('User')({
      username : req.body.username,
      password : req.body.password,
      email : req.body.email

    });
    debug('attempt to save new User');
    user.save(function (err, User) {
      if (err) {
        debug('error saving new User');
        return res.status(500).json({
          message: 'Error when creating User',
          error: err
        });
      }
      return res.status(201).json(User);
    });
  },

  /**
   * UserController.update()
   */
  update: function (req, res) {
    var id = req.params.id;
    debug('update invoked with id: ', id);
    req.db.model('User').findOne({_id: id}, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting User',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such User'
        });
      }
      user.username = req.body.username ? req.body.username : user.username;
      user.password = req.body.password ? req.body.password : user.password;
      user.email = req.body.email ? req.body.email : user.email;

      user.save(function (err, user) {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating User.',
            error: err
          });
        }

        return res.json(user);
      });
    });
  },

  /**
   * UserController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    debug('remove invoked with id: ', id);
    req.db.model('User').findByIdAndRemove(id, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the User.',
          error: err
        });
      }
      return res.status(204).json();
    });
  }
};

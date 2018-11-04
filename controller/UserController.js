const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');

//TODO: crud test case
//TODO: http args validation (joi)
//TODO: api doc swagger like
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
  list: function (req, res, next) {
    debug('list invoked');
    req.db.model('User').find(function (err, users) {
      if (err) {
        const msg = 'MongoError when finding users';
        return next(Boom.internal(msg, err));
      }
      return res.json(users);
    });
  },

  /**
   * UserController.show()
   */
  show: function (req, res, next) {
    var id = req.params.id;
    debug('show invoked with id: ', id);
    req.db.model('User').findOne({_id: id}, function (err, user) {
      if (err) {
        const msg = 'MongoError when finding user: ' + id;
        debug(msg);
        return next(Boom.internal(msg, err));
      }
      if (!user) {
        return next(Boom.notFound('User not found'));
      }
      return res.json(user);
    });
  },

  /**
   * UserController.create()
   */
  create: function (req, res, next) {
    debug('create invoked');
    const user = req.db.model('User')({
      username : req.body.username,
      password : req.body.password,
      email : req.body.email

    });
    debug('attempt to save new User');
    user.save(function (err, savedUser) {
      if (err) {
        const msg = 'MongoError when creating user';
        debug(msg);
        return next(Boom.internal(msg, err));
      }
      return res.status(201).json(savedUser);
    });
  },

  /**
   * UserController.update()
   */
  update: function (req, res, next) {
    var id = req.params.id;
    debug('update invoked with id: ', id);
    req.db.model('User').findOne({_id: id}, function (err, user) {
      if (err) {
        const msg = 'MongoError when getting user';
        return next(Boom.internal(msg, err));
      }
      if (!user) {
        return next(Boom.notFound('User not found'));
      }
      user.username = req.body.username ? req.body.username : user.username;
      user.password = req.body.password ? req.body.password : user.password;
      user.email = req.body.email ? req.body.email : user.email;

      user.save(function (err, user) {
        if (err) {
          return next(Boom.internal('MongoError when updating user', err));
        }

        return res.json(user);
      });
    });
  },

  /**
   * UserController.remove()
   */
  remove: function (req, res, next) {
    var id = req.params.id;
    debug('remove invoked with id: ', id);
    req.db.model('User').findByIdAndRemove(id, function (err, user) {
      if (err) {
        const msg = 'MongoError when deleting user';
        return next(Boom.internal(msg, err));
      }
      return res.status(204).json();
    });
  }
};

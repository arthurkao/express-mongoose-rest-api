const db = require('mongoose');
const _debug = require('debug');
const debug = _debug('service:user');

const USER_EXIST = 'USER_EXIST';
const USER_NOT_EXIST = 'USER_NOT_EXIST';
const USER_NOT_UNIQUE = 'USER_NOT_UNIQUE';
const USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH';

//TODO: remove user.password from response JSON in UserService

module.exports = {
  USER_EXIST,
  USER_NOT_EXIST,
  USER_NOT_UNIQUE,
  getUsers: () => {
    // return all Users in DB
    debug('getUsers invoked');
    return db.model('User').find().exec().then((users) => users, (err) => {
      debug('MongoError when finding users');
      throw err;
    });
  },
  getUser: (id) => {
    // return one user if found in db.
    debug('getUser invoked with id: ', id);
    return db.model('User').findById(id).exec().then((user) => user, (err) => {
      debug('MongoError when finding user by id: ', id);
      throw err;
    });
  },
  createUser: (userJSON) => {
    debug('createUser invoked with json: ', userJSON);
    const UserModel = db.model('User');
    const user = new UserModel(userJSON);
    return user.save().then(({username, email}) => ({username, email}), (err) => {
      debug('MongoError when creating user');
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Error(USER_EXIST);
      } else {
        debug('other mongo error');
        throw err;
      }
    });
  },
  updateUser: (id, userJSON) => {
    debug('updateUser invoked with id: ', id);
    // Avoid findbyIdAndUpdate because pre save hook will not be invoked that way.
    return db.model('User').findById(id).exec()
      .catch((err) => {
        debug('MongoError when finding user by id: ', id);
        throw new Error(USER_NOT_EXIST);
      })
      .then((user) => {
        if(!user) throw new Error(USER_NOT_EXIST);
        user.set(userJSON);
        return user.save();
      })
      .then(({username, email}) => ({username, email}))
      .catch((err) => {
        debug('MongoError when updating user');
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new Error(USER_NOT_UNIQUE);
        } else {
          debug('other mongo error', err);
          throw err;
        }
      });
  },
  deleteUser: (id) => {
    debug('deleteUser invoked with id: ', id);
    return db.model('User').findByIdAndRemove(id).exec().catch((err) => {
      debug('MongoError when deleting user');
      throw err;
    });
  },
  loginUser: ({username, password}) => {
    debug('loginUser invoked');
    return db.model('User').findOne({username}).exec()
      .catch((err) => {
        throw new Error(USER_NOT_EXIST);
      })
      .then((user) => {
        if(!user) throw new Error(USER_NOT_EXIST);   // user not found by username
        debug('user found by username...');
        return user.validatePassword(password).then((isMatch) => {
          if(isMatch) {
            debug('...and password matches hash');
            return user;
          }else {
            // password does not match
            debug('...but password not matching hash');
            throw new Error(USER_PASSWORD_NOT_MATCH);
          }
        } ,(err) => {
          throw new Error('MongoError when validating user password', err);
        });
      })
      .then((user) => {
        // lastly generate a JWT
        return user.generateJWT(['username', 'email'], process.env.JWT_TTL);
      });
  }
};
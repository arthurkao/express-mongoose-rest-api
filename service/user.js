const db = require('mongoose');
const _debug = require('debug');
const debug = _debug('service:user');

const { User } = require('../model');

const USER_EXIST = 'USER_EXIST';
const USER_NOT_EXIST = 'USER_NOT_EXIST';
const USER_NOT_UNIQUE = 'USER_NOT_UNIQUE';
const USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH';

function buildGetUsersQuery({filter, sort, skip, limit}, count=false) {
  let query = User.find();
  if(filter){
    query = query.where('username', { $regex: filter });
  }
  if(count) {
    return query;
  }
  if(sort){
    query = query.sort(sort);
  }
  if(skip){
    query = query.skip(Number(skip));
  }
  if(limit){
    query = query.limit(Number(limit));
  }
  return query;
}

module.exports = {
  USER_EXIST,
  USER_NOT_EXIST,
  USER_NOT_UNIQUE,
  USER_PASSWORD_NOT_MATCH,
  getUsers: (opt = {}) => {
    debug('getUsers invoked');
    const fetchUsers =  buildGetUsersQuery(opt);
    const countUsers = buildGetUsersQuery(opt, true).countDocuments();
    return Promise.all([fetchUsers.exec(), countUsers.exec()])
      .then(values => ({
        data: values[0],
        total: values[1]
      }))
      .catch(err => {
        debug('MongoErr when finding users: ', err);
        throw err;
      });
  },
  getUser: (id) => {
    // return one user if found in db.
    debug('getUser invoked with id: ', id);
    return User.findById(id).exec()
      .catch((err) => {
        debug('MongoError when finding user by id: ', id);
        throw err;
      });
  },
  createUser: (userJSON) => {
    debug('createUser invoked with json: ', userJSON);
    const user = new User(userJSON);
    return user.save().catch((err) => {
      debug('MongoError when creating user');
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Error(USER_EXIST);
      } else {
        debug('MongoError ', err);
        throw err;
      }
    }).then((user) => {
      let userJSON = user.toJSON();
      if(!!userJSON.password) delete userJSON.password;
      return userJSON;
    });
  },
  updateUser: (id, userJSON) => {
    debug('updateUser invoked with id: ', id);
    if(!!userJSON.id) {
      delete userJSON.id;
    }
    // Avoid findByIdAndUpdate because pre save hook will not be invoked that way.
    return User.findById(id).exec()
      .catch((err) => {
        debug('MongoError when finding user by id: ', id);
        throw new Error(USER_NOT_EXIST);
      })
      .then((user) => {
        if(!user) throw new Error(USER_NOT_EXIST);
        user.set(userJSON);
        return user.save();
      })
      .catch((err) => {
        debug('MongoError when updating user');
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new Error(USER_NOT_UNIQUE);
        } else {
          debug('MongoError ', err);
          throw err;
        }
      })
      .then((user) => {
        let userJSON = user.toJSON();
        if(!!userJSON.password) delete userJSON.password;
        return userJSON;
      });
  },
  deleteUser: (id) => {
    debug('deleteUser invoked with id: ', id);
    return User.findByIdAndRemove(id).exec().catch((err) => {
      debug('MongoError ', err);
      throw err;
    });
  },
  loginUser: ({username, password}) => {
    debug('loginUser invoked');
    return User.findOne({username}).select('+password').exec()
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
          debug('MongoError when validating user password', err);
          throw err;
        });
      })
      .then((user) => {
        // lastly generate a JWT
        return user.generateJWT(['username', 'id'], process.env.JWT_TTL);
      });
  }
};

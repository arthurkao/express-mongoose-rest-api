const db = require('mongoose');
const _debug = require('debug');
const debug = _debug('service:user');

const USER_EXIST = 'USER_EXIST';
const USER_NOT_EXIST = 'USER_NOT_EXIST';
const USER_NOT_UNIQUE = 'USER_NOT_UNIQUE';
const USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH';

function buildGetUsersQuery({filter, sort, skip, limit}, count=false) {
  let query = db.model('User').find();
  if(filter && !!filter.q){
    // filter.q is the query string to match any part inside username
    //debug('filter: ', filter);
    query = query.where('username', { $regex: filter.q });
  }
  if(count) {
    return query;
  }
  if(sort){
    query = query.sort(sort);
  }
  if(skip){
    query = query.skip(skip);
  }
  if(limit){
    query = query.limit(limit);
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
    const fetchUsers =  buildGetUsersQuery(opt).select('-password');
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
    return db.model('User').findById(id).select('-password').exec()
      .catch((err) => {
        debug('MongoError when finding user by id: ', id);
        throw err;
      });
  },
  createUser: (userJSON) => {
    debug('createUser invoked with json: ', userJSON);
    const UserModel = db.model('User');
    const user = new UserModel(userJSON);
    return user.save().catch((err) => {
      debug('MongoError when creating user');
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Error(USER_EXIST);
      } else {
        debug('MongoError ', err);
        throw err;
      }
    });
  },
  updateUser: (id, userJSON) => {
    debug('updateUser invoked with id: ', id);
    if(!!userJSON.id) {
      delete userJSON.id;
    }
    // Avoid findByIdAndUpdate because pre save hook will not be invoked that way.
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
      .catch((err) => {
        debug('MongoError when updating user');
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new Error(USER_NOT_UNIQUE);
        } else {
          debug('MongoError ', err);
          throw err;
        }
      });
  },
  deleteUser: (id) => {
    debug('deleteUser invoked with id: ', id);
    return db.model('User').findByIdAndRemove(id).exec().catch((err) => {
      debug('MongoError ', err);
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
          debug('MongoError when validating user password', err);
          throw err;
        });
      })
      .then((user) => {
        // lastly generate a JWT
        return user.generateJWT(['username', 'email'], process.env.JWT_TTL);
      });
  }
};
const db = require('mongoose');
const _debug = require('debug');
const debug = _debug('service:user');

const USER_EXIST = 'USER_EXIST';
const USER_NOT_EXIST = 'USER_NOT_EXIST';
const USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH';

const ONE_WEEK = '1w';

module.exports = {
  USER_EXIST,
  USER_NOT_EXIST,
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

    // hash password with salt then save the password hash to DB
    return db.model('User').encryptPassword(userJSON.password).then((passwordHash) => {
      userJSON.password = passwordHash;
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
    });


  },
  updateUser: (id, userJSON) => {
    debug('updateUser invoked with id: ', id);
    return db.model('User').findByIdAndUpdate(id, userJSON, {'new': true }).exec()
      .then((user) => {
      if (user){
        return user;
      } else{
        throw new Error(USER_NOT_EXIST);
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
        debug('user found by email...');
        //debug('password: ', password);
        //debug('hash: ', user.password);

        // validate submitted password against password hash stored in db
        return db.model('User').validatePassword(password, user.password)
          .then((isMatch) => {
            if(isMatch) {
              debug('...and password matches hash');
              return user;
            }else {
              // password does not match
              debug('...but password not matching hash');
              throw new Error(USER_PASSWORD_NOT_MATCH);
            }
          });
      })
      .then((user) => {
        // lastly generate a JWT
        return user.generateJWT(['username', 'email'], process.env.TTL || ONE_WEEK);
      });



















  }
};
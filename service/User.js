const db = require('mongoose');
const _debug = require('debug');
const debug = _debug('db:user');

const USER_EXIST = 'USER_EXIST';
const USER_NOT_EXIST = 'USER_NOT_EXIST';

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
    const UserModel = db.model('User');
    const user = new UserModel(userJSON);
    return user.save().then((createdUser) => createdUser, (err) => {
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
  }
};
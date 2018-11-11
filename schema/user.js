const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'myJWTsecret';
const debug = require('debug')('db:user');

var UserSchema = new mongoose.Schema({
  'username' : { type: String, required: true, trim: true, unique: true, index: true  },
  'password' : { type: String, required: true },
  'email' : { type: String, unique: true, index: true }
});

UserSchema.statics.encryptPassword = function(password) {
  return bcrypt.hash(password, 8)
};

UserSchema.statics.validatePassword = function (password, hash) {
  //compare (submitted) password against (stored) hash
  return bcrypt.compare(password, hash);
};

UserSchema.methods.generateJWT = function(fields = ['username'], ttl = '30s') {
  const user = this;
  const opts = { expiresIn: ttl };
  let payload = {};
  fields.forEach((key) => {
    const value = user.get(key);
    if(value)
      payload[key] = value;
  });
  debug('payload: ', payload);
  const p = new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, opts, (err, token) => {
      if(err){
        return reject(err);
      }
      return resolve({ token });
    });
  });
  return p;
};

module.exports = UserSchema;

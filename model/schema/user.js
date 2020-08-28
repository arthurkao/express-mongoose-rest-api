const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'myJWTsecret';
const debug = require('debug')('db:user');

var UserSchema = new mongoose.Schema({
  'username' : { type: String, required: true, trim: true, unique: true, index: true  },
  'password' : { type: String, required: true, select: false },
  'email' : { type: String, unique: true, index: true }
},{
  timestamps: true,
  toJSON: { getters: true } // id field is defined in getters (not stored in mongo doc)
});

//compare (submitted) password against (stored) hash
UserSchema.methods.validatePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateJWT = function(fields = ['username'], ttl = '1w') {
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

/**
 * pre save hook to hash the clear text password
 */
UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // hash the password with bcrypt generated salt
  bcrypt.hash(user.password, 8, function(err, hash) {
    if (err) return next(err);

    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});

module.exports = UserSchema;

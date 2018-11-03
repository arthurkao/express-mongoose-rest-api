var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  'username' : { type: String, required: true, trim: true, unique: true, index: true  },
  'password' : { type: String, required: true },
  'email' : { type: String, unique: true, index: true }
});

module.exports = UserSchema;

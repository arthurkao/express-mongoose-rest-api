const mongoose = require('mongoose');
const { mongooseSchema: UserSchema } = require('./schema/user');
module.exports = mongoose.model('User', UserSchema);

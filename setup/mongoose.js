const timestamp = require('mongoose-timestamp');
const _debug = require('debug');

const debug = _debug('setup:mongoose');
const mongoURI = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT;
const options = {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};
const UserSchema = require('../schema/UserModel');

module.exports = {
  connect: (mongoose) => {
    debug('connecting to mongodb...');
    return mongoose.createConnection(mongoURI, options).then((conn) => {
      debug('connected to mongodb, readyState', conn.readyState);
      return conn;
    })
      .catch(() => debug('failed to connect to mongodb, readyState, ', mongoose.connection.readyState));
  },
  setup: (mongoose) => {
    debug('setting up mongoose globals...');
    mongoose.Promise = global.Promise;
    debug('registering timestamp plug-in...');
    mongoose.plugin(timestamp);
    debug('registering mongoose models...');
    mongoose.model('User', UserSchema);
  }
};
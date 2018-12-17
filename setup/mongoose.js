const debug = require('debug')('setup:mongoose');
const timestamp = require('mongoose-timestamp');
const mongoose = require('mongoose');

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

const  connect = () => {
    debug('connecting to mongodb...');
    return mongoose.connect(mongoURI, options).then((mongoose) => {
      debug('connected to mongodb, readyState', mongoose.connection.readyState);
      debug('if accessed through package, readyState', require('mongoose').connection.readyState);
      return mongoose.connection;
    })
      .catch(() => debug('failed to connect to mongodb, readyState, ', mongoose.connection.readyState));
  };
const  setup = () => {
    debug('setting up mongoose globals...');
    mongoose.Promise = global.Promise;
    debug('registering global plug-in...');
    mongoose.plugin(timestamp);
  };

module.exports = {
  init: () => {
    setup();
    return connect();
  }
};


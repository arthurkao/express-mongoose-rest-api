const _debug = require('debug');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');

const debug = _debug('setup:express');
module.exports = function(app){
  debug('setup express middleware');
  //***** setup server middleware *****
  app.use(morgan('dev', {
    skip: function (req, res) {
      return res.statusCode < 400
    }, stream: process.stderr
  }));

  app.use(morgan('dev', {
    skip: function (req, res) {
      return res.statusCode >= 400
    }, stream: process.stdout
  }));
// parse body params and attache them to req.body
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compress());
  app.use(methodOverride());

// secure apps by setting various HTTP headers
  app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
  app.use(cors());
};
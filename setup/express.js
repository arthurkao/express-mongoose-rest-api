const _debug = require('debug');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const Boom = require('boom');

const debug = _debug('setup:express');
const route = require('../route');

const corsOpts = {
  exposedHeaders: ['Content-Range']
};

module.exports = {
  middleWare: (app) => {
    debug('setup middleware');
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
    app.use(cors(corsOpts));

  },
  routes: (app) => {
    debug('setup routes');
    // setup /api routes
    app.use('/api', route);

    // setup other (static) routes
    app.get('/', (req, res) => res.send('Express-Mongoose-Rest-Api'));

    // the catch all route
    app.all('*', (req, res) => res.status(404).send('Page Not Found'));
  },
  errorHandlers: (app) => {
    debug('setup custom error handlers');
    // express-jwt error handler
    app.use((err, req, res, next) => {
      if(err.name === 'UnauthorizedError'){
        _debug('app:error')('handling express-jwt error...');
        return next(Boom.unauthorized('protected route'));
      }
      return next(err);
    });
    // boom error handler
    app.use((err, req, res, next) => {
      const debug = _debug('app:error');
      debug('boom error handler invoked');
      if(Boom.isBoom(err)){
        debug('handling boom error...');
        if (err.isServer) {
          // log the error...
          debug('err.message: ', err.message);
        }
        return res.status(err.output.statusCode).json(err.output.payload);
      }
      // let default error handler manage other non-api errors
      return next(err);
    });
  }
};
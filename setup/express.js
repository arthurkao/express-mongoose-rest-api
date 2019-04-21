const _debug = require('debug');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const Boom = require('boom');

const debug = _debug('setup:express');
const route = require('../route');
const parseReqQueryObject = require('../route/middleware/parseReqQuery');

// grab a "clean" express app
const app = express();

const setupMorgan = (app, env = 'dev') => {
  const logErrorToStderr = morgan('dev', {
    skip: function (req, res) {
      return res.statusCode < 400
    }, stream: process.stderr
  });
  const logToStdout = morgan('dev', {
    skip: function (req, res) {
      return res.statusCode >= 400
    }, stream: process.stdout
  });
  switch(env) {
    case 'dev':
      app.use(logErrorToStderr);
      app.use(logToStdout);
      break;
    case 'test':
    case 'prod':
    default:
  }
};

const swaggerRoute = () => {
  const router = express.Router();
  const swaggerUi = require('swagger-ui-express');   //serve swagger-ui via swagger-ui-dist
  const swaggerJSDoc = require('swagger-jsdoc');     //extract api info from respective route JSDoc
  const options = {
    definition: {
      openapi: '3.0.2', // Specification (optional, defaults to swagger: '2.0')
      info: {
        title: process.env.npm_package_name,         // Title (required)
        version: process.env.npm_package_version     // Version (required)
      },
      servers:[{ url: '/api' }]                      // basePath
    },
    // Path to the API docs
    apis: ['./route/*.js']
  };

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerSpec = swaggerJSDoc(options);

  router.use(swaggerUi.serve);
  router.get('/', swaggerUi.setup(swaggerSpec));
  return router;
};

function middlewares(app) {
  debug('setup middleware');

  setupMorgan(app, process.env.NODE_ENV);
  // parse body params and attache them to req.body
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compress());
  app.use(methodOverride());

  // secure apps by setting various HTTP headers
  app.use(helmet());

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());

  // JSON.parse req.query
  app.use(parseReqQueryObject);

}

function routes(app) {
  debug('setup routes');
  // setup /api routes
  app.use('/api', route);

  // setup other (static) routes
  app.use('/', swaggerRoute());

  // the catch all route
  app.all('*', (req, res) => res.status(404).send('Page Not Found'));
}

function errorHandlers(app) {
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

// inverse of control: pass app into those app-enhancers
middlewares(app);
routes(app);
errorHandlers(app);
module.exports = app;

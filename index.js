const express = require('express');
const _debug = require('debug');

const debug = _debug('init');
const app = express();
const PORT = process.env.PORT || 3000;

//***** setup express server *****
require('./setup/express')(app);

//***** setup MongoDB connection *****
require('./setup/mongoose')(app).then(() => {
  //***** setup api routes *****
  app.get('/', (req, res) => res.send('Hello World!'));

  app.listen(PORT, () => debug('express server listening on port ' + PORT));
}).catch((err) => debug('error establishing mongodb connection'));


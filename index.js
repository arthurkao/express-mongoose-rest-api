const express = require('express');
const mongoose = require('mongoose');
const _debug = require('debug');

const debug = _debug('init');
const PORT = process.env.PORT || 3000;
const serverUtil = require('./setup/express');
const dbUtil = require('./setup/mongoose');

const app = express();

// ***** setup/connect mongoose *****
dbUtil.init()
  .then(() => {
    // ***** bring up express *****
    serverUtil.middleWare(app);
    serverUtil.routes(app);
    serverUtil.errorHandlers(app);
    app.listen(PORT, () => debug('express server listening on port ' + PORT));
  }, (err) => debug('error establishing mongodb connection'))
  .catch(() => debug('error establishing express api server'));





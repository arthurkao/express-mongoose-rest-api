const _debug = require('debug');
const debug = _debug('init');
const PORT = process.env.PORT || 3000;
const dbUtil = require('./setup/mongoose');
const createServer = require('./setup/express');

// init db, connect db, create (init + setup) express
dbUtil.init().then(() => {
  // ***** start up express *****
  createServer().listen(PORT, () => debug('express server listening on port ' + PORT));
})


//TODO readme.md

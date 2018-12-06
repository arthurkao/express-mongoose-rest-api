const _debug = require('debug');
const debug = _debug('init');
const PORT = process.env.PORT || 3000;
const dbUtil = require('./setup/mongoose');
const app = require('./setup/express');

// ***** setup/connect mongoose *****
dbUtil.init().then(() => {
  // ***** start up express *****
  app.listen(PORT, () => debug('express server listening on port ' + PORT));
});


//TODO readme.md
//TODO test: decouple db/app setup from unit test
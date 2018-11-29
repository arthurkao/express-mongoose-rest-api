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


//TODO /api doc (swagger) => readme.md
//TODO test: util unit test
//TODO test: integration test
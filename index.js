const express = require('express');
const _debug = require('debug');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');

const debug = _debug('init');
const app = express();


//***** setup express server *****
require('./setup/express')(app);

//***** setup MongoDB connection *****
require('./setup/mongoose')(app).then(() => {
  //***** setup api routes *****

  const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => {
  debug('express server listening on port ' + PORT);
});
}).catch((err) => {
  debug('error establishing mongodb connection')
});


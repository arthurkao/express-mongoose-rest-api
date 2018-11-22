const { parseExpressQueryObj } = require('../../util');
module.exports = function (req, res, next) {
  Object.assign(req.query, parseExpressQueryObj(req.query));
  next();
};
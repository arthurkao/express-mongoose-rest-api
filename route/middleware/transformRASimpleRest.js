const { ra } = require('../../util');
module.exports = function (req, res, next) {
  Object.assign(req.query, req.query, ra.transformQuery(req.query));
  next();
};
const express = require('express');
const Boom = require('boom');

const { AuthController } = require('../controller');

//express router instance to define all /api/* routes
const router = express.Router();
/**
 * middleware to filter out requests other than 'application/json'
 */
router.use((req, res, next) => {
  const contentType = req.headers['content-type'];
  return contentType != 'application/json'?
    next(Boom.unsupportedMediaType("Expect application/json")): next();
});

// ***** register /api routes here *****
// /api/* routes
router.post('/login', (req, res, next) => {
  AuthController.authenticate(req, res).catch(next);
});
// /api/user/* routes
router.use('/user', require('./user'));


// all other untended /api/ routes
router.all('*', (req, res) => (res.status(404).json({
  'message': 'API Not Found'
})));

module.exports = router;

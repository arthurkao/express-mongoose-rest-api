/**
 * Controller layer:
 *
 * Controller, in MVC convention, is express route handler implemented using promise.
 * It is the interface between http (outer facing) API and data service (inner facing) API
 * Route exits controller layer via res.status(...).json.(...) or Boom http error is thrown when exception occurs.
 * No database access in this layer.
 */
const UserController = require('./user');
const AuthController = require('./auth');
module.exports = {
  AuthController,
  UserController
};
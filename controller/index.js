/**
 * Controller layer:
 *
 * Controller, in MVC convention, is express route handler implemented using promise.
 * It is the interface between http (outer facing) API and data service (inner facing) API
 * No database access in this layer.
 */
const UserController = require('./user');
module.exports = {
  UserController
};
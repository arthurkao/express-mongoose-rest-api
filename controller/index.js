/**
 * Controller layer:
 *
 * Controller, in MVC convention, is express route handler implemented using promise.
 * It is the interface between http (outer facing) API and data service (inner facing) API
 * Route exits controller layer via res.status(...).json.(...) or Boom http error is thrown when exception occurs.
 * No database access in this layer.
 *
 * exports all the controllers defined in this dir, e.g.
 * {
 *   AuthController,
 *   UserController
 * }
 */
let obj = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  const filePath = __dirname + '/' + file;
  let property;

  // exclude this index.js file and include other *.js files
  if(filePath.indexOf('index') === -1 && filePath.indexOf('.js') !== -1){
    property = file.charAt(0).toUpperCase() + file.substring(1, file.length-3) + 'Controller';
    obj[property] = require(filePath);
  }
});
module.exports = obj;
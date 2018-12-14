/**
 * Model layer:
 * Model in MVC convention where business logic is defined.
 *
 * exports all the services defined in this dir, e.g.
 * {
 *   UserService
 * }
 */
let obj = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  const filePath = __dirname + '/' + file;
  let property;

  // exclude this index.js file and include other *.js files
  if(filePath.indexOf('index') === -1 && filePath.indexOf('.js') !== -1){
    property = file.charAt(0).toUpperCase() + file.substring(1, file.length-3) + 'Service';
    obj[property] = require(filePath);
  }
});
module.exports = obj;
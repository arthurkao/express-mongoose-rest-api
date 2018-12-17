/**
 * ORM layer:
 *
 * Model (a mongoose abstraction to interact with mongo doc) of each underlying mongo collections are defined in
 * respective ./{collectionName}.js files. A model is composed by one or a few mongoose Schema defined in ./schema/*.js
 *
 * Services should use these exposed models to interact with mongodb.
 */
let obj = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  const filePath = __dirname + '/' + file;
  let property;

  // exclude this index.js file and include other *.js files
  if(filePath.indexOf('index') === -1 && filePath.indexOf('.js') !== -1){
    property = file.charAt(0).toUpperCase() + file.substring(1, file.length-3);
    obj[property] = require(filePath);
  }
});
module.exports = obj;
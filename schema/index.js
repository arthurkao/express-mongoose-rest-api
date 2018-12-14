const mongoose = require('mongoose');

/**
 * ORM layer:
 *
 * Schemas of each underlying mongo collections are defined in respective {collectionName}.js files
 * Models (a mongoose abstraction to interact with mongo doc) are loaded here during server bootstrap
 *
 * loadAllModels defined in this dir, e.g.
 *
 * mongoose.model('User', require('./user'));
 */
function loadAllModels() {
  require('fs').readdirSync(__dirname).forEach((file) => {
    const filePath = __dirname + '/' + file;
    let model;
    // exclude this index.js file and include other *.js files
    if(filePath.indexOf('index') === -1 && filePath.indexOf('.js') !== -1){
      model = file.charAt(0).toUpperCase() + file.substring(1, file.length-3);

      // register mongoose schemas here
      mongoose.model(model, require(filePath));
    }
  });
}
module.exports = loadAllModels;
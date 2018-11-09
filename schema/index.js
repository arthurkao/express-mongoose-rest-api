const mongoose = require('mongoose');

/**
 * ORM layer:
 *
 * Schemas of each underlying mongo collections are defined in respective {collectionName}.js files
 * Models (a mongoose abstraction to interact with mongo doc) are loaded here during server bootstrap
 */
function loadModels() {
  mongoose.model('User', require('./user'));
}
module.exports = loadModels;
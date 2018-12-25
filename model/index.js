/**
 * ORM layer:
 *
 * Model (a mongoose abstraction to interact with mongo doc) of each underlying mongo collections are defined here.
 * A model is composed by one or a few mongoose Schema defined in ./schema/*.js and is selectively exposed here.
 * e.g. "base" models upon which a few mongoose discriminator defined are not made public.
 *
 * Services should use models exported here to interact with mongodb.
 */
const UserModel = require('./user');
module.exports = {
  User: UserModel
};
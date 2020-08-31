require('dotenv').config({ path: './test/.env' });
const chai = require('chai');

console.log('Mocha: Setup globals...');
console.log('NODE_ENV: ', process.env.NODE_ENV);
global.should = chai.should();
global.expect = chai.expect;
chai.use(require("chai-sorted"));

module.exports = {
  /**
   * login helper for routes/requests requiring login. Promise resolves a valid token.
   * @param server: express instance under test
   * @param uri: login api path
   * @param user: object contains username, password fields.
   * @returns {Promise<String>}
   */
  login(server, uri, user) {
    return new Promise(function(resolve, reject) {
      require('supertest')(server).post(uri).send(user).set('Content-Type', 'application/json').end((err, res) => {
        if(err || !res.body.token) return reject(err);
        return resolve(res.body.token)
      });
  });
  }
};

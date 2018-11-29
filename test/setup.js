require('dotenv').config({ path: './test/.env' });
const chai = require('chai');
const dbUtil = require('../setup/mongoose');
let db, userFixture;

console.log('Mocha global setup...');
console.log('NODE_ENV: ', process.env.NODE_ENV);
console.log('DB_NAME: ', process.env.DB_NAME);
global.should = chai.should();
global.expect = chai.expect;
chai.use(require("chai-sorted"));

function rebuildAllIndexes (db) {
  return Promise.all(db.modelNames().map((mName) => (db.model(mName).createIndexes())));
}

/**
 * Establish test db connection.
 * This code should be executed exactly once per test.
 */
before(function(){
  return dbUtil.init().then(conn => {
    db = conn;
    //console.log('readyState: ', conn.readyState);
    if(conn.readyState != 1){
      return Promise.reject('error connecting to test db');
    }
  })
});

/**
 * In each test case, each 'it' clause, test db is
 * 1. dropped
 * 2. each collection's indexes rebuilt
 * 2. fresh test fixture populated
 */
beforeEach(function() {
  userFixture = require('./fixture/user');
  return db.dropDatabase().then(() => {
    return rebuildAllIndexes(db);
    //return db.model('User').createIndexes();
  }).then(() => {
    return db.model('User').insertMany(userFixture);
  });
});

/**
 * Clean up database by dropping it after all tests are completed then close db connection
 * Note that due to db.close() doest not return a promise, done syntax is used here.
 * This code should be executed exactly once per test.
 */
after(function(done) {
  db.dropDatabase().then(() => {
    db.close(done);
  });
});

describe('Bootstrap mongodb', function() {
  it('should dynamically create test fixture(s) once per test', function(){
    const newUserFixture = require('./fixture/user');
    newUserFixture.should.deep.equal(userFixture);
  });
  it('should populate db with fixture data', function() {
    return db.model('User').countDocuments().exec().then((total) => {
      expect(total > 0).to.be.true;
    })
  });
});
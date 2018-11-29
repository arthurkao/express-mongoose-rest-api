const request = require('supertest');
const db = require('mongoose');
const app = require('../../../setup/express');

const mount = '/api/user';
// this user exists in test fixutre data
const validUser = {
  username: 'testusername',
  password: 'testpassword'
};

let url;

/**
 * login helper for those routes requiring login
 * resolves a valid token.
 * @returns {Promise|*}
 */
function login () {
  return new Promise(function(resolve, reject) {
    request(app)
      .post('/api/login')
      .send(validUser)
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if(err || !res.body.token) return reject(err);
        return resolve(res.body.token)
      });
  });
}

describe('/api/user routes', function() {
  describe('GET /user', function() {
    it('should fetch all users w/o password info', function(done){
      url = mount;
      const userFixture = require('../../fixture/user')
        .map((user) => (user.username));
      request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .expect(function(res) {
          const users = res.body;
          users.should.exist;
          users.should.be.a('array');
          userFixture.should.have.members(users.map((user) => (user.username)));
          users[0].should.not.have.key('password');
          //test if resources returns matches what's stored in db
        })
        .expect(200, done);
    });
    it('should handle pagination query', function(done) {
      url = mount;
      const userFixture = require('../../fixture/user')
        .map((user) => (user.username));
      const start = 2, end = 11;
      request(app)
        .get(url)
        .query({range: [start, end]})
        .set('Content-Type', 'application/json')
        .expect(function (res){
          const users = res.body.map((user) => (user.username));
          users.should.have.length(end - start + 1);
          userFixture.should.include.members(users);
          //test if resource returned is a subset of what's stored in db
        })
        .expect('Content-Range', /^user \d+-\d+\/\d+$/)
        .expect(200, done);
    });
    it('should handle sort query', function(done) {
      url = mount;
      request(app)
        .get(url)
        .query({ sort: ['username', 'DESC'] })
        .set('Content-Type', 'application/json')
        .expect(function (res){
          const users = res.body.map((user) => (user.username));
          users.should.be.sorted({descending: true});
          //test if resource returned is sorted correctly
        })
        .expect(200, done);
    });
    it('should handle filter query', function(done) {
      const querystr = 'a';
      const userFixture = require('../../fixture/user')
        .map((user) => (user.username))
        .filter((username) => (new RegExp(querystr).test(username)));
      request(app)
        .get(url)
        .query({ filter: { q: querystr } })
        .set('Content-Type', 'application/json')
        .expect(function (res){
          const users = res.body;
          users.should.be.a('array');
          users.should.have.length(userFixture.length);
        })
        .expect(200, done);
    })
  });
  describe('GET /user/:id', function() {
    let validId;
    beforeEach(function(){
      return db.model('User').findOne({}).exec().then((user) => {
        validId = user.get('id');
      });
    });
    it('should fetch one user given valid id param', function(done) {
      url = mount + '/' + validId;
      request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .expect(function (res){
          const user = res.body;
          user.should.exist;
          user.id.should.exist;
          user.id.should.equal(validId);
        })
        .expect(200, done);
    });
    it('should respond with 422 bad data code if supplied invalid mongo id', function(done) {
      url = mount + '/' + 'incorrectId123';
      request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .expect(422, done);
    });
    it('should respond with 404 code if user is not found by supplied id', function(done) {
      const aValidMongoId = '5be9c1a6cae53662251bdc2a';
      url = mount + '/' + aValidMongoId;
      request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .expect(404, done);
    });
  });
  describe('CREATE /user', function() {
    let userJSON, token;
    beforeEach(function() {
      userJSON = {
        username: 'newtestusername',
        password: 'newtestpassword',
        email: 'test@gmail.com'
      };
      return login().then((t) => {
        token = t;
      });
    });
    it('should be login protected', function(done) {
      url = mount;
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .send(userJSON)
        .expect(401, done);
    });
    it('should create one user given well-formed data', function(done) {
      url = mount;
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(userJSON)
        .expect(function(res) {
          const user = res.body;
          user.should.exist;
          user.id.should.exist;
          expect(user.password).to.be.undefined;
          user.username.should.equal(userJSON.username);
          user.email.should.equal(userJSON.email);
        })
        .expect(201, done);
    });
    it('should not create user if username is missing and respond with 422 code', function(done) {
      url = mount;
      delete userJSON.username;
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(userJSON)
        .expect(422, done);
    });
    it('should not create user if password is missing and respond with 422 code', function(done) {
      url = mount;
      delete userJSON.password;
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(userJSON)
        .expect(422, done);
    });
    it('should not create user if user exists in db and respond with 500 code', function(done) {
      url = mount;
      userJSON.username = 'testusername'; //testusername exists in test fixture
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(userJSON)
        .expect(500, done);
    });
  });
  describe('UPDATE /user/:id', function() {
    let token, existUser, existUserId, updatedUser;
    beforeEach(function () {
      updatedUser = {
        username: 'updatedusername',
        password: 'updatedpassword',
        email: 'updated@gmail.com'
      };
      return db.model('User').findOne({ username: { $ne: 'testusername' }}).exec()
        .then((user) => {
          existUserId = user.get('id');
          existUser = user.toObject();
        })
        .then(login)
        .then((t) => (token = t));
    });
    it('should be login protected', function(done) {
      url = mount;
      request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .send(updatedUser)
        .expect(401, done);
    });
    it('should update one user given well-formed data', function (done) {
      url = mount + '/' + existUserId;
      request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)
        .expect(200)
        .end(function(err, res) {
          expect(err).is.null;
          // check db to see the user was in fact updated
          db.model('User').findById(existUserId).lean().exec()
            .then((user) => {
              user.username.should.exist;
              user.email.should.exist;
              user.username.should.equal(updatedUser.username);
              user.username.should.not.equal(existUser.username);
              user.email.should.equal(updatedUser.email);
              user.email.should.not.equal(existUser.email);
              done();
            });
        });
    });
    it('should respond with 422 bad data code if supplied invalid mongo id', function(done) {
      url = mount + '/' + 'incorrectId123';
      request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)
        .expect(422, done);
    });
    it('should respond with 404 code if user is not found', function(done) {
      const aValidMongoId = '5be9c1a6cae53662251bdc2a';
      url = mount + '/' + aValidMongoId;
      request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)
        .expect(404, done);
    });
    it('should respond with 422 bad data code given ill-formed data', function(done) {
      updatedUser = {
        username: '',
        email: ''
      };
      url = mount + '/' + existUserId;
      request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)
        .expect(422, done);
    });
    describe('in case of key collision', function() {
      let duplicateUser;
      beforeEach(function() {
        return db.model('User').findOne({ username: 'testusername' }).lean().exec()
          .then((user) => (duplicateUser = user));
      });
      it('should not update user if intended username is taken and respond with 500 code', function(done) {
        url = mount + '/' + existUserId;
        updatedUser.username = duplicateUser.username;
        request(app)
          .put(url)
          .set('Content-Type', 'application/json')
          .set('Authorization', 'bearer ' + token)
          .send(updatedUser)
          .expect(500, done);
      });
      it('should not update user if intended email is taken and respond with 500 code', function(done) {
        url = mount + '/' + existUserId;
        updatedUser.email = duplicateUser.email;
        request(app)
          .put(url)
          .set('Content-Type', 'application/json')
          .set('Authorization', 'bearer ' + token)
          .send(updatedUser)
          .expect(500, done);
      });
    });
  });
  describe('DELETE /user/:id', function() {
    let id, token;
    beforeEach(function() {
      return db.model('User').findOne({}).exec()
        .then((user) => {
          id = user.get('id');
        })
        .then(login)
        .then((t) => {
          token = t;
        });
    });
    it('should be login protected', function(done) {
      url = mount + '/' + id;
      request(app)
        .delete(url)
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
    it('should delete one user if user is found in db', function(done){
      token.should.exist;
      url = mount + '/' + id;
      request(app)
        .delete(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .expect(204)
        .end(function() {
           db.model('User').findById(id, (user) => {
             expect(user).is.null;
             db.model('User').countDocuments((err, total) => {
               // assert that the user given id is indeed removed from db
               expect(total).to.equal(require('../../fixture/user').length - 1);
               done();
             });
           });
        });
    });
    it('should respond with 422 bad data code if supplied invalid mongo id', function(done) {
      token.should.exist;
      url = mount + '/' + 'incorrectId123';
      request(app)
        .delete(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .expect(422, done);
    });
    it('should swallow request if user is not found in db', function(done) {
      token.should.exist;
      id = '5be9c1a6cae53662251bdc2a';
      url = mount + '/' + id;
      request(app)
        .delete(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + token)
        .expect(204)
        .end(function() {
          db.model('User').findById(id, (user) => {
            expect(user).is.null;
            db.model('User').countDocuments((err, total) => {
              // assert that the total number of user in db is unchanged.
              expect(total).to.equal(require('../../fixture/user').length);
              done();
            });
          });
        });
    });
  });
});
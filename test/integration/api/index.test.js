const request = require('supertest');
const db = require('mongoose');
const app = require('../../../setup/express');

const mount = '/api';
let url;

describe('/api routes', function() {
  it('should accept application/json request', function(done) {
    url = mount;
    request(app)
      .get(url)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });
  it('should respond with 415 code to other unsupported media types', function(done) {
    url = mount;
    request(app)
      .get(url)
      .set('Content-Type', 'text/html')
      .expect(415, done);
  });
  describe('GET /undefined', function() {
    it('should respond with 404 error code and json message', function(done) {
      url = mount + '/somerandomundefinedroute';
      request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .expect(function(res){
          const message = res.body.message;
          message.should.exist;
          message.should.equal('API Not Found');
        })
        .expect(404, done);
    });
  });
  describe('POST /login', function() {
    const validUser = {
      username: 'testusername',
      password: 'testpassword'
    };
    it('should login valid user and return a JWT token', function(done) {
      url = mount + '/login';
      request(app)
        .post(url)
        .send(validUser)
        .set('Content-Type', 'application/json')
        .expect(function(res) {
          const token = res.body.token;
          token.should.exist;
          token.should.not.be.empty;

        })
        .expect(201, done);
    });
    it('should reject invalid user and respond with 401 code', function(done) {
      const inValidUser = {
        username: 'testusername',
        password: 'wrongpassword'
      };
      url = mount + '/login';
      request(app)
        .post(url)
        .send(inValidUser)
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
    it('should reject ill-formed data and respond with 422 code', function(done) {
      const data = { username: 'testusername' };
      url = mount + '/login';
      request(app)
        .post(url)
        .send(data)
        .set('Content-Type', 'application/json')
        .expect(422, done);
    });
  });
});

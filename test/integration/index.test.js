const request = require('supertest');
const db = require('mongoose');
const app = require('../../setup/express');

describe('Root level routes', function() {
  describe('GET /', function() {
    it('should send project name', function(done) {
      request(app)
        .get('/')
        .expect(process.env.APP_NAME)
        .expect(200, done);
    });
  });
  describe('GET /undefined', function() {
    it('should respond with 404 error code', function(done) {
      request(app)
        .get('/somerandomundefinedroute')
        .expect(404, done);
    });
  });
});
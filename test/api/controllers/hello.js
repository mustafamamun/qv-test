/*jslint node:true*/
'use strict';

const request = require('supertest'),
      app = require('./../../../server').app,
      tape = require('tape');

describe('User Controller', function() {

  let server;
  before('Start server', function (done) {
      server = require('./../../../server');
      server.start()
          .then(done)
          .catch(done);
  });

  describe('Should return the same string as provided', function() {

      it('should return the same text sent', function(done) {
        tape('GET /hello', function (t) {
          request(app)
            .get('/hello')
            .query({name:'asfd'})
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              console.log(res.body);
              t.end();
              done();
            });
        });
      });
  });
});

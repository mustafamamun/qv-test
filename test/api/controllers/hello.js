/*jslint node:true*/
'use strict';

import  request from 'supertest';
import { app , start } from './../../../server';
import should from 'should';
describe('User Controller', function() {

  before('Start server', function (done) {
      start()
      .then(done)
      .catch(done);
  });

  describe('Should return the same string as provided', function() {

      it('should return the same text sent', function(done) {
          request(app)
            .get('/hello')
            .query({name:'asfd'})
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              res.body.message.should.equal('asfd');
              done();
            });
        });
    });
});

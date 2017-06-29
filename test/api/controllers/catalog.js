/*jslint node:true*/
'use strict';

import  request from 'supertest';
import { app , start } from './../../../server';
import should from 'should';
import { init } from '../../../api/services/db/connection';
import uuid from 'uuid';
describe('User Controller', function() {
  let _id, name = uuid.v4();
  before('Start server', function (done) {
    init()
      .then(start)
      .then(done)
      .catch(done);
  });

  describe('Sould create a product in the product catalog and return the created product', function() {

      it('Should return the created product', function(done) {
          request(app)
            .post('/catalog/product')
            .send({
              "name": name,
              "unitPrice": 6,
              "quantity": 100
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              _id = res.body._id;
              res.body.name.should.equal(name);
              res.body.unitPrice.should.equal(6);
              res.body.quantity.should.equal(100);
              done();
            });
        });
    });
    describe('Should get the product with given query params', function() {

        it('Should get the product with given query params', function(done) {
            request(app)
              .get(`/catalog/product?name=${name}&_id=${_id}&offset=0&limit=10&priceRange=from5To10&sort=price`)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function (err, res) {
                res.body.total.should.equal(1);
                res.body.count.should.equal(1);
                res.body.results[0].name.should.equal(name);
                res.body.results[0].unitPrice.should.equal(6);
                res.body.results[0].quantity.should.equal(100);
                done();
              });
          });
      });
      describe('Sould update the created product', function() {

          it('Sould update the created product', function(done) {
              request(app)
                .put(`/catalog/product?_id=${_id}`)
                .send({
                  "name": name,
                  "unitPrice": 10,
                  "quantity": 200
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                  res.body.unitPrice.should.equal(10);
                  res.body.quantity.should.equal(200);
                  done();
                });
            });
        });
      describe('Sould delete the created product', function() {

          it('Sould delete the created product', function(done) {
              request(app)
                .delete(`/catalog/product?_id=${_id}`)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                  res.body.message.should.equal(`Successfully removed product with id ${_id}`);
                  done();
                });
            });
        });
});

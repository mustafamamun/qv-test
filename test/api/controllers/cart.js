/*jslint node:true*/
'use strict';

import  request from 'supertest';
import { app , start, stop } from './../../../server';
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
  after('stop server', function (done) {
      stop();
      done();
  });


  describe('Should add a item to the cart and return the whole cart', function() {

      it('Should add a item to the cart and return the whole cart', function(done) {
        request(app)
          .post('/cart/product')
          .send({
                "customerId": "controller_test_customer_id",
                "productId": "0123456789",
                "quantity": 2,
                "unitPrice": 10
              })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            res.body.customerId.should.equal('controller_test_customer_id');
            res.body.total.should.equal(20);
            res.body.products.length.should.equal(1);
            res.body.products[0]._id.should.equal('0123456789');
            res.body.products[0].unitPrice.should.equal(10);
            res.body.products[0].quantity.should.equal(2);
            done();
          });
        });
    });
    describe('Should read the cart items', function() {

        it('Should read the cart items', function(done) {
          request(app)
            .get('/cart/product?customerId=controller_test_customer_id')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              res.body.customerId.should.equal('controller_test_customer_id');
              res.body.total.should.equal(20);
              res.body.products.length.should.equal(1);
              res.body.products[0]._id.should.equal('0123456789');
              res.body.products[0].unitPrice.should.equal(10);
              res.body.products[0].quantity.should.equal(2);
              done();
            });
          });
      });
    describe('Should update the whole cart and returns the cart', function() {

        it('Should update the whole cart and returns the cart', function(done) {
          request(app)
            .put('/cart/product?customerId=controller_test_customer_id')
            .send([
              {
                "_id": "0123456789",
                "quantity": 4,
                "unitPrice": 10
              }
            ])
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              res.body.customerId.should.equal('controller_test_customer_id');
              res.body.products.length.should.equal(1);
              res.body.total.should.equal(40);
              res.body.products[0].quantity.should.equal(4);
              done();
            });
          });
      });
    describe('Should delete a product from the cart and returns the cart', function() {

        it('Should delete a product from the cart and returns the cart', function(done) {
          request(app)
            .delete('/cart/product?customerId=controller_test_customer_id&productId=0123456789')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              res.body.customerId.should.equal('controller_test_customer_id');
              res.body.products.length.should.equal(0);
              res.body.total.should.equal(0);
              done();
            });
          });
      });


});

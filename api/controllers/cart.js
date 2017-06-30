/*jslint node:true*/
'use strict';
import config from 'config';
import query from '../services/db/query';
import _ from 'lodash';
import { logger } from '../services/util/logger';
import { ObjectId } from 'mongodb';
import createError from 'http-errors';
import promise from 'bluebird';
const collectionName = config.get('mongoConfig.cartCollection');

module.exports = {
  getCartItems,
  addItemToCart,
  updateCartItems,
  removeCartproduct
};

function getCartItems(req, res, next){
  let qs = {customerId : req.swagger.params.customerId.value};
  query.getFromDB(collectionName, qs, {_id:0})
  .then((result)=>{
    let responseObj = {};
    if(result.length > 0){
      responseObj = _.assign(result[0], {total : _.sumBy(result[0].products, (eacheProduct)=>{
          return eacheProduct.quantity * eacheProduct.unitPrice;
      })});
    }
    return res.status(200).json(responseObj);
  })
  .catch((err)=>{ return next(createError(err.status || 500, err.message || 'Internal server errror')); });
}


function addItemToCart(req, res, next){
  let customerId = req.body.customerId;
  query.getFromDB(collectionName, {customerId : customerId})
  .then((result)=>{
    if(result.length > 0){
      result[0].products.push(_.assign({}, {_id :  req.body.productId, quantity: req.body.quantity, unitPrice : req.body.unitPrice}));
      result[0].products = _
       .chain(result[0].products)
       .groupBy('_id')
       .map((value, key)=>{
         return {_id : key, quantity : _.sumBy(value, (eachValue)=>{ return eachValue.quantity; }), unitPrice : value[0].unitPrice};
       })
       .value();
      return query.updateDB(collectionName, {customerId:customerId}, {$set : {products : result[0].products }});
    }else{
      let cartDetails = _.assign({}, {customerId : customerId, products : [{_id :  req.body.productId, quantity: req.body.quantity, unitPrice : req.body.unitPrice}]});
      return query.saveToDB(collectionName, cartDetails);
    }
  })
  .then(result=>query.getFromDB(collectionName, {customerId : req.body.customerId}, {_id:0}))
  .then((result)=>{ return res.status(200).json(_.merge(result[0], {total : _.sumBy(result[0].products, (eacheProduct)=>{ return eacheProduct.quantity * eacheProduct.unitPrice; })})); })
  .catch((err)=>{ return next(createError(err.status || 500, err.message || 'Internal server errror')); });
}

function updateCartItems(req, res, next){
    let qs = {customerId : req.swagger.params.customerId.value};
    let us = {$set : {products: _.map(req.body, (eacheProduct)=>{ return {_id : eacheProduct._id, quantity: eacheProduct.quantity, unitPrice: eacheProduct.unitPrice } ;})}};
    query.updateDB(collectionName, qs, us)
    .then((result)=>{
      if((result.result || {}).n > 0){
        return query.getFromDB(collectionName, qs, {_id:0});
      }else if((result.result || {}).n ===0){
        return promise.reject({status : 204, message: 'Content not found'});
      }else{
        return promise.reject({status : 500, message : 'Something wrong happend'});
      }
    })
    .then((result)=>{ return res.status(200).json(_.merge(result[0], {total : _.sumBy(result[0].products, (eacheProduct)=>{ return eacheProduct.quantity * eacheProduct.unitPrice; })})); })
    .catch((err)=>{ return next(createError(err.status || 500, err.message || 'Internal server errror')); });
}


function removeCartproduct(req, res, next){
    let qs = {customerId : req.swagger.params.customerId.value};
    let us = { $pull: { 'products': { _id: req.swagger.params.productId.value } } };
    query.updateDB(collectionName, qs, us)
    .then((result)=>{
      console.log(result.result);
      if((result.result || {}).n > 0){
        return query.getFromDB(collectionName, qs, {_id:0});
      }else if((result.result || {}).n ===0){
        return promise.reject({status : 204, message: 'Content not found'});
      }else{
        return promise.reject({status : 500, message : 'Something wrong happend'});
      }
    })
    .then((result)=>{ return res.status(200).json(_.merge(result[0], {total : _.sumBy(result[0].products, (eacheProduct)=>{ return eacheProduct.quantity * eacheProduct.unitPrice; })})); })
    .catch((err)=>{  return next(createError(err.status || 500, err.message || 'Internal server errror')); });
}

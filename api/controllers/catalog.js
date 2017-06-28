/*jslint node:true*/
'use strict';
import config from 'config';
import query from '../services/db/query';
import _ from 'lodash';
import { logger } from '../services/util/logger';
import { ObjectId } from 'mongodb';
import promise from 'bluebird';
const collectionName = config.get('mongoConfig.catalogCollection');
const IdRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
module.exports = {
  getProduct,
  addProduct,
  updateProduct,
  updateProductPartially,
  deleteProduct,
  addItem,
  removeItem
};
//Controller function
function getProduct(req, res, next) {
  let qs = {}, sort = {};
  if(req.swagger.params._id.value){
    if(!IdRegExp.test(req.swagger.params._id.value)){
      return res.status(400).json({message : 'Bad request, Id is not in write format'});
    }
    qs._id = new ObjectId(req.swagger.params._id.value);
  }
  if(req.swagger.params.name.value){
    qs.name = {'$regex' : req.swagger.params.name.value, '$options' : 'i'};
  }
  let sortId = req.swagger.params.sort.value;
  if(sortId){
    if(sortId === 'name'){
      sort.name = 1;
    }
    if(sortId === 'price'){
      sort.price = 1;
    }
  }
  let priceRange = req.swagger.params.priceRange.value;
  if(priceRange){
    if(priceRange === 'lessThan5'){
      qs.unitPrice = {$lt : 5};
    }
    if(priceRange === 'from5To10'){
      qs.unitPrice = {$gt : 5, $lt:10};
    }
    if(priceRange === 'greaterThan10'){
      qs.unitPrice = { $gt : 10 };
    }
  }
  let paging = {
          limit : req.swagger.params.limit.value || 20,
          skip : req.swagger.params.offset.value || 0
      };
  query.getFromDB(collectionName, qs, {}, paging, sort)
  .then((result)=>{
    return query.findCount(collectionName, qs)
    .then((count)=>{
        return res.json({total : count, count : result.length, results : result});
    });
  }).catch((err)=>{
    logger.error(err);
    return res.status(500).json(err);
  });

}

function addProduct(req, res, next){
  let productDetails = _.assign({}, {_id : new ObjectId(), name : req.body.name, unitPrice: req.body.unitPrice, quantity : req.body.quantity});
  query.saveToDB(collectionName, productDetails)
  .then(result=>query.getFromDB(collectionName, {_id: productDetails._id}))
  .then((result)=>{
    return res.status(201).json(result[0]);
  })
  .catch((err)=>{
    //logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}

function updateProduct(req, res, next){
  if(!IdRegExp.test(req.swagger.params._id.value)){
    return res.status(400).json({message : 'Bad request, Id is not in write format'});
  }
  let qs = _.assign({}, {_id : new ObjectId(req.swagger.params._id.value)});
  let us = _.assign({}, {name : req.body.name, unitPrice : req.body.unitPrice, quantity : req.body.quantity});
  query.updateDB(collectionName, qs, {$set : us})
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return query.getFromDB(collectionName, qs);
    }else if((result.result || {}).n ===0){
      return promise.reject({status : 204, message : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return promise.reject({status : 500, message : 'Could not modify the product'});
    }else{
      return promise.reject({status : 500, message : 'Something wrong happend'});
    }

  })
  .then((result)=> { return res.status(200).json(result[0]); })
  .catch((err)=>{
    logger.error(err);
    return next(err);
  });
}

function updateProductPartially(req, res, next){
  if(!IdRegExp.test(req.swagger.params._id.value)){
    return res.status(400).json({message : 'Bad request, Id is not in write format'});
  }
  let qs = { _id : new ObjectId(req.swagger.params._id.value)};
  let us = _.pickBy(_.assign({}, {name : req.body.name, unitPrice : req.body.unitPrice, quantity : req.body.quantity}), (prop)=>{
    return prop !== undefined;
  });
  if(_.isEmpty(us)){
    return res.status(400).json({messge : 'Update parameters are not right'});
  }
  query.updateDB(collectionName, qs, {$set : us})
  .then(()=>{ return query.getFromDB(collectionName, qs); })
  .then((result)=>{
    if(result.length === 0){
      return res.status(204).json({message : 'Content not found'});
    }else{
      return res.status(200).json(result[0]);
    }
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}


function deleteProduct(req, res, next){
  if(!IdRegExp.test(req.swagger.params._id.value)){
    return res.status(400).json({message : 'Bad request, Id is not in write format'});
  }
  let qs =  {_id : new ObjectId(req.swagger.params._id.value)};
  query.removeFromDB(collectionName, qs)
  .then((result)=>{
      return (result.result ||  {}).n > 0 ?  res.status(200).json({message : `Successfully removed product with id ${req.swagger.params._id_value}`}) : res.status(204).json({message : `Content not found with id ${req.swagger.params._id_value}`});
  }).catch((err)=>{
    logger.error(err);
    res.status(500).json({message : 'Internal server error'});
  });
}
function addItem(req, res, next){
  let _id = req.swagger.params.productId.value;
  if(!IdRegExp.test(_id)){
    return res.status(400).json({message : 'Product id is not correct'});
  }
  let qs = { _id : new ObjectId(_id)};
  let us = {$inc : _.assign({},{quantity : req.body.quantity})};
  query.updateDB(collectionName, qs, us)
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return res.status(200).json({message : 'Item added to product catalog'});
    }else if((result.result || {}).n ===0){
      return res.status(204).json({messge : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return res.status(500).json({message : 'Could not modify the product'});
    }else{
      return res.status(500).json({message : 'Something wrong happend'});
    }
  })
  .catch((err)=>{
    logger.error(err);
    res.status(500).json({message : 'Internal server error'});
  });
}

function removeItem(req, res, next){
  let _id = req.swagger.params.productId.value;
  if(!IdRegExp.test(_id)){
    return res.status(400).json({message : 'Product id is not correct'});
  }
  let qs = { _id : new ObjectId(_id)};
  let us = {$inc : _.assign({},{quantity : -req.body.quantity})};
  query.updateDB(collectionName, qs, us)
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return res.status(200).json({message : 'Item removed product catalog'});
    }else if((result.result || {}).n ===0){
      return res.status(204).json({messge : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return res.status(500).json({message : 'Could not modify the product'});
    }else{
      return res.status(500).json({message : 'Something wrong happend'});
    }
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}

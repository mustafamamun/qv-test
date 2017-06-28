/*jslint node:true*/
'use strict';
import config from 'config';
import query from '../services/db/query';
import _ from 'lodash';
import { logger } from '../services/util/logger';
import { ObjectId } from 'mongodb';
const collectionName = config.get('mongoConfig.cartCollection');

module.exports = {
  getCartItems,
  addItemToCart,
  updateCartItems,
  removeCartItem,
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
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message: 'Internal server error'});
  });
}


function addItemToCart(req, res, next){
  let responseObj;
  let customerId = req.body.customerId;
  query.getFromDB(collectionName, {customerId : customerId})
  .then((result)=>{
    console.log(result);
    if(result.length > 0){
      result[0].products.push(_.assign({}, {_id :  req.body.productId, quantity: req.body.quantity, unitPrice : req.body.unitPrice}));
      console.dir(result[0].products, {depth:null});
      result[0].products = _
       .chain(result[0].products)
       .groupBy('_id')
       .map((value, key)=>{
         return {_id : key, quantity : _.sumBy(value, (eachValue)=>{ return eachValue.quantity; }), unitPrice : value[0].unitPrice};
       })
       .value();
      responseObj = result[0];
      return query.updateDB(collectionName, {customerId:customerId}, {$set : {products : result[0].products }});
    }else{
      let cartDetails = _.assign({}, {customerId : customerId, products : [{_id :  req.body.productId, quantity: req.body.quantity, unitPrice : req.body.unitPrice}]});
      responseObj = cartDetails;
      return query.saveToDB(collectionName, cartDetails);
    }
  })
  .then((result)=>{
    return res.status(200).json(_.omit(responseObj, '_id'));
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}

function updateCartItems(req, res, next){
    let qs = {customerId : req.swagger.params.customerId.value};
    let us = {$set : {products: req.body}};
    query.updateDB(collectionName, qs, us)
    .then((result)=>{
      if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
        return res.status(200).json({message : 'Item added to cart'});
      }else if((result.result || {}).n ===0){
        return res.status(204).json({messge : 'Contend to be modified not found'});
      }else if((result.result || {}).nModified === 0){
        return res.status(500).json({message : 'Could not modify the cart'});
      }else{
        return res.status(500).json({message : 'Something wrong happend'});
      }
    })
    .catch((err)=>{ logger.error(err); return res.status(500).json({message :  'Internal server error'}); });
}

function removeCartItem(req, res, next){
  let qs =  {customerId : req.swagger.params.customerId.value, 'products._id' : req.swagger.params.productId.value};
  let us = {$inc:{"products.$.quantity": -req.body.quantity }};
  query.updateDB(collectionName, qs, us)
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return res.status(200).json({message : 'Item removed from cart'});
    }else if((result.result || {}).n ===0){
      return res.status(204).json({messge : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return res.status(500).json({message : 'Could not modify the product'});
    }else{
      return res.status(500).json({message : 'Something wrong happend'});
    }
  }).catch((err)=>{ logger.error(err); return res.status(500).json({message : 'Internal server error'}); });
}


function removeCartproduct(req, res, next){
    let qs = {customerId : req.swagger.params.customerId.value};
    let us = { $pull: { 'products': { _id: req.swagger.params.productId.value } } };
    query.updateDB(collectionName, qs, us)
    .then((result)=>{
      if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
        return res.status(200).json({message : 'Product removed from cart'});
      }else if((result.result || {}).n ===0){
        return res.status(204).json({messge : 'Contend to be modified not found'});
      }else if((result.result || {}).nModified === 0){
        return res.status(500).json({message : 'Could not modify the product'});
      }else{
        return res.status(500).json({message : 'Something wrong happend'});
      }
    }).catch((err)=>{
      logger.error(err);
      return res.status(500).json({message : 'Internal server error'});
    });
}

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
Promise.promisifyAll(require('bcrypt'));
mongoose.connect('mongodb://localhost:27017/eventmanager');
var User = require('../models/user');

router.get('/debug', (req, res, next) => {
  User.find()
  .then(user => res.send(user))
  .catch(err => res.send(err));
});

router.get('/protected', (req, res, next) => {
  let token = req.headers['x-access-token'] || req.body.token || req.headers['token'];
  if (!token) {
    return res.send({
      status: 'error',
      data: 'authorization token missing'
    });
  }
  let decodedToken = User.verifyJWT(token);
  if (!decodedToken) {
    return res.send({
      status: 'error',
      data: 'bad token'
    });
  }
  return res.send({
    status: 'success',
    data: decodedToken
  })
});

router.get('/debugjwt', (req, res, next) => {
  res.send(req.headers);
});

router.post('/signup', (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
    return res.send({
      status: 'error',
      data: 'field missing'
    });
  }
  let newUser = new User({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }).save().then(user => res.send({
    status: 'success',
    data: 'user signed up as ' + user.email,
    token: user.getJWT()
  }))
  .catch(err => res.send({ status: 'error', data: err.errmsg }));
});

router.post('/signin', (req, res, next) => {
  if (!req.body.email || !req.body.password) return res.send({ status: 'error', data: 'field missing' });

  User.findOne().where({ email: req.body.email })
  .then(user => {
    if (!user) return res.send({ status: 'error', data: 'user does not exist' });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) return res.send({ status: 'error', data: 'bcrypt error' });
      if (!isMatch) return res.send({ status: 'error', data: 'wrong credentials' });
      return res.send({
        status: 'success',
        data: 'you got authenticated as ' + user.email,
        token: user.getJWT()
      });
    });
  })
  .catch(err =>res.send({ status: 'error', data: 'err' }));
});

module.exports = router;

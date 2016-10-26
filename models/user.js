var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var saltRounds = 10;
var secretKey = '9fe173ffbecafed536ffbc1c5ce3c27b672a6433a340e4a7032b9d64312a88ff';

var userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save', function (next) {
  let user = this;
  user.updated_at = new Date();
  if (!user.created_at) {
    user.created_at = new Date();
  }

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, saltRounds, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });

});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.getJWT = function () {
  return jwt.sign({
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName
  }, secretKey);
};

userSchema.statics.verifyJWT = function (token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return false;
  }
};

var User = mongoose.model('User', userSchema);

module.exports = User;

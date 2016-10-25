var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(require('bcrypt'));
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var saltRounds = 10;

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

// userSchema.pre('save', next => {
//   console.log(this);
//   let user = this;
//   // if (!user.isModified('password')) return next();
//
//   bcrypt.hash(user.password, saltRounds, (err, hash) => {
//     if (err) return next(err);
//
//     user.password = hash;
//     next();
//   });
//   console.log(this);
// });

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
  // bcrypt.compare(candidatePassword, this.password, function (err, res) {
  //   console.log(err);
  //   console.log(res);
  // });
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');

const minLength = 6;
const maxLength = 50;

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, maxlength: maxLength },
    lastname: { type: String, required: true, maxlength: maxLength },
    email: { type: String, required: true, unique: true },
    password: String,
    gender: String,
    birthdate: String,
    country: String,
    image: String,
    forgotPasswordConfirmationCode: String,
    // role: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user'},
    // isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = function (expireTime = '7d') {
  const token = jwt.sign(
    {
      id: this._id
    },
    process.env.JWT_KEY,
    {
      expiresIn: expireTime
    }
  );
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = {
  User
}

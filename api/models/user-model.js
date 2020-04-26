const mongoose = require('mongoose');
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
  },
  { timestamps: true }
);

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

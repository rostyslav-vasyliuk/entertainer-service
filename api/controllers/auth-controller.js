const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user-model');
const nodemailer = require('nodemailer');
const { generateConfirmationCode } = require('../utils/pseudo-number-generator');
const { sendEmail } = require('../utils/email');

const signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender, birthdate, country, countryCode } = req.body;
    console.log(req.body);

    if (!email || !password || !firstname || !lastname || !gender || !birthdate || !country || !countryCode) {
      return res.status(422).json({ message: 'Please, fill up all fields!' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(422).json({ message: 'User with this email is already exist!' });

    user = new User({ firstname, lastname, email, password, gender, birthdate, country, countryCode });
    console.log(user)

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(password, salt);

    await user.save();

    sendEmail(email, 'Welcome to Entertainer!', `
    <div>
      <h4>Hello ${firstname} ${lastname}!</h4>
      <hr>
      <h4>We are very happy that you joined Entertainer! Have a pleasure using our app!</h4>
    <div>` )

    const token = user.generateAuthToken();

    delete user.password;
    res
      .header('access-token', token)
      .status(200)
      .json(user);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ message: 'Email and password are required!' });

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password!' });

    const validPassword = await bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password!' });

    delete user.password;
    const token = user.generateAuthToken();

    res
      .header('access-token', token)
      .status(200)
      .send(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

const validateUser = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    if (!token) return res.status(404).json({ message: 'Token not found!' });
    const data = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findById(data.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

const validateEmail = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) return res.status(404).json({ message: 'Email not found!' });

    const user = await User.findOne({ email }).select('-password');
    if (user) {
      res.status(400).json({ message: 'Userr with following email exists' });
    }
    res.status(200).json({ message: 'Userr with following email doesnt exists' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const forgotPasswordPending = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    let user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(400).json({ message: 'User with this email doesnt exist!' });

    const confirmationCode = generateConfirmationCode();

    sendEmail(email, 'Recover your password!', `
    <div>
      <h4>Hello ${user.firstname} ${user.lastname}!</h4>
      <hr>
      <h4> Your verification code: ${confirmationCode}</h4>
    <div>` )

    user.forgotPasswordConfirmationCode = String(confirmationCode);
    await user.save();

    const token = user.generateAuthToken('1m');
    res.header('forgot-password-token', token).json({ message: 'success' }).status(200);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const confirmForgotPasswordCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const forgotPasswordToken = req.headers['forgot-password-token'];
    console.log(JSON.stringify(req.headers))

    console.log(JSON.stringify(forgotPasswordToken))

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User with this email doesnt exist!' });

    if (user.forgotPasswordConfirmationCode !== code) {
      return res.status(400).json({ message: 'Wrong code' })
    }

    user.forgotPasswordConfirmationCode = null;
    await user.save();

    jwt.verify(forgotPasswordToken, process.env.JWT_KEY);

    const token = user.generateAuthToken('5m');
    res.header('reset-password-token', token).json({ message: 'success' }).status(200);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const resetToken = req.headers['reset-password-token'];

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User with this email doesnt exist!' });

    jwt.verify(resetToken, process.env.JWT_KEY);

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(password, salt);

    await user.save();

    res.json({ message: 'success' }).status(200);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

module.exports = {
  signUp,
  signIn,
  validateUser,
  forgotPasswordPending,
  confirmForgotPasswordCode,
  resetPassword,
  validateEmail
};

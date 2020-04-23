const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user-model');
const nodemailer = require('nodemailer');

// const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender, birthdate, country } = req.body;
    console.log('got here?')

    if (!email || !password || !firstname || !lastname || !gender || !birthdate || !country) {
      return res.status(422).json({ message: 'Please, fill up all fields!' });
    }

    user = await User.findOne({ email });
    if (user) return res.status(422).json({ message: 'User with this email is already exist!' });

    user = new User({ firstname, lastname, email, password, gender, birthdate, country });
    console.log(user)

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(password, salt);
    
    await user.save();

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_MAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    const mailOptions = {
      to: email,
      from: process.env.GMAIL_MAIL,
      subject: 'Welcome to Entertainer!',
      html: `
      <div>
        <h1>Hello ${firstname} ${lastname}!</h1>
        <hr>
        <h2>We are very happy that you joined Filmify! Have a pleasure using our app!</h2>
        <h4>If you have some recomendations send your advise to this mail!</h4>
        <h5>(c)Filmify, 2019</h5>
      <div>`
    };

    smtpTransport.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err)
      else
        console.log(info);
    });

    const token = user.generateAuthToken();
    res
      .header('access-token', token)
      .status(200)
      .json({
        message: 'User created!',
        user: { firstname, lastname, email }
      });
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
      .json({ user });
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

module.exports = {
  signUp,
  signIn,
  validateUser
};

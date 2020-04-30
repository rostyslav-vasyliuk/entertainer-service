const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');
const { sendEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

const sendFeedback = async (req, res) => {
  try {
    const deviceInfo = req.body.deviceInfo;
    const type = req.body.type;
    const feedbackText = req.body.feedbackText;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);
    sendEmail(process.env.GMAIL_MAIL, `User feedback: ID=${user._id}`,
      `<div>
        <h1>Feedback from ID=${user._id}</h1>
        <hr>
        <h2>Type: ${type}</h2>
        <h2>Text: ${feedbackText}</h2>
        <h4>Device: ${JSON.stringify(deviceInfo)}</h4>
      <div>`
    )
    res.status(200).send({ message: 'success' });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    const validPassword = await bcrypt.compareSync(oldPassword, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password!' });

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(password, salt);

    await user.save();

    res.status(200).send({ message: 'success' });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      country,
      birthdate,
      gender
    } = req.body;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    user.firstname= firstname; 
    user.lastname = lastname;
    user.country = country;
    user.birthdate = birthdate;
    user.gender = gender;

    await user.save();

    res.status(200).send({ message: 'success' });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

module.exports = {
  sendFeedback,
  changePassword,
  updateProfile
};
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/person/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=images,credits,external_ids,tv_credits`
    );

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    if (!user.visitedActors.includes) {
      user.visitedActors.push(id);
    }
    
    await user.save();

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails
};

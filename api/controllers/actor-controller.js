const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/person/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=images,credits,external_ids,tv_credits`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails
};

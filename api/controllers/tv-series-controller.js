const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/tv/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=videos,credits`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getSeason = async (req, res) => {
  try {
    const id = req.query.id;
    const season_number = req.query.season_number;

    const data = await axios.get(
      `${BASE_URL}/tv/${id}/season/${season_number}?api_key=${process.env.API_KEY}&language=en-US`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTopTen = async (req, res) => {
  try {
    const page = req.query.page;
    const data = await axios.get(
      `${BASE_URL}/discover/tv?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.gte=2019-01-01`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getRecomendations = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id)
    const data = await axios.get(
      `${BASE_URL}/tv/${id}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  getDetails,
  getTopTen,
  getSeason,
  getRecomendations
};

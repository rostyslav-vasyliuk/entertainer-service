const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/tv/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=videos,credits`
    );

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    user.visitedSeries.push(id);

    user.save();

    const isFavourite = user.favouriteSeries.findIndex((elem) => JSON.parse(elem).id == id);
    data.data.isFavourite = (isFavourite === -1 ? false : true);

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
    console.log(page)
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

    const data = await axios.get(
      `${BASE_URL}/tv/${id}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getTopByGenre = async (req, res) => {
  try {
    const genre = req.params.genre;
    const page = req.query.page;
    const data = await axios.get(
      `${BASE_URL}/discover/tv?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genre}`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}


const addToFavourites = async (req, res) => {
  try {
    const id = req.body.id;
    const data = req.body.data;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    const index = user.favouriteSeries.findIndex((elem) => JSON.parse(elem).id == id);

    if (index === -1) {
      user.favouriteSeries.push(JSON.stringify(data));
    } else {
      user.favouriteSeries.splice(index, 1);
    }

    user.save();

    const isFavourite = index === -1 ? true : false;
    res.status(200).send({ isFavourite });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getFavourites = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    res.status(200).send({ favouriteSeries: user.favouriteSeries });

  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails,
  getTopTen,
  getSeason,
  getRecomendations,
  getTopByGenre,
  addToFavourites,
  getFavourites
};

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/movie/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=credits,videos`
    );

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    user.visitedMovies.push(id);
    
    user.save();

    const isFavourite = user.favouriteMovies.findIndex((elem) => JSON.parse(elem).id == id);
    data.data.isFavourite = (isFavourite === -1 ? false : true);

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getRecommendations = async (req, res) => {
  try {
    const id = req.query.id;

    const data = await axios.get(
      `${BASE_URL}/movie/${id}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getSimilar = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await axios.get(
      `${BASE_URL}/movie/${id}/similar?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getByGenres = async (req, res) => {
  try {
    const genre_id = req.params.genre_id;
    const page = req.query.page;
    const data = await axios.get(
      `${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genre_id}&page=${page}`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getTopTen = async (req, res) => {
  try {
    const page = req.query.page;
    const data = await axios.get(
      `${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.gte=2019-01-01`
    );

    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getUpcoming = async (req, res) => {
  try {
    const data = await axios.get(
      `${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=2019-04-07`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getTopRated = async (req, res) => {
  try {
    const data = await axios.get(
      `${BASE_URL}/movie/top_rated?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const getNowPlaying = async (req, res) => {
  try {
    const data = await axios.get(
      `${BASE_URL}/movie/now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );
    res.send(data.data);
  } catch (err) {
    res.status(500).json(err);
  }
}

const searchMovie = async (req, res) => {
  try {
    const query = req.params.query;
    const data = await axios.get(
      `${BASE_URL}/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`
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

    const index = user.favouriteMovies.findIndex((elem) => JSON.parse(elem).id === id);

    if (index === -1) {
      user.favouriteMovies.push(JSON.stringify(data))
    } else {
      user.favouriteMovies.splice(index, 1);
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

    res.status(200).send({ favouriteMovies: user.favouriteMovies });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails,
  getSimilar,
  getRecommendations,
  getByGenres,
  getTopTen,
  getUpcoming,
  getTopRated,
  getNowPlaying,
  searchMovie,
  addToFavourites,
  getFavourites
};

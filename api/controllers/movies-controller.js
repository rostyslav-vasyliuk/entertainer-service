const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');
const kmeans = require('../utils/kmeans');
const { normalizeUserDatasets } = require('../utils/kmeans-normalizer');
const { getOptimalClustersAmountElbowMethod } = require('../utils/elbow-methob');

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

    if (!user.visitedMovies.includes(id)) {
      user.visitedMovies.push(id);
    }

    await user.save();
    const movieRating = user.userMovieRatings.find((elem) => elem.movieID == id);
    data.data.userRating = movieRating ? movieRating.rating : null;

    res.send(data.data);
  } catch (err) {
    console.log(err.message)
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

const setRating = async (req, res) => {
  try {
    const { movieRating, genres, movieID } = req.body;
    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);
    const user = await User.findById(decoded.id);

    const { userMovieRatings, averageMovieGenres } = user;
    let outdatedRatingValue = null;
    const ratingIndex = userMovieRatings.findIndex((elem) => elem.movieID === movieID);

    if (ratingIndex === -1) {
      userMovieRatings.push({
        movieID,
        rating: movieRating,
      });
    } else {
      outdatedRatingValue = userMovieRatings[ratingIndex].rating;
      userMovieRatings[ratingIndex].rating = movieRating;
    }

    genres.forEach((genre) => {
      const dbAverageGenreIndex = averageMovieGenres.findIndex((dbAvg) => dbAvg.id === genre.id);
      if (dbAverageGenreIndex === -1) {
        averageMovieGenres.push(
          {
            count: 1,
            id: genre.id,
            name: genre.name,
            average: movieRating,
            movieIDs: [movieID],
          });
      } else if (averageMovieGenres[dbAverageGenreIndex].count === 1 && averageMovieGenres[dbAverageGenreIndex].movieIDs.includes(movieID)) {
        averageMovieGenres[dbAverageGenreIndex] = {
          ...averageMovieGenres[dbAverageGenreIndex],
          average: movieRating,
        }
      } else {
        if (averageMovieGenres[dbAverageGenreIndex].movieIDs.includes(movieID)) {
          let currentCount = averageMovieGenres[dbAverageGenreIndex].count;
          const currentAvg = averageMovieGenres[dbAverageGenreIndex].average;
          let currentSum = currentCount * currentAvg;
          currentSum -= outdatedRatingValue;
          currentCount -= 1;

          averageMovieGenres[dbAverageGenreIndex].count = currentCount;
          averageMovieGenres[dbAverageGenreIndex].average = Number((currentSum / currentCount).toFixed(2));
          averageMovieGenres[dbAverageGenreIndex].movieIDs = averageMovieGenres[dbAverageGenreIndex].movieIDs.filter((el) => el !== movieID);
        }

        averageMovieGenres[dbAverageGenreIndex] = {
          ...averageMovieGenres[dbAverageGenreIndex],
          count: averageMovieGenres[dbAverageGenreIndex].count + 1,
          average: Number(
            ((averageMovieGenres[dbAverageGenreIndex].average * averageMovieGenres[dbAverageGenreIndex].count + movieRating) /
              (averageMovieGenres[dbAverageGenreIndex].count + 1)).toFixed(2),
          ),
          movieIDs: [...averageMovieGenres[dbAverageGenreIndex].movieIDs, movieID],
        };
      }
    });

    await User.findByIdAndUpdate(decoded.id, { userMovieRatings, averageMovieGenres });

    res.status(200).send({});
  } catch (err) {
    console.log(err.message);
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

const kMeans = async (req, res) => {
  try {
    const id = '6182ce029f08775d64c26a0a';
    const user = await User.findById(id);

    const users = await User.find({});

    const { arr, userIDs } = normalizeUserDatasets(users);
    getOptimalClustersAmountElbowMethod();
    kmeans.clusterize(arr, userIDs, { k: 4, maxIterations: 5, debug: true }, (err, result) => {
      // console.table(result);
      res.status(200).send({ result });
    });
  } catch (err) {
    console.log(err.message)
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
  setRating,
  getFavourites,
  kMeans,
};

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getRecommendations = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);
    const mostVisitedActor = getMostPopular(user.actorsVisited, 0);

    const actorInfo = await getActor(mostVisitedActor);
    const movies = await getMoviesWithActor(mostVisitedActor);

    const result = [];

    const moviesOfTheWeek = await getWeekMovies();

    const movieOfTheWeek = moviesOfTheWeek.data.results[0];

    let otherMovies = [];

    for (let i = 1; i < 11; i++) {
      otherMovies.push(moviesOfTheWeek.data.results[i]);
    }

    const seriesOfTheWeek = await getWeekTV();

    const serieOfTheWeek = seriesOfTheWeek.data.results[0];

    let otherSeries = [];

    for (let i = 1; i < 11; i++) {
      otherSeries.push(seriesOfTheWeek.data.results[i]);
    }

    result.push({ type: 'actor_movies', actor: actorInfo.data, data: movies.data.results });
    result.push({ type: 'movie_of_the_week', data: movieOfTheWeek });
    result.push({ type: 'movies_of_the_week', data: otherMovies });

    result.push({ type: 'serie_of_the_week', data: serieOfTheWeek });
    result.push({ type: 'series_of_the_week', data: otherSeries });

    const query = buildPreferencesQuery(user.moviesPreferences);
    const preferencesResponse = await axios.get(query);

    result.push({ type: 'movies_preferences', data: preferencesResponse.data.results });

    res.status(200).send({ result });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const buildPreferencesQuery = (moviesPreferences) => {
  let genres = '';
  moviesPreferences.forEach((element, index) => {
    if (index === moviesPreferences.length - 1) {
      genres += Number(element);
    } else {
      genres += `${Number(element)}|`
    }
  });
  const basic = `${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&include_adult=false&include_video=false&page=1`;

  const options = ['vote_count.desc', 'revenue.desc', 'vote_average.desc', 'popularity.desc'];
  const option_index = Math.floor(Math.random() * 4);

  const query = `${basic}&sort_by=${options[option_index]}&with_genres=${genres}`;

  return query;
}

module.exports = {
  getRecommendations
};

function getMostPopular(arr, fromPlace = 0) {
  const sorted = arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length);
  if (fromPlace === 0) {
    return sorted.pop();
  }
  const uniqueItems = Array.from(new Set(sorted))

  let index = fromPlace;

  while (index !== 0) {
    index--;
    uniqueItems.pop();
  }

  return uniqueItems.pop();
}

const getWeekMovies = () => axios.get(`${BASE_URL}/trending/movie/week?api_key=${process.env.API_KEY}`);

const getWeekTV = () => axios.get(`${BASE_URL}/trending/tv/week?api_key=${process.env.API_KEY}`);

const getWeekPersons = () => axios.get(`${BASE_URL}/trending/person/week?api_key=${process.env.API_KEY}`);

const getMoviesWithActor = (id) => (
  axios.get(`${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_people=${id}`)
)

const getActor = (id) => (
  axios.get(`${BASE_URL}/person/${id}?api_key=${process.env.API_KEY}&language=en-US&append_to_response=credits`)
)

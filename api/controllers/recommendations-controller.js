const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getMostVisitedActorRecommendations = async (user) => {
  const mostVisitedActor = getMostPopular(user.actorsVisited, 0);

  if (mostVisitedActor) {
    const actorInfo = await getActor(mostVisitedActor);
    const movies = await getMoviesWithActor(mostVisitedActor);
    return { type: 'actor_movies', actor: actorInfo.data, data: movies.data.results };;
  }

  return;
}

const getSeriesOfTheWeek = async () => {
  const seriesOfTheWeek = await getWeekTV();

  if (seriesOfTheWeek.data && seriesOfTheWeek.data.results && seriesOfTheWeek.data.results.length) {
    const serieOfTheWeek = seriesOfTheWeek.data.results[0];

    let otherSeries = [];

    for (let i = 1; i < 11; i++) {
      otherSeries.push(seriesOfTheWeek.data.results[i]);
    }

    return [{ type: 'serie_of_the_week', data: serieOfTheWeek }, { type: 'series_of_the_week', data: otherSeries }];
  }
}

const getMoviesOfTheWeek = async () => {
  const moviesOfTheWeek = await getWeekMovies();

  if (moviesOfTheWeek && moviesOfTheWeek.data.results.length) {

    const movieOfTheWeek = moviesOfTheWeek.data.results[0];

    let otherMovies = [];

    for (let i = 1; i < 11; i++) {
      otherMovies.push(moviesOfTheWeek.data.results[i]);
    }

    return [{ type: 'movie_of_the_week', data: movieOfTheWeek }, { type: 'movies_of_the_week', data: otherMovies }]
  }
}

const getMoviesPreferencesContentFiltration = async (user) => {
  if (user.moviesPreferences && user.moviesPreferences.length) {
    const query = buildPreferencesQuery(user.moviesPreferences);
    const preferencesResponse = await axios.get(query);

    return { type: 'movies_preferences', data: preferencesResponse.data.results };
  }
}

const getRecommendations = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);
    const result = [];

    const actorsRecommendations = await getMostVisitedActorRecommendations(user);

    if (actorsRecommendations) {
      result.push(actorsRecommendations);
    }

    const seriesOfTheWeek = await getSeriesOfTheWeek();

    if (seriesOfTheWeek && seriesOfTheWeek.length === 2) {
      result.push(seriesOfTheWeek[0]);
      result.push(seriesOfTheWeek[1]);
    }

    const moviesOfTheWeek = await getMoviesOfTheWeek();
    console.log(moviesOfTheWeek)
    if (moviesOfTheWeek && moviesOfTheWeek.length === 2) {
      result.push(moviesOfTheWeek[0]);
      result.push(moviesOfTheWeek[1]);
    }
    
    const moviesPreferences = await getMoviesPreferencesContentFiltration(user);

    if (moviesPreferences) {
      result.push(moviesPreferences);
    }

    shuffleArray(result);

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

function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

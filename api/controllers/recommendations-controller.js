const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const BASE_URL = 'https://api.themoviedb.org/3';

const getMostVisitedActorRecommendations = async (user) => {
  const mostVisitedActor = getMostPopular(user.visitedActors, 0);

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

const getMoviesCollaborativeFiltering = async (user) => {
  const dateMin = new Date(user.birthdate);
  const dateMax = new Date(user.birthdate);
  dateMax.setFullYear(dateMax.getFullYear() + 3);
  dateMin.setFullYear(dateMin.getFullYear() - 3);

  const users = await User.find({});
  let counter = 0;

  const similarUsers = users.filter((user) => {
    if (counter >= 20) {
      return false;
    }
    if (new Date(user.birthdate).getTime() > dateMin.getTime() && new Date(user.birthdate).getTime() < dateMax.getTime()) {
      counter++;
      return true;
    }
  });

  shuffleArray(similarUsers);

  const favouriteMoviesIDS = similarUsers.map((user) => user.favouriteMovies).filter((elem) => elem.length);

  const allIds = [];
  const allMovies = [];
  favouriteMoviesIDS.forEach((elem) => {
    elem.forEach((el) => {
      allIds.push(JSON.parse(el).id);
      allMovies.push(JSON.parse(el));
    })
  });

  const valluableMatch = findDuplicates(allIds);
  const result = [];
  for (let i = 0; i < allMovies.length; i++) {
    if (valluableMatch.includes(allMovies[i].id) && result.findIndex((elem) => elem.id === allMovies[i].id) === -1) {
      result.push(allMovies[i]);
    }
  }

  return { type: 'movies_collaborative_filtering', data: [...result] }
}

const findDuplicates = (arr) => {
  let sorted_arr = arr.slice().sort();
  let results = [];
  for (let i = 0; i < sorted_arr.length - 1; i++) {
    if (sorted_arr[i + 1] == sorted_arr[i]) {
      results.push(sorted_arr[i]);
    }
  }
  return results;
}

const getMoviesPreferencesContentFiltration = async (user) => {
  if (!user.favouriteMovies.length) {
    return null;
  }
  const favouriteMovies = user.favouriteMovies.map((elem) => JSON.parse(elem));
  const actorArray = [];
  const genresArray = [];
  for (let i = 0; i < favouriteMovies.length; i++) {
    if (!favouriteMovies[i].credits.cast.length || !favouriteMovies[i].credits.cast[0].id) {
      continue;
    }
    actorArray.push(favouriteMovies[i].credits.cast[0].id);

    if (favouriteMovies[i].credits.cast.length > 1 && favouriteMovies[i].credits.cast[1].id) {
      actorArray.push(favouriteMovies[i].credits.cast[1].id);
    }

    if (favouriteMovies[i].genres && favouriteMovies[i].genres.length) {
      favouriteMovies[i].genres.forEach((elem) => {
        if (!genresArray.includes(elem.id)) {
          genresArray.push(elem.id);
        }
      });
    }
  }

  const query = buildPreferencesQuery(user.moviesPreferences, actorArray, genresArray);
  const preferencesResponse = await axios.get(query);

  const ids = favouriteMovies.map((elem) => elem.id);
  const result = preferencesResponse.data.results.filter((movie) => !ids.includes(movie.id));

  return { type: 'movies_preferences', data: result };
}

const getRecommendations = async (req, res) => {
  try {
    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);
    const result = [];

    const moviesOfTheWeek = await getMoviesOfTheWeek();

    if (moviesOfTheWeek && moviesOfTheWeek.length === 2) {
      result.push(moviesOfTheWeek[0]);
      result.push(moviesOfTheWeek[1]);
    }

    const seriesOfTheWeek = await getSeriesOfTheWeek();

    if (seriesOfTheWeek && seriesOfTheWeek.length === 2) {
      result.push(seriesOfTheWeek[0]);
      result.push(seriesOfTheWeek[1]);
    }

    res.status(200).send({ result });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const buildPreferencesQuery = (moviesPreferences, actorsArray, genresArray) => {
  let genres = '';
  moviesPreferences.forEach((element, index) => {
    if (index === moviesPreferences.length - 1) {
      genres += Number(element);
    } else {
      genres += `${Number(element)}|`
    }
  });

  const basic = `${BASE_URL}/discover/movie?api_key=${process.env.API_KEY}&language=en-US&include_adult=false&include_video=false&page=1`;

  const options = ['popularity.desc', 'vote_count.desc'];
  const date_gte = ['2000-01-01', '2010-01-01', '2015-01-01'];
  let query = `${basic}&sort_by=${options[Math.round(Math.random())]}`;

  if (genres !== '') {
    query += `&with_genres=${genres}`
  }

  let actorsToQuery = '';
  if (actorsArray.length > 1) {
    const randomActors = actorsArray.sort(() => Math.random() - Math.random()).slice(0, 2);
    actorsToQuery += randomActors.join('|');
  }

  if (actorsArray && actorsArray.length) {
    query += `&with_cast=${actorsToQuery}`;
  }

  if (genresArray && genresArray.length) {
    query += `&with_genres=${genresArray.join('|')}`
  }

  query += `$release_date.gte=${date_gte[Math.round(Math.random() * 3)]}`

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

function containsAll(...arguments) {
  var output = [];
  var cntObj = {};
  var array, item, cnt;
  // for each array passed as an argument to the function
  for (var i = 0; i < arguments.length; i++) {
    array = arguments[i];
    // for each element in the array
    for (var j = 0; j < array.length; j++) {
      item = "-" + array[j];
      cnt = cntObj[item] || 0;
      // if cnt is exactly the number of previous arrays, 
      // then increment by one so we count only one per array
      if (cnt == i) {
        cntObj[item] = cnt + 1;
      }
    }
  }
  // now collect all results that are in all arrays
  for (item in cntObj) {
    if (cntObj.hasOwnProperty(item) && cntObj[item] === arguments.length) {
      output.push(item.substring(1));
    }
  }
  return (output);
}

const findCommon = (arr1, arr2, pr) => {
  let res = [];

  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      if (arr1[i] == arr2[j] && !res.includes(arr1[i]) && !pr.includes(arr1[i])) {
        res.includes(arr1[i]);
      }
    }
  }

  return res;
}

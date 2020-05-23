const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');
const { Course } = require('../models/course-model');
const { Event } = require('../models/event-model');

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

const getCoursesPreferences = async (user) => {
  if (!user.favouriteCourses.length && !user.visitedCourses.length) {
    return null;
  }

  let coursesVisited = [];
  let coursesFavourite = [];

  if (user.visitedCourses.length) {
    const mostPopularCourse = getMostPopular(user.visitedCourses);

    const _course = await Course.findById(mostPopularCourse);
    coursesVisited = await Course.find({ type: _course.type }).limit(5);
  }


  if (user.favouriteCourses.length) {
    let index = Math.ceil(Math.random() * user.favouriteCourses.length);
    if (index >= user.favouriteCourses.length) {
      index = user.favouriteCourses.length - 1;
    }

    const _course = await Course.findById(user.favouriteCourses[index]);

    coursesFavourite = Course.find({ type: _course.type }).limit(5).skip(3);
  }

  const uniqueValues = [...coursesVisited];

  uniqueValues.filter((elem) => {
    for (let i = 0; i < coursesFavourite.length; i++) {
      if (elem._id !== coursesFavourite[i]._id) {
        uniqueValues.push(coursesFavourite[i]);
      }
    }
  });

  return { type: 'courses_preferences_content_filtering', data: [...uniqueValues] }
}

const getEventsPreferences = async (user) => {
  if (!user.favouriteEvents.length && !user.visitedEvents.length) {
    return null;
  }

  let eventsVisited = [];
  let eventsFavourite = [];

  if (user.visitedEvents.length) {
    const mostPopularCourse = getMostPopular(user.visitedEvents);

    const _event = await Event.findById(mostPopularCourse);
    eventsVisited = await Event.find({ type: _event.type }).limit(5);
  }


  if (user.favouriteEvents.length) {
    let index = Math.ceil(Math.random() * user.favouriteEvents.length);
    if (index >= user.favouriteEvents.length) {
      index = user.favouriteEvents.length - 1;
    }

    const _event = await Event.findById(user.favouriteEvents[index]);

    eventsFavourite = Event.find({ type: _event.type }).limit(5);
  }

  const uniqueValues = [...eventsVisited];

  for (let i = 0; i < eventsFavourite.length; i++) {
    for (let j = 0; j < uniqueValues.length; j++) {
      if (uniqueValues[j]._id !== eventsFavourite[i]._id) {
        console.log(eventsFavourite[i]._id);
        uniqueValues.push(eventsFavourite[i]);
      }
    }
  };

  return { type: 'events_preferences_content_filtering', data: [...uniqueValues] }
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

  const favouriteMoviesIDS = similarUsers.map((user) => user.visitedMovies).filter((elem) => elem.length);
  let preferences = [];
  let i = 0;

  while (preferences.length < 10) {
    if (i < favouriteMoviesIDS.length - 1) {
      for (let j = 0; j < favouriteMoviesIDS.length; j++) {
        if (i === j) {
          continue;
        }
        console.log('nns');
        const common = findCommon(favouriteMoviesIDS[i], favouriteMoviesIDS[j], preferences);
        preferences = [...preferences, ...common];
      }
    }

    if (i > 30) {
      break;
    }

    i++;
  }
  console.log(preferences);
  return { type: 'movies_collaborative_filtering', data: [] }
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

    if (moviesOfTheWeek && moviesOfTheWeek.length === 2) {
      result.push(moviesOfTheWeek[0]);
      result.push(moviesOfTheWeek[1]);
    }

    const moviesPreferences = await getMoviesPreferencesContentFiltration(user);

    if (moviesPreferences) {
      result.push(moviesPreferences);
    }

    const collaborativeFiltering = await getMoviesCollaborativeFiltering(user);

    if (collaborativeFiltering) {
      result.push(collaborativeFiltering);
    }

    
    const coursesPreferences = await getCoursesPreferences(user);
    console.log(coursesPreferences);
    if (coursesPreferences && coursesPreferences.data && coursesPreferences.data.length) {
      result.push(coursesPreferences);
    }
    
    const eventsPreferences = await getEventsPreferences(user);
    if (eventsPreferences && eventsPreferences.data && eventsPreferences.data.length) {
      result.push(eventsPreferences);
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

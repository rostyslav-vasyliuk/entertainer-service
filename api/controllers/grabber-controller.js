const cheerio = require('cheerio');
const axios = require('axios');
const { Event } = require('../models/event-model');
const planetaKino = async (req, res) => {
  try {
    const planetakino_URL = 'https://planetakino.ua';
    const YOUTUBE_SEARCH_URL = 'https://youtube.com/results?search_query=planetakino';
    let currentPage = 1;
    let totalPages = 1;
    const movieList = [];

    while (currentPage <= totalPages) {
      const html = await axios.get(`${planetakino_URL}/lvov/movies/page/${currentPage}`);

      let $ = await cheerio.load(html.data, {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: false,
        decodeEntities: true
      });

      // this code need to be executed only once to get `totalPages`
      if (currentPage === 1) {
        $('.pagination li a').each((index, element) => {
          if ($(element).data('page')) {
            // totalPages++;
          }
        });
      }

      // sets links into array of parsed movies
      $('.movie-block').each((index, element) => {
        movieList.push({});
        movieList[movieList.length - 1]['link'] = planetakino_URL + $(element).find('.movie-block__link').attr('href');
      });

      currentPage++;
    }

    for (let i = 0; i < movieList.length; i++) {
      if (i === 3) {
        if (movieList[i]['link']) {
          const currentLink = movieList[i]['link'];
          const currentMovieResponse = await axios.get(currentLink);

          let currentMovie = await cheerio.load(currentMovieResponse.data, {
            withDomLvl1: true,
            normalizeWhitespace: true,
            xmlMode: false,
            decodeEntities: true
          });

          movieList[i]['title'] = currentMovie('.movie-poster-block__title').text().trim();
          movieList[i]['original_title'] = currentMovie('.movie-poster-block__subtitle.movie').text().trim();
          movieList[i]['description'] = currentMovie('.movie-page-block__desc').text().trim();
          movieList[i]['baner'] = planetakino_URL + currentMovie('header.movie-poster-block').data('desktop');
          movieList[i]['poster'] = planetakino_URL + currentMovie('.movie-page-block__poster img').attr('src');
          // movieList[i]['youtube_link'] = currentMovie('.ytp__link').attr('href');
          // console.log(movieList[i]['youtube_link']);
          //condition here
          movieList[i]['imdb_rating'] = currentMovie('.rating span').text().trim();

          // movieList[i]['youtube_link'] = currentMovie('.youtube-player-controls.ytp-controls a.ytp__link').attr('href');

          let latestKey = '';

          currentMovie('.movie-page-block__summary dl').children().each((index, element) => {
            if (index % 2 === 0) {
              latestKey = currentMovie(element).attr('name');
            }
            if (index % 2 === 1) {
              movieList[i][latestKey] = currentMovie(element).text().trim();
            }
          });
          console.log(YOUTUBE_SEARCH_URL + buildYoutubeQuery(movieList[i]['title']))
          const youtubeResponse = await axios.get(YOUTUBE_SEARCH_URL + buildYoutubeQuery(movieList[i]['title']));
          // console.log(youtubeResponse.data)
          let youtubeResult = await cheerio.load(youtubeResponse.data, {
            withDomLvl1: true,
            normalizeWhitespace: true,
            xmlMode: false,
            decodeEntities: true
          });
          console.log(youtubeResult('.ytd-thumbnail').text())
          res.status(200).send(youtubeResult('.ytd-thumbnail').text())
          return;
        }
      }
    }

    res.status(200).send(JSON.stringify(movieList));
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};

const buildYoutubeQuery = (title) => {
  return encodeURI('+' + title.split(' ').join('+'));
}

const getURL = (cityKey = '') => {
  return `https://${cityKey}karabas.com/en/concerts,theatres,business,clubs,seminars,festivals,quest,exhibitions,poetry,sport,stand-up,child/`;
}

const sortByDate = (data) => {
  data.sort((a, b) => {
    const firstTime = new Date(a.date).getTime();
    const secondTime = new Date(b.date).getTime();
    return firstTime - secondTime;
  });
  return data;
}

const karabasGrabber = async (req, res) => {
  try {
    const towns = ['lviv.', 'kiev.', 'kharkov.', 'odessa.'];
    let eventsList = [];
    for (let i = 0; i < towns.length; i++) {

      const karabas_URL = getURL(towns[i]);
      const arr = await grab_Karabas(karabas_URL);
      if (arr && arr.length) {
        console.log(arr.length)
        eventsList = [...eventsList, ...arr];

        for (let i = 0; i < arr.length; i++) {
          const eventInDB = await Event.findOne({ link: arr[i].link });
          if (eventInDB) {
            continue;
          }

          let event = new Event({
            link: arr[i].link,
            title: arr[i].title,
            categories: arr[i].categories,
            city: arr[i].city,
            price: arr[i].price,
            date: arr[i].date,
            img: arr[i].img
          });
          await event.save();
        }
      }
    }
    console.log('length: ', eventsList.length)
    // sortByDate(eventsList);

    res.status(200).json({ message: `Succesfully added ${eventsList.length} events` })
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};

module.exports = {
  planetaKino,
  karabasGrabber
};

const grab_Karabas = async (karabas_URL) => {
  // try {
  const eventsList = [];
  const html = await axios.get(`${karabas_URL}`);

  let $ = await cheerio.load(html.data, {
    withDomLvl1: true,
    normalizeWhitespace: true,
    xmlMode: false,
    decodeEntities: true
  });

  const allCategories = [
    'theatres',
    'concerts',
    'festivals',
    'quests',
    'stand-up',
    'children',
    'seminars',
    'business',
    'exhibitions',
    'poetry',
    'sports'
  ];

  $('.el-row').each((index, element) => {
    if ($(element).find('.el-info .el-name').text() !== 'Gift certificates') {
      eventsList.push({});

      let link = $(element).find('.el-info a').attr('href');
      let title = $(element).find('.el-info .el-name').text();
      let categories = $(element).find('.el-info .el-subhead').html();
      let city = $(element).find('.el-info p b').html();
      let price = $(element).find('.el-price b').html();

      let finalCategory = [];
      if (categories && typeof categories === 'string') {
        categories = categories.toLowerCase();

        allCategories.forEach((elem) => {
          if (categories.includes(elem)) {
            finalCategory.push(elem);
          }
        })
      }

      if (price && typeof price === 'string') {
        price = price.replace('\n', '').trim();
      }

      eventsList[eventsList.length - 1]['link'] = link;
      eventsList[eventsList.length - 1]['title'] = title;
      eventsList[eventsList.length - 1]['categories'] = finalCategory;
      eventsList[eventsList.length - 1]['city'] = city;
      eventsList[eventsList.length - 1]['price'] = price;

      const day = $(element).find('.el-title .fixed-level-2 em').html();
      let monthWithYear = $(element).find('.el-title .fixed-level-2 span').html();
      monthWithYear = monthWithYear.replace('&#x2019; ', '');
      const finalDate = `${day} ${monthWithYear}`
      eventsList[eventsList.length - 1]['date'] = new Date(finalDate);
    }
  });

  for (let index = 0; index < eventsList.length; index++) {
    const html = await axios.get(eventsList[index]['link'])
    let page = await cheerio.load(html.data, {
      withDomLvl1: true,
      normalizeWhitespace: true,
      xmlMode: false,
      decodeEntities: true
    });

    eventsList[index]['img'] = page('.container figure.ci-thumb img').attr('data-normal');
  }
  return eventsList;
  // } catch (err) {
  //   console.log(err)
  //   console.log(err.response)
  // }
} 

const cheerio = require('cheerio');
const axios = require('axios');
const { Event } = require('../models/event-model');
const { Course } = require('../models/course-model');


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
    const towns = ['odessa.'];
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

const courseraGrabber = async (req, res) => {
  try {
    const base_url = 'https://www.coursera.org';
    const languageLink = 'https://www.coursera.org/browse/language-learning?facets=entityTypeTag%3ACourses%2CcategoryMultiTag%3Alanguage-learning';
    const mobileAppLink = 'https://www.coursera.org/browse/computer-science/mobile-and-web-development?facets=entityTypeTag%3ACourses%2CsubcategoryMultiTag%3Amobile-and-web-development';
    const softwareLink = 'https://www.coursera.org/browse/computer-science/software-development?facets=entityTypeTag%3ACourses%2CsubcategoryMultiTag%3Asoftware-development';
    const musicLink = 'https://www.coursera.org/search?query=Music&facets=entityTypeTag%3ACourses%2CsubcategoryMultiTag%3Amusic-and-art';
    const economicLink = 'https://www.coursera.org/browse/social-sciences/economics?facets=entityTypeTag%3ACourses%2CsubcategoryMultiTag%3Aeconomics';
    const marketingLink = 'https://www.coursera.org/browse/business/marketing?facets=entityTypeTag%3ACourses%2CsubcategoryMultiTag%3Amarketing';

    const coursesList = [];

    const links = [languageLink, mobileAppLink, softwareLink, musicLink, economicLink, marketingLink];

    for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
      const html = await axios.get(`${links[linkIndex]}`);
      console.log('parsing, linkIndex ' + linkIndex);
      let $ = await cheerio.load(html.data, {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: false,
        decodeEntities: true
      });

      // sets links into array of parsed movies
      $(`.offering-wrapper`).each((index, element) => {
        coursesList.push({});
        coursesList[coursesList.length - 1]['link'] = base_url + $(element).find('.search-offering-card').attr('href');
        coursesList[coursesList.length - 1]['title'] = $(element).find('.search-offering-card').attr('aria-label');
        coursesList[coursesList.length - 1]['duration'] = $(element).find('.product-meta-wrapper .product-metadata:nth-child(2)').text();
        coursesList[coursesList.length - 1]['level'] = $(element).find('.product-meta-wrapper .product-metadata:nth-child(3)').text();
        coursesList[coursesList.length - 1]['img'] = $(element).find('.product-photo').attr('src');

        if (linkIndex === 0) {
          coursesList[coursesList.length - 1]['type'] = 'language';
        }

        if (linkIndex === 1 || linkIndex === 2) {
          coursesList[coursesList.length - 1]['type'] = 'programming';
        }

        if (linkIndex === 3) {
          coursesList[coursesList.length - 1]['type'] = 'music';
        }

        if (linkIndex === 4) {
          coursesList[coursesList.length - 1]['type'] = 'economic';
        }

        if (linkIndex === 5) {
          coursesList[coursesList.length - 1]['type'] = 'marketing';
        }
      });
    }

    for (let i = 0; i < coursesList.length; i++) {
      if (coursesList[i]['link']) {
        const currentLink = coursesList[i]['link'];
        const currentCourseResponse = await axios.get(currentLink);

        let currentCourse = await cheerio.load(currentCourseResponse.data, {
          withDomLvl1: true,
          normalizeWhitespace: true,
          xmlMode: false,
          decodeEntities: true
        });

        let rating = currentCourse('.number-rating').text();
        if (rating) {
          rating = rating.replace('stars', '');
        }
        coursesList[i]['rating'] = rating;

        // coursesList[i]['ratings-count'] = currentCourse('.ratings-count-expertise-style span').text();

        let description = currentCourse('.content-inner p').text();
        if (description) {
          description = description.replace('stars', '');
        }
        coursesList[i]['description'] = description;
        let instructorName = currentCourse('h3.instructor-name:first-child').text();
        if (instructorName) {
          instructorName = instructorName.replace('Top Instructor', ' ').split(' ');
          if (instructorName.length >= 2) {
            instructorName = `${instructorName[0]} ${instructorName[1]}`;
          } else {
            instructorName = ''
          }
        }
        coursesList[i]['instructor-avatar'] = currentCourse('.avatar-container:nth-child(1) img').attr('src');
        coursesList[i]['instructor-name'] = instructorName;
        coursesList[i]['instructor-title'] = currentCourse('.instructor-title:nth-child(1)').text();
        console.log('coursesList ', i);
        // coursesList[i].timeline = [];

        // currentCourse('.SyllabusWeek').each((index, element) => {
        //   coursesList[i].timeline.push({ order: index + 1 });
        //   currentCourse('.SyllabusModule').each()

        //   // coursesList[i].timeline[index].title = 
        // })
      }
    }

    for (let i = 0; i < coursesList.length; i++) {
      const courseInDB = await Course.findOne({ link: coursesList[i].link });
      if (courseInDB) {
        continue;
      }

      console.log('course ' + i);

      let course = new Course({
        link: coursesList[i].link,
        title: coursesList[i].title,
        type: coursesList[i].type,
        duration: coursesList[i].duration,
        level: coursesList[i].level,
        rating: coursesList[i].rating,
        description: coursesList[i].description,
        'instructor-avatar': coursesList[i]['instructor-avatar'],
        'instructor-name': coursesList[i]['instructor-name'],
        'instructor-title': coursesList[i]['instructor-title'],
        img: coursesList[i].img
      });
      await course.save();
    }
    console.log(coursesList.length)
    res.status(200).send(JSON.stringify(coursesList));
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};


module.exports = {
  planetaKino,
  karabasGrabber,
  courseraGrabber
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

const cheerio = require('cheerio');
const axios = require('axios');

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
          console.log(youtubeResult('.ytd-video-renderer').html())
          // movieList[i]['youtube_link'] = youtubeResult('ytd-item-section-renderer #contents ytd-video-renderer:first-child').html();

          // console.log(movieList[i]['youtube_link']);
          // res.status(200).send(movieList[i]['youtube_link']);
        }
      }
    }

    res.status(200).send(JSON.stringify(movieList));
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};

module.exports = {
  planetaKino
};

const buildYoutubeQuery = (title) => {
  // console.log(title.split(' '))
  // let finalString = '';

  // title.split(' ').forEach(element => {
  //   if (element.length) {
  //     fin
  //   }
  // });
  return encodeURI('+' + title.split(' ').join('+'));
}

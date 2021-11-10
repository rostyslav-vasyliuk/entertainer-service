const express = require('express');

const movieController = require('../controllers/movies-controller');
const router = new express.Router();

router.get('/details/:id', movieController.getDetails);

router.get('/recommendations', movieController.getRecommendations);

router.get('/get-similar/:id', movieController.getSimilar);

router.get('/get-top-by-genre/:genre_id', movieController.getByGenres);

router.get('/get-top-ten', movieController.getTopTen);

router.get('/get-upcoming', movieController.getUpcoming);

router.get('/get-top-rated', movieController.getTopRated);

router.get('/get-now-playing', movieController.getNowPlaying);

router.get('/search/:query', movieController.searchMovie);

router.get('/kmeans', movieController.kMeans);

router.post('/set-rating', movieController.setRating);

router.get('/favourite', movieController.getFavourites);

module.exports = router;

const express = require('express');

const tvSeriesController = require('../controllers/tv-series-controller');
const router = new express.Router();

router.get('/details/:id', tvSeriesController.getDetails);

router.get('/get-top-ten', tvSeriesController.getTopTen);

router.get('/season/details', tvSeriesController.getSeason);

router.get('/recommendations', tvSeriesController.getRecomendations);
module.exports = router;

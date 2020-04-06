const express = require('express');

const tvSeriesController = require('../controllers/tv-series-controller');
const router = new express.Router();

router.get('/details/:id', tvSeriesController.getDetails);

module.exports = router;

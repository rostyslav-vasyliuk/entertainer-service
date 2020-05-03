const express = require('express');

const router = new express.Router();

const recommendationsController = require('../controllers/recommendations-controller');

router.get('/list', recommendationsController.getRecommendations);

module.exports = router;

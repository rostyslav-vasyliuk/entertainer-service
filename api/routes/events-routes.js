const express = require('express');

const router = new express.Router();

const eventsController = require('../controllers/events-controller');

router.get('/list', eventsController.getEvents);

router.get('/details/:id', eventsController.getDetails);

router.post('/favourite', eventsController.addToFavourites);

router.get('/favourite', eventsController.getFavourites);

module.exports = router;

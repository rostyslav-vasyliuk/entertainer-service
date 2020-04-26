const express = require('express');

const router = new express.Router();

const eventsController = require('../controllers/events-controller');

router.get('/list', eventsController.getEvents);

router.get('/details/:id', eventsController.getDetails);

module.exports = router;

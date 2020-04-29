const express = require('express');

const router = new express.Router();

const courseController = require('../controllers/course-controller');

router.get('/list', courseController.getCourses);

router.get('/details/:id', courseController.getDetails);

router.post('/favourite', courseController.addToFavourites);

router.get('/favourite', courseController.getFavourites);

module.exports = router;

const express = require('express');

const router = new express.Router();

const grabberController = require('../controllers/grabber-controller');

router.get('/planeta-kino', grabberController.planetaKino);

router.get('/karabas', grabberController.karabasGrabber);

router.get('/udemy', grabberController.courseraGrabber);

module.exports = router;

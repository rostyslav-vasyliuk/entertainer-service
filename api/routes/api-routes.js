const express = require('express');

const grabberRoutes = require('./grabber-routes');
const moviesRouter = require('./movies-routes');
const tvSeriesRouter = require('./tv-series-routes');

const router = new express.Router();

router.use('/grabber', grabberRoutes);

router.use('/movies', moviesRouter);

router.use('/tv-series', tvSeriesRouter);

module.exports = router;

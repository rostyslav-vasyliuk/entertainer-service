const express = require('express');

const authRoutes = require('./auth-routes');
const moviesRouter = require('./movies-routes');
const tvSeriesRouter = require('./tv-series-routes');
const actorRouter = require('./actor-routes');
const profileRouter = require('./profile-routes');
const recommendationsRouter = require('./recommendation-routes');

const router = new express.Router();

router.use('/auth', authRoutes);

router.use('/movies', moviesRouter);

router.use('/tv-series', tvSeriesRouter);

router.use('/actor', actorRouter);

router.use('/profile', profileRouter);

router.use('/recommendations', recommendationsRouter);

module.exports = router;

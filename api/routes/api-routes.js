const express = require('express');

const authRoutes = require('./auth-routes');
const grabberRoutes = require('./grabber-routes');
const moviesRouter = require('./movies-routes');
const tvSeriesRouter = require('./tv-series-routes');
const actorRouter = require('./actor-routes');
const eventsRouter = require('./events-routes');
const courseRouter = require('./course-routes');
const profileRouter = require('./profile-routes');
const recommendationsRouter = require('./recommendation-routes');

const router = new express.Router();

router.use('/auth', authRoutes);

router.use('/grabber', grabberRoutes);

router.use('/movies', moviesRouter);

router.use('/tv-series', tvSeriesRouter);

router.use('/actor', actorRouter);

router.use('/events', eventsRouter);

router.use('/courses', courseRouter);

router.use('/profile', profileRouter);

router.use('/recommendations', recommendationsRouter);

module.exports = router;

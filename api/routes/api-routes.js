const express = require('express');

const grabberRoutes = require('./grabber-routes');
const router = new express.Router();

router.use('/grabber', grabberRoutes);

module.exports = router;

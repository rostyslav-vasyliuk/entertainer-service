const express = require('express');

const router = new express.Router();

const actorController = require('../controllers/actor-controller');

router.get('/details/:id', actorController.getDetails);

module.exports = router;

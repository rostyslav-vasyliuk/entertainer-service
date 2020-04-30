const express = require('express');

const profileController = require('../controllers/profile-controller');
const router = new express.Router();

router.post('/feedback', profileController.sendFeedback);

router.post('/password', profileController.changePassword);

router.post('/update-profile', profileController.updateProfile);

module.exports = router;

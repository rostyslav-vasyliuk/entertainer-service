const express = require('express');

const router = new express.Router();

const authController = require('../controllers/auth-controller');

router.post('/sign-in', authController.signIn);

router.post('/sign-up', authController.signUp);

router.post('/validate-user', authController.validateUser);

module.exports = router;

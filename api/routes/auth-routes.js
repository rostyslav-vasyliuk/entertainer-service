const express = require('express');

const router = new express.Router();

const authController = require('../controllers/auth-controller');

router.post('/sign-in', authController.signIn);

router.post('/sign-up', authController.signUp);

router.post('/validate-user', authController.validateUser);

router.post('/validate-email', authController.validateEmail);

router.post('/forgot-password-pending', authController.forgotPasswordPending);

router.post('/confirm-code', authController.confirmForgotPasswordCode);

router.post('/reset-password', authController.resetPassword);

module.exports = router;

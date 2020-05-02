const express = require('express');
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
const upload = multer({ storage: storage });

const profileController = require('../controllers/profile-controller');
const router = new express.Router();

router.post('/feedback', profileController.sendFeedback);

router.post('/password', profileController.changePassword);

router.post('/update-profile', profileController.updateProfile);

router.post('/set-preferences', profileController.setPreferences);

router.post('/set-order', profileController.setCategoriesOrder);

router.post('/avatar-upload', upload.single('avatar'), profileController.changeUserPhoto);

module.exports = router;

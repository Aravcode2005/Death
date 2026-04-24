const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/signin', authController.getSignin);
router.post('/signin', authController.postSignin);
router.get('/mainScene',authController.getMainScene);
module.exports = router;
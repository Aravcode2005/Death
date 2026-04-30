const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/signin', authController.getSignin);
router.post('/signin', authController.postSignin);
router.get('/mainScene',authController.isAuthenticated,authController.getMainScene);//Protected Route now this route is not acessible to every user only the authorized users are allowed to enter 
router.post('/mainScene',authController.postLogout);
module.exports = router;
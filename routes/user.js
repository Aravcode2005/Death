const express=require('express');
const userController=require('../controllers/user');
const authController=require('../controllers/auth');
const router=express.Router();
router.get('/user',authController.isAuthenticated,authController.verifyJwt,userController.getuserpage);
router.post('/user',authController.isAuthenticated,authController.verifyJwt,userController.postuserpage);
router.get('/profile',authController.verifyJwt,userController.getProfile);
module.exports=router;

router.get('/user',authController.verifyJwt,userController.getuserpage);
router.post('/user',userController.postuserpage);
router.get('/profile',authController.verifyJwt,userController.getProfile);
module.exports=router;



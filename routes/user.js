const express=require('express');
const userController=require('../controllers/user');
const authController=require('../controllers/auth');
const router=express.Router();
router.get('/user',authController.verifyJwt,userController.getuserpage);
router.post('/user',userController.postuserpage);
router.get('/profile',authController.verifyJwt,userController.getProfile);
module.exports=router;



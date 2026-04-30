const express=require('express');
const userController=require('../controllers/user');
const router=express.Router();
router.get('/user',userController.getuserpage);

router.post('/user',userController.postuserpage);


router.get('/profile',userController.getProfile);

module.exports=router;



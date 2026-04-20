
const userdata = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();
exports.getSignin=(req,res,next)=>{
   res.render("signin",{
    pageTitle:"Signin"
   })
}
exports.postSignin=(req,res,next)=>{
    const  email=req.body.email;
    const  password=req.body.Pswd;
}

exports.getSignup = (req, res, next) => {
    res.render("signup", {
        pageTitle: "Signup"
    })
}
exports.postSignup = async (req, res, next) => {
    try {
        const name = req.body.Name;
        const email = req.body.email;
        const password = req.body.Pswd;
        await userdata.insertOne({
            name: name,
            email: email,
            password: password
        })
        res.redirect('/signin');
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in saving the user");
    }
}

const userdata = require('../model/user');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
exports.getSignin = (req, res, next) => {
    res.render("signin", {
        pageTitle: "Signin"
    })
}
exports.postSignin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.Pswd;
        const user = await userdata.findOne({ email: email });
        if (!user) {
            req.flash('error', 'Invalid Email or password');
            return res.redirect('/signin');
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return res.redirect('/EchoesOfOblivion');
        } else {
            req.flash('error', 'Invalid Email or Password');
            return res.redirect('/signin');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/signin');
    }
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
        const hashedpassword = await bcrypt.hash(password, 15);
        userdata.insertOne({
            name: name,
            email: email,
            password: hashedpassword
        })
        res.redirect('/');
    }
    catch (error) {
        console.log(error);
    }
}
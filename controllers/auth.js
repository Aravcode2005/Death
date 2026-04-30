
const userdata = require('../model/user');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
exports.getSignin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("signin", {
        path: '/signin',
        pageTitle: "Signin",
        oldInput: {
            email: ' ',
            password: ' '
        },
        validationErrors: []
    });
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
            console.log("Session" + req.session.id);
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.username = user.name;
            req.session.email = email;
            req.session.photo=photo;
            console.log("User is Logged in" + req.session.user);
            return res.redirect('/user');//yeh jo user vala page hai hum isme current user jo session me configured hai ek page pe new game load karenge aur doosre page pe uski saari details load karenge 
        } 
        else {
            req.flash('error', 'Invalid Email or Password');
            return res.redirect('/signin');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/signin');
    }
}

exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        return next();
    }
    else {
        return res.redirect('/signin');
    }
}
//make 
//THEN I SHOULD MAKE THE PROTECTED ROUTES AS THE USERROUTES 
exports.getMainScene = (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.render('mainScene', {
            pageTitle: "mainScene",
            username: req.session.username
        })
    }
    else if (!req.session.isLoggedIn) {
        console.log('User not authenticated');
        return res.redirect('/');
    }
}
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        console.log("Destroying the current session");
        res.redirect('/');
    });
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
        const image = req.file;
        if(!image){
            return res.status(422).render('error')={
            pageTitle:'Error',
            message:'Some error occured we are trying to fix it'
            }
        }
        const imageUrl=image.path;
        const dupname = await userdata.findOne({ name: name });
        if (dupname) {
            console.log("Username already exists");
            res.redirect('/signup');
        }
        const dupmail = await userdata.findOne({ email: email });
        if (dupmail) {
            req.flash("Email id already exists ,signin to continue");
            res.redirect('/signin');
        }
        const hashedpassword = await bcrypt.hash(password, 20);
        await userdata.create({
            name: name,
            email: email,
            password: hashedpassword,
            img: imageUrl
        });
        res.redirect('/signin');
    }
    catch (error) {
        console.error('Signup error:', error);
        res.redirect('/signup');
    }
}


const userdata = require('../model/user');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
exports.getSignin = (req, res, next) => {
    res.render("signin", {
        pageTitle: "Signin"
    })
}
exports.postSignin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.Pswd;
    userdata.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid Email or password');
                return res.redirect('/signin');
            }
            bcrypt.
                compare(password, user.password).then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return res.redirect('/EchoesOfOblivion');
                    }
                    else {
                        req.flash('error', 'Invalid Email or Password');
                        return res.redirect('/signin')

                    }
                })
        })

}

exports.getSignup = (req, res, next) => {
    res.render("signup", {
        pageTitle: "Signup"
    })
}
exports.postSignup = (req, res, next) => {
    try {
        const name = req.body.Name;
        const email = req.body.email;
        const password = req.body.Pswd;
        bcrypt.hash(password,15);
        userdata.collection.insertOne({
            name: name,
            email: email,
            password: password
        })
        res.redirect('/');
    }
    catch (error) {
        console.log(error);
    }
}
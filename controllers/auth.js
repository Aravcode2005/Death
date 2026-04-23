
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
      validationErrors:[]
    });
}
exports.postSignin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.Pswd;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('signin', {
                path: '/signin',
                pageTitle: 'Signin',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password
                }
            })
        }
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
        res.redirect('/signin');
    }
    catch (error) {
        console.log(error);
    }
}
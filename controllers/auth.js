
const userdata = require('../model/user');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { options } = require('../routes/auth');
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
        const img = req.body.imageUrl;
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
            req.session.photo = user.imageUrl;
            const payload = {
                id: req.session.id,
                user: req.session.username,
                role: "player"
            }
            const secretKey = process.env.JWT_SECRET;
            const expiresIn = process.env.JWT_EXPIRES_IN;
            const token = jwt.sign(payload, secretKey, { expiresIn });
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000,
                path: '/'
            })
            console.log("JWT token generated:", token);
            console.log("User is Logged in" + req.session.user);
            return res.redirect('/user');
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

exports.verifyJwt = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            message: 'JWT cookie  not found'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.session.username = decoded.user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
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
        res.clearCookie('jwt');
        res.redirect('/');
    });
}
exports.getSignup = (req, res, next) => {
    res.render("signup", {
        pageTitle: "Signup"
    })
}

exports.geterror = (req, res, next) => {
    res.render('error', {
        pageTitle: "Error",
    });
}
exports.postSignup = async (req, res, next) => {
    console.log("Signup hit");
    try {
        const name = req.body.Name;
        const email = req.body.email;
        const password = req.body.Pswd;
        const image = req.file;
        console.log(image);
        if (!image) {
            try {
                return res.status(422).redirect('/error');
            } catch (error) {
                console.log(error);
            }
            return;
        }
        else {
            const dupname = await userdata.findOne({ name: name });
            if (dupname) {
                console.log("Username already exists");
                return res.redirect('/signup');

            }
            const dupmail = await userdata.findOne({ email: email });
            if (dupmail) {
                req.flash('error', "Email id already exists ,signin to continue");
                return res.redirect('/signin');

            }
            else {
                const hashedpassword = await bcrypt.hash(password, 12);
                await userdata.create({
                    name: name,
                    email: email,
                    password: hashedpassword,
                    imageUrl: '/images/' + image.filename
                })
                return res.redirect('/signin');

            }
        }
    }
    catch (error) {
        console.error('Signup error:', error);
        return res.redirect('/signup');
    }
}

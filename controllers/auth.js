
const userdata = require('../models/user');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
dotenv.config();
const transporter = nodemailer.createTransport(({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SGKEY
    }

}))
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
            req.session.email = user.email;
            req.session.pswd = user.password;
            req.session.photo = user.imageUrl;
            req.session.games = user.gamesplayed;
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
exports.getMainScene = async (req, res, next) => {

    if (req.session.isLoggedIn) {
        res.render('mainScene', {
            pageTitle: "mainScene",
            username: req.session.username,
            userId: req.session.user._id
        })
        let totalgames = req.session.games;
        console.log(totalgames);
        totalgames += 1;
        console.log(await userdata.findById(req.session.user._id));
        const info = await userdata.findByIdAndUpdate(req.session.user._id, {
            name: req.session.username,
            email: req.session.email,
            password: req.session.pswd,
            imageUrl: req.session.photo,
            gamesplayed: totalgames
        });
        console.log(info);
    }
    else if (!req.session.isLoggedIn) {
        console.log('User not authenticated');
        return res.redirect('/');
    }
}
exports.postMainScene = (req, res, next) => {
    const chatText = req.body.chatIp;
    console.log(chatText);
    // socket.on("post", () => {
    //     console.log("Successfully recieved the message" + chatText);
    //      res.redirect('/mainScene');
    // })
    res.redirect('/mainScene');
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
    console.log("Check point 1!!!!");
    console.log("Signup hit");
    try {
        const name = req.body.Name;
        const email = req.body.email;
        const password = req.body.Pswd;
        const image = req.file;
        const games = 0;
        console.log(image);

        if (!image) {
            try {
                return res.status(422).redirect('/error');
            } catch (error) {
                console.log(error);
            }
            return;
        }


        else if (image) {
            console.log("Checkpoint 2 hit!!!")
            console.log("We have the image");
            const dupname = await userdata.findOne({ name: name });
            if (dupname) {
                console.log("Speed breaker!!!" + dupname);
                console.log("Now returning");
                console.log("Username already exists");
                return res.redirect('/signup');
            }
            const dupmail = await userdata.findOne({ email: email });
            if (dupmail) {
                console.log("Another speedbreaker" + dupmail);
                return res.redirect('/signin');
            }
            else {
                console.log("Checkpoint 3 hit");
                const hashedpassword = await bcrypt.hash(password, 12);
                console.log(hashedpassword);
                const newuser = await userdata.create({
                    name: name,
                    email: email,
                    password: hashedpassword,
                    imageUrl: '/images/' + image.filename,
                    gamesplayed: games
                })
                console.log(newuser);
                if (newuser) {
                    console.log("Checkpoint 4 hit" + newuser)
                    const mal = await transporter.sendMail({
                        to: email,
                        from: 'darkcodexismyst@gmail.com',
                        subject: 'Signup Succeded!',
                        html: '<h1>Welcome to pixelfantasy!</h1>'
                    })
                    console.log(mal);
                    if (mal) {
                        console.log("Final checkpoint hit,Congratulations!,you have succesfully sent the mail");
                        console.log("Email sent!");
                        return res.redirect('/signin');
                    }
                    else if (!mal) {
                        return res.status(404).json({
                            message: "Yamete kudasai ,onichaaaaaaaaaaannnn!!!!!"
                        })
                    }
                }
                else if (!newuser) {
                    console.log("Phattt gya BC!");
                    res.redirect('/signup');
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

        }
    }
    catch (error) {
        console.error('Signup error:', error);
        return res.redirect('/signup');
    }
}
exports.geteditProfile = (req, res, next) => {
    res.render('editProfile', {
        pageTitle: req.session.username,
    })
}
exports.posteditProfile = async (req, res, next) => {
    const name = req.body.Name;
    const image = req.file;

    const dupname = await userdata.findOne({ name: name });
    if (dupname) {
        console.log("Username already exists");
        return res.redirect('/editProfile');
    }
    const updatedUser = await userdata.findByIdAndUpdate(req.session.user._id, {
        name: name,
        email: req.session.email,
        password: req.session.pswd,
        imageUrl: '/images/' + image.filename,
        gamesplayed: req.session.games
    },
        {
            new: true,
            runValidators: true,
        }
    );
    if (updatedUser) {
        console.log("Successful");
        console.log(updatedUser);
        return res.redirect('/editProfile');
    }

}
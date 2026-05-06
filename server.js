const express = require('express');
const path = require('path');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const cookieParser=require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null,Date.now()+'-'+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();
const ConnectDB = require('./util/database');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
}))
app.use(flash());
app.get('/', (req, res, next) => {
    console.log('Cookies:',JSON.stringify(req.cookies));
    res.render('Eco', {
        pageTitle: "Echoes of Oblivion",
        junglelink: '/mainScene',
        sealink: '/sea'
    })
    console.log('Signed Cookies:',JSON.stringify(req.signedCookies));
})
app.get('/EchoesOfOblivion', (req, res, next) => {
    res.render('Eco', {
        pageTitle: "Echoes of Oblivion",
        junglelink: '/mainScene',
        sealink: '/sea'
    })
})
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.get('/sea', (req, res, next) => {
    res.render("Sea", {
        pageTitle: "seaScene"
    })
})
app.get('/heartBeat', (req, res, next) => {
    res.render('dil', {
        pageTitle: "HeartBeat"
    })
})
app.use(authRoutes);
app.use(userRoutes);
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.emit('response', 'Message received');
    });
    socket.on('disconnect', () => console.log('User disconnected'));
});
ConnectDB.then(() => {
    server.listen(3000, () => console.log("http://localhost:3000"));
}).catch(err => {
    console.log("Error found in connecting ");
})



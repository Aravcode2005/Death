const express = require('express');
const path = require('path');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const flash = require('connect-flash');
const ConnectDB = require('./util/database');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
}))
app.use(flash());
app.get('/', (req, res, next) => {
    res.render('Eco', {
        pageTitle: "Echoes of Oblivion",
        junglelink: '/mainScene',
        sealink: '/sea'
    })
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



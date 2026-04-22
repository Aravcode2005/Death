const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))
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
app.get('/mainScene', (req, res, next) => {
    res.render('mainScene', {
        pageTitle: "mainScene"
    })
})
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

const ws = require('ws');
const { Session } = require('inspector');
const wss = new ws.Server({ server });
wss.on('connection', socket => {
    let id = toString(Math.random() * 100);
    socket.on('message', msg => {
        socket.send(`Echo:${msg}`);
    });
    socket.on('close', () => console.log('Client disconnected'));
});
server.listen(3000, () => console.log("http://localhost:3000"));


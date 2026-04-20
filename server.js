const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res, next) => {
    res.redirect('/EchoesOfOblivion');
})

app.get('/EchoesOfOblivion', (req, res, next) => {
    res.render('Eco', {
        pageTitle: "HomePage",
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
const ws = require('ws');
const wss = new ws.Server({ server });
wss.on('connection', socket => {
    let id=toString(Math.random()*100);
    socket.on('message', msg => {
        socket.send(`Echo:${msg}`);
    });
    socket.on('close', () => console.log('Client disconnected'));
});
server.listen(3000, () => console.log("http://localhost:3000"));


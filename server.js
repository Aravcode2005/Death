const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res, next) => {
    res.redirect('/mainScene');
})
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/mainScene', (req, res, next) => {
    res.render('mainScene', {
        pageTitle: "mainScene"
    })
})
app.get('/heartBeat', (req, res, next) => {
    res.render('dil', {
        pageTitle: "HeartBeat"
    })
})
console.log("http://localhost:3000");
app.listen(3000);
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.get('/',(req,res,next)=>{
    res.redirect('/mainScene');
})
app.get('/mainScene',(req,res,next)=>{
    res.send("Hello");
})
console.log("https://localhost:3000");
app.listen(3000);
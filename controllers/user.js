exports.getuserpage = (req, res, next) => {
    console.log("This is the email of the user" + req.session.email);
    console.log("This is the name of the logged in user " + req.session.username);
    res.render('user', {
        pageTitle: req.session.username
    })
}
exports.postuserpage = (req, res, next) => {
    res.redirect('/mainScene');
}
exports.getProfile = (req, res, next) => {
    res.render('profile', {
        pageTitle: "profile",
        personname: req.session.username,
        personemail: req.session.email,
        personpassword: req.session.password,
        personimage:req.session.photo,
    })
}








exports.getuserpage = (req, res, next) => {
    console.log("This is the email of the user" + req.session.email);
    console.log("This is the name of the logged in user " +JSON.stringify(req.session.username));
    res.render('user', {
        pageTitle: req.session.username
    })
}
exports.postuserpage = (req, res, next) => {
    const { action } = req.body;
    try {
        if (action === "profile") {
            res.redirect(`/profile?tag=${JSON.stringify(req.session.username)}`);
        }
        else if (action === "game") {
            res.redirect(`/mainScene?tag=${req.session.id}`);
        }
        else {
            res.redirect(`/user?tag=${JSON.stringify(req.session.username)}`);
        }
    }
    catch (error) {
        console.log("Error detected" + error);
    }
}

exports.getProfile = (req, res, next) => {
    res.render('profile', {
        pageTitle: "profile",
        personname: req.session.username,
        personemail: req.session.email,
        personimage: req.session.photo,
        persongames:req.session.games

    })
}







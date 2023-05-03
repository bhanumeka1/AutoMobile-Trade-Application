const Trade = require('../models/trade');

exports.isGuest = (req, res, next)=>{
    if(!req.session.user)
        return next();
    else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/user/profile');
    }
};

exports.isLoggedIn = (req, res, next) =>{
    if(req.session.user)
        return next();
    else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/user/login');
    }
};

exports.isAuthor = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
    .then(trade=>{
        if(trade) {
            if(trade.author == req.session.user) {
                return next();
            } else {
                req.flash('error', 'Unauthorized to access the resource');
                return res.redirect('/')
                //let err = new Error('Unauthorized to access the resource');
                //err.status = 401;
                //return next(err);
            }
        }
    })
    .catch(err=>next(err));
};
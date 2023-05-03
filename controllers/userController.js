const model = require('../models/user');
const Trade = require('../models/trade');
const offModel = require('../models/offers');
const wishModel = require('../models/wishlist');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
   let user = new model(req.body);
    user.save()//insert the document to the database
    .then(user=> res.redirect('/user/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/user/new');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/user/new');
        }
        next(err);});
}
    

exports.getUserLogin = (req, res, next) => {
    return res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'Wrong email address');  
            res.redirect('/user/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/user/profile');
            } else {
                req.flash('error', 'Wrong password');      
                res.redirect('/user/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all(
        [
            model.findById(id), 
            Trade.find({author: id}),
            Trade.find({watchlist:true}),
            wishModel.find({SavedBy:id}),
            Trade.find({offered:true}),
            offModel.find({OfferedBy:id})
        ])
    .then(results=>{
        const [user, trades, saved, saves, offered, offers] = results;
        res.render('./user/profile', {user, trades, saved, saves, offered, offers})
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };




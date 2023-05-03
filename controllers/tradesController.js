const model = require('../models/trade');
const offModel = require('../models/offers');
const watchModel = require('../models/wishlist');

exports.index = (req,res,next)=>{
    model.find()
    .then(trades=>res.render('./index',{trades}))
    .catch(err=>next(err));                 
};

exports.new = (req,res)=>{
    res.render('./newTrade');
};

exports.create = (req,res,next)=>{
    let trade = new model(req.body);
    trade.author = req.session.user;
    trade.offered = false;
    trade.offerName = "";
    trade.watchlist = false;
    trade.save()
    .then((trade)=>{
        res.redirect('/trades');
        req.flash('success','Trade created Successfully')
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status=400;
        }
        next(err);
    });
};

exports.trade = (req,res,next)=>{        
    let id = req.params.id
    /*if(!id.match(/^[0-9a-fA_F]{24}$/)){
        let err = new Error('Invalid Trade id');
        err.status=400;
        next(err);
    }*/
    model.findById(id).populate('author','firstName lastName')
    .then(trade=>{
        if(trade){
            return res.render('./trade',{trade});
        } else {
            let err = new Error('Cannot find a trade with id '+id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{next(err)});
};

exports.trades = (req,res,next)=>{
    model.find()
    .then(trades=>{
        let categoriesS = new Set();
        for(var b=0;b<trades.length;b++){
            categoriesS.add(trades[b].category.trim());
        }
        let categories = Array.from(categoriesS);
        res.render('./trades',{trades,categories})
    })
    .catch(err=>next(err));
};

exports.edit = (req,res,next)=>{                 
    let id = req.params.id;
    /*if(!id.match(/^[0-9a-fA_F]{24}$/)){
        let err = new Error('Invalid Trade id');
        err.status=400;
        return next(err);
    }*/
    model.findById(id)
    .then(trade=>{
        if(trade){
            return res.render('./edit',{trade});
        } else {
            let err = new Error('Cannot find a trade with id '+id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};
    
exports.update = (req,res,next)=> {
    let trade = req.body;
    let id = req.params.id;
    
    /*if(!id.match(/^[0-9a-fA_F]{24}$/)){
        let err = new Error('Invalid Trade id');
        err.status=400;
        return next(err);
    }*/
    model.findByIdAndUpdate(id,trade,{useFindAndModify: false, runValidators: true})
    .then(trade=>{
        if(trade){
            req.flash('success','Updated Successfully');
            return res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find a trade with id '+id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
            err.status = 400;
        next(err)
    });
};

exports.delete = (req,res,next)=> {    
    let id = req.params.id;
    /*if(!id.match(/^[0-9a-fA_F]{24}$/)){
        let err = new Error('Trade with id '+id+' not found');
        err.status=400;
        return next(err);
    }*/
    model.findByIdAndDelete(id,{useFindAndModify: false})
    .then(trade=>{
        if(trade){
            req.flash('success','Deleted Successfully');
            return res.redirect('/trades');
        } else {
            let err = new Error('Cannot find a trade with id '+id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{next(err)});
};

exports.createTrade = (req,res,next)=>{
    let user = req.session.user;
    let id = req.params.id;
    model.findByIdAndUpdate(id,{status:"Offer pending", offered:true},{useFindAndModify:false,runValidators:true})
    .then((item)=>{
        let offerItem = new offModel({
            Name: item.name,
            Status: "Offer pending",
            Category: item.category,
            OfferedBy: user,
        });
        offerItem.save().then((offer)=>{
            model.find({author:user})
            .then((items)=>{
                res.render("./trademaking",{items});
            })
            .catch(err=>{next(err)});
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.ownTrade = (req,res,next) =>{
    let user = req.session.user;
    let id = req.params.id;
    Promise.all([
        model.findByIdAndUpdate(id,{status:"Offer pending"},{useFindAndModify:false,runValidators:true}),
        offModel.findOne({OfferedBy:user}).sort({_id:-1}),
    ])
    .then((results)=>{
        const [item, offered] = results;
        let name = offered.Name;
        model.findByIdAndUpdate(id,{offerName:name},{useFindAndModify:false,runValidators:true})
        .then((item)=>{
            req.flash("success","Offer Created");
            res.redirect("/user/profile");
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.deleteOffer = (req,res,next)=>{
    let id = req.params.id;
    model.findByIdAndUpdate(id,{status:"Available",offered:false},{useFindAndModify:false,runValidators:true})
    .then((item)=>{
        let name = item.name;
        Promise.all([
            model.findOneAndUpdate({offerName:name},{status:"Available",offerName:""}),
            offModel.findOneAndDelete({Name:name},{useFindAndModify:false})
        ])
        .then((result)=>{
            const [item,offered] = result;
            req.flash("success","You have successfully cancelled the offer you made");
            res.redirect("/user/profile");
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.managetrades = (req,res,next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findById(id)
    .then((item) => {
        if (item.offerName==="") {
            let name = item.name;
            model.findOne({offerName:name})
            .then((item) => {
                res.render("./managetrade", { item });
            })
            .catch(err=>next(err));
        } else {
            let name = item.offerName;
            offModel.findOne({ Name: name })
            .then((offer) => {
                res.render("./manageoffer", { item, offer });
            })
            .catch(err=>next(err));
        }
    })
    .catch(err=>next(err))
};

exports.managedeleteoffer = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndUpdate(id, { status: "Available", offerName: "" })
    .then((item) => {
        let name = item.offerName;
        Promise.all([offModel.findOneAndDelete({ Name: name }),
          model.findOneAndUpdate({ name: name },{ status: "Available", offered: false }),
        ])
        .then((results) => {
            const [offer, item] = results;
            req.flash("success", "You cancelled the offer you made");
            res.redirect("/user/profile");
        })
        .catch(err=>next(err));
    })
    .catch(err=>nect(err));
};
  
exports.accept = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndUpdate(id,{status:"Traded"},{useFindAndModify:false,runValidators:true,})
    .then((item) => {
        let name = item.offerName;
        Promise.all([
            model.findOneAndUpdate({name:name},{status:"Traded"},{useFindAndModify:false,runValidators:true}),
            offModel.findOneAndDelete({Name:name},{useFindAndModify:false}),
        ])
        .then((results) => {
            const [item, offer] = results;
            req.flash("success", "Acccepted the offer");
            res.redirect("/user/profile");
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};
  
exports.reject = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndUpdate(id,{status:"Available",offerName:""},{useFindAndModify: false,runValidators: true})
    .then((item) => {
        let name = item.offerName;
        Promise.all([
            model.findOneAndUpdate({name:name},{status:"Available", offered:false},{useFindAndModify:false,runValidators:true}),
            offModel.findOneAndDelete({Name:name})
        ])
        .then((results) => {
            const [item,offer]=results;
            let name = item.name;
            let status = item.status;
            if (item.watchlist) {
                watchModel.findOneAndUpdate({Name:name},{Status:status},{useFindAndModify: false,runValidators: true})
                .then((save) => {})
                .catch(err=>next(err));
            }
            req.flash("success", "You rejected the offer..");
            res.redirect("/user/profile");
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};
  
exports.watchlistadd = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndUpdate(id,{watchlist:true},{useFindAndModify:false,runValidators:true})
    .then((item) => {
        let name = item.name;
        let newSaveItem = new watchModel({
            Name: item.name,
            Category: item.category,
            Status: item.status,
        });
        newSaveItem.SavedBy = req.session.user;
        watchModel.findOne({Name:name})
        .then((item) => {
            if(!item){
                newSaveItem.save()
                .then((newSaveItem) => {
                    req.flash("success", "Saved to watchlist");
                    res.redirect("/user/profile");
                })
                .catch((err) => {
                    if (err.name === "ValidationError") {
                        err.status = 400;
                  }
                  next(err);
                });
            } else {
                req.flash("error","This item already exists in the watchlist");
                res.redirect("/user/profile");
            }
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};
  
exports.savedelete = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndUpdate(id, { watchlist: false })
    .then((item) => {
        let name = item.name;
        watchModel.findOneAndDelete({Name:name},{useFindAndModify:false })
        .then((save) => {
            req.flash("success", "Removed from watchlist");
            res.redirect("back");
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};
const {body, validationResult} = require("express-validator");
exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid Trade Id');
        err.status = 400;    
        return next(err);
    }
    else {
        next();
    }
};

exports.validateSignup = [
    body("firstName","First Name cannot be empty").notEmpty().trim().escape(),
    body("lastName","LastName cannot be empty").notEmpty().trim().escape(),
    body("email","Email must be valid").isEmail().trim().escape().normalizeEmail(),
    body("password","Password must be atleast 8 charcters and atmost 64 characters").isLength({min:8,max:64})
]

exports.validateLogin = [
    body('email', 'Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be at least 8 characters and atmost 64 characters').isLength({min:8,max:64})
]

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else  {
        return next();
    }
}

exports.validateitem = [
    body("category", "Category cannot be empty").notEmpty().trim().escape(),
    body("name", "Name cannot be empty").notEmpty().trim().escape(),
    body("yearofMFG", "Year of MFG must be between 1901 and the current year")
    .isInt({ min: 1901, max: new Date().getFullYear() })
    .notEmpty().trim().escape(),
    body("details", "Details must be atleast 10 characters long")
      .isLength({ min: 10 })
      .trim()
      .escape(),
  ];
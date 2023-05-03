const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {validateLogin, validateSignup, validateResult} = require("../middlewares/validator");
const {logInLimiter} = require("../middlewares/rateLimiters");
const router = express.Router();

//GET /user/new: send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/', logInLimiter, isGuest,validateSignup,validateResult, controller.create);

//GET /user/login: send html for logging in
router.get('/login',  isGuest, controller.getUserLogin);

//POST /user/login: authenticate user's login
router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, controller.login);

//GET /user/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//POST /user/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
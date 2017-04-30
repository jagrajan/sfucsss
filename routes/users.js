var express = require('express');
var passport = require('passport');

var User = require('../models/user');

var router = express.Router();

//GET request for logout
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

//GET request for login
router.get('/login', function (req, res, next) {
    res.render('users/login');
});

//POST request for login
router.post('/login', function (req, res, next) {
    req.sanitize('email').escape();
    req.sanitize('password').escape();
    next();
}, passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}));

//GET request for signup
router.get('/signup', function (req, res, next) {
    res.render('users/signup');
});

//POST request for signup
router.post('/signup', function (req, res, next) {
    req.checkBody('email', 'Please enter an email').notEmpty();
    req.checkBody('email', 'Email must be valid').isEmail();
    req.checkBody('password', 'Password must be 8 to 20 characters').len(6, 20);
    req.checkBody('password', 'Password may only contain letters and numbers').matches(/^[a-zA-Z0-9]*$/, 'i');
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);

    req.sanitize('email').escape();
    req.sanitize('password').escape();
    req.sanitize('confirmPassword').escape();
    req.sanitize('email').trim();
    req.sanitize('password').trim();
    req.sanitize('confirmPassword').trim();


    var errors = req.validationErrors();
    var email = req.body.email;

    if (errors) {
        var errorMsgs = [];
        errors.forEach(function (error) {
            errorMsgs.push(error.msg);
        });
        res.render('users/signup', {errors: errorMsgs, email: email});
        return;
    }

    User.findOne({email: email}, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            req.flash('error', 'Email in use by another account');
            return res.redirect('/users/signup');
        }

        var password = req.body.password;

        var newUser = new User({
            email: email,
            password: password
        });
        newUser.save(next);
    });
}, passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

module.exports = router;

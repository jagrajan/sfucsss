var express = require('express');
var passport = require('passport');

var Course = require('../models/course');

var router = express.Router();

//GET request for dashboard
router.get('/roadmap-dashboard', function (req, res, next) {
    res.render('admin/roadmap_dashboard');
});

router.get('/add-course', function (req, res, next) {
    res.render('admin/add-course');
});

router.post('/add-course', function (req, res, next) {
    req.sanitize('code').escape();
    req.sanitize('credits').escape();
    req.sanitize('name').escape();
    req.sanitize('description').escape();
    req.sanitize('code').trim();
    req.sanitize('credits').trim();
    req.sanitize('name').trim();
    req.sanitize('description').trim();

    req.checkBody('code', 'Course code must be provided').notEmpty();
    req.checkBody('credits', 'Number of credits must be provided').notEmpty();
    req.checkBody('name', 'Course name must be provided').notEmpty();

    req.checkBody('credits', 'Number of credits must be a number').isInt();

    req.checkBody('code', 'Course code may only contain letters and numbers').matches(/^[a-zA-Z0-9 ]*$/, 'i');
    req.checkBody('name', 'Course name may only contain letters and numbers').matches(/^[a-zA-Z0-9 ]*$/, 'i');
    req.checkBody('description', 'Course description may only contain letters, numbers, and punctuation').matches(/^[a-zA-Z0-9 ,/!?]*$/, 'i');

    var errors = req.validationErrors();

    var newCourse = new Course({
        code: req.body.code,
        credits: req.body.credits,
        name: req.body.name,
        description: req.body.description
    });

    if (errors) {
        var errorMsgs = [];
        errors.forEach(function (error) {
            errorMsgs.push(error.msg);
        });
        res.render('admin/add-course', {title: 'Add course', errors: errorMsgs, course: newCourse});
        return
    }
    Course.findOne({code: newCourse.code}, function (err, course) {
        if (err) {
            return done(err);
        }
        if (course) {
            return res.render('admin/add-course', {title: 'Add course', errors: ['Course with same code already exists'], course: newCourse});
        } else {
            newCourse.save(function (err) {
                if (err) {
                    return done(err);
                }
                req.flash('info', newCourse.code + ' successfully added');
                return res.redirect('/admin/roadmap-dashboard');
            });
        }
    });

});

module.exports = router;

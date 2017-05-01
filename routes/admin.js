var express = require('express');
var passport = require('passport');
var async = require('async');

var Course = require('../models/course');

var router = express.Router();

//GET request for dashboard
router.get('/roadmap_dashboard', function (req, res, next) {
    Course.find()
        .sort([['name', 'descending']])
        .exec(function (err, list_courses) {
            if (err) {
                next(err);
            }
            res.render('admin/roadmap_dashboard', {title: 'Roadmap Dashboard', courses: list_courses});
        });
});

router.get('/add_course', function (req, res, next) {
    Course.find()
        .exec(function (err, courses) {
            if (err) {
                next(err);
            }
            res.render('admin/add_course', {title: 'Add Course', courses: courses});
        });
});

router.post('/add_course', function (req, res, next) {
    req.sanitize('code').escape();
    req.sanitize('credits').escape();
    req.sanitize('name').escape();
    req.sanitize('description').escape();
    req.sanitize('prerequisites').escape();
    req.sanitize('code').trim();
    req.sanitize('credits').trim();
    req.sanitize('name').trim();
    req.sanitize('description').trim();
    req.sanitize('prerequisites').trim();

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
        description: req.body.description,
        prerequisites: req.body.prerequisites ? req.body.prerequisites.split(',') : []
    });

    console.log(req.body);

    if (errors) {
        var errorMsgs = [];
        errors.forEach(function (error) {
            errorMsgs.push(error.msg);
        });
        Course.find()
            .exec(function (err, courses) {
                if (err) {
                    next(err);
                }
                res.render('admin/add_course', {
                    title: 'Add Course',
                    courses: courses,
                    errors: errorMsgs,
                    course: newCourse
                });
            });
        return;
    }
    Course.findOne({code: newCourse.code}, function (err, course) {
        if (err) {
            return next(err);
        }
        if (course) {
            return res.render('admin/add_course', {
                title: 'Add course',
                errors: ['Course with same code already exists'],
                course: newCourse
            });
        } else {
            newCourse.save(function (err) {
                if (err) {
                    return next(err);
                }
                req.flash('info', newCourse.code + ' successfully added');
                return res.redirect('/admin/roadmap_dashboard');
            });
        }
    });

});

router.get('/edit_course/:id/', function (req, res, next) {
    async.parallel({
        course: function (callback) {
            Course.findById(req.params.id)
                .exec(callback);
        },
        courses: function (callback) {
            Course.find()
                .exec(callback);
        }
    }, function (err, results) {
        res.render('admin/edit_course', {title: 'Edit course', course: results.course, courses: results.courses});
    })

});

router.post('/edit_course/:id/', function (req, res, next) {
    req.sanitize('code').escape();
    req.sanitize('credits').escape();
    req.sanitize('name').escape();
    req.sanitize('description').escape();
    req.sanitize('prerequisites').escape();
    req.sanitize('code').trim();
    req.sanitize('credits').trim();
    req.sanitize('name').trim();
    req.sanitize('description').trim();
    req.sanitize('prerequisites').trim();

    req.checkBody('code', 'Course code must be provided').notEmpty();
    req.checkBody('credits', 'Number of credits must be provided').notEmpty();
    req.checkBody('name', 'Course name must be provided').notEmpty();

    req.checkBody('credits', 'Number of credits must be a number').isInt();

    req.checkBody('code', 'Course code may only contain letters and numbers').matches(/^[a-zA-Z0-9 ]*$/, 'i');
    req.checkBody('name', 'Course name may only contain letters and numbers').matches(/^[a-zA-Z0-9 ]*$/, 'i');
    req.checkBody('description', 'Course description may only contain letters, numbers, and punctuation').matches(/^[a-zA-Z0-9 ,/!?]*$/, 'i');

    var errors = req.validationErrors();

    console.log(req.body);

    var newCourse = new Course({
        code: req.body.code,
        credits: req.body.credits,
        name: req.body.name,
        description: req.body.description,
        prerequisites: req.body.prerequisites ? req.body.prerequisites.split(',') : []
    });

    if (errors) {
        var errorMsgs = [];
        errors.forEach(function (error) {
            errorMsgs.push(error.msg);
        });
        res.render('admin/edit_course', {title: 'Edit course', errors: errorMsgs, course: newCourse});
        return
    }
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            return next(err);
        }
        course.code = newCourse.code;
        course.credits = newCourse.credits;
        course.name = newCourse.name;
        course.description = newCourse.description;
        course.prerequisites = newCourse.prerequisites;
        course.save(function (err, updatedCourse) {
            if (err) {
                return next(err);
            }
            req.flash('info', updatedCourse.code + ' has been updated');
            return res.redirect('/admin/roadmap_dashboard');
        });
    })
});

router.get('/delete_course/:id', function (req, res, next) {
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            next(err);
        }
        Course.find({prerequisites: course._id})
            .exec(function (err, courses) {
                if (err) {
                    next(err);
                }
                console.log(courses);
                res.render('admin/delete_course', {title: 'Delete Course', course: course, courses: courses});
            });
    });
});

router.post('/delete_course/:id', function (req, res, next) {
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            next(err);
        }
        if (course) {
            Course.find({prerequisites: course._id})
                .exec(function (err, courses) {
                    if (err) {
                        next(err);
                    }
                    if (courses.length) {
                        req.flash('info', course.code + ' cannot be deleted as it is a prerequisite for other courses');
                        return res.redirect('/admin/roadmap_dashboard');
                    } else {
                        Course.remove({_id: req.params.id}, function (err) {
                            if (err) {
                                next(err);
                            }
                            req.flash('info', course.code + ' deleted');
                            return res.redirect('/admin/roadmap_dashboard');
                        });
                    }
                });
        } else {
            return res.redirect('/admin/roadmap_dashboard');
        }
    });
});

module.exports = router;

var express = require('express');
var async = require('async');

var Course = require('../models/course');
var Section = require('../models/section');

var router = express.Router();

//GET request for adding section
router.get('/add', function (req, res, next) {
    Course.find()
        .exec(function (err, courses) {
            if (err) {
                next(err);
            }

            res.render('admin/section/add', {title: 'Add Section', courses: courses});
        });
});

router.post('/add', function (req, res, next) {

    var errors = getInputErrors(req);

    var newSection = new Section({
        name: req.body.name,
        visible: req.body.visible,
        courses: req.body.courses ? req.body.courses.split(',') : []
    });

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

                res.render('admin/section/add', {
                    title: 'Add Section',
                    section: newSection,
                    errors: errorMsgs,
                    courses: courses
                });
            });
    } else {
        Section.findOne({name: newSection.name})
            .exec(function (err, section) {
                if (err) {
                    next(err);
                }
                if (section) {
                    Course.find()
                        .exec(function (err, courses) {
                            if (err) {
                                next(err);
                            }

                            res.render('admin/section/add', {
                                title: 'Add Section',
                                section: newSection,
                                errors: ['Section with same name already exists'],
                                courses: courses
                            });
                        });
                } else {
                    newSection.save(function (err) {
                        if (err) {
                            next(err);
                        }
                        req.flash('info', newSection.name + ' successfully created');
                        return res.redirect('/admin/roadmap_dashboard');
                    });
                }
            });
    }

});

router.get('/delete/:id', function (req, res, next) {
    Section.findById(req.params.id, function (err, section) {
        if (err) {
            next(err);
        }
        if (section) {
            res.render('admin/section/delete', {title: 'Delete section', section: section});
        } else {
            req.flash('info', 'The section does not exist.');
            return res.redirect('/admin/roadmap_dashboard');
        }
    });
});

router.post('/delete/:id', function (req, res, next) {
    Section.findById(req.params.id, function (err, section) {
        if (err) {
            next(err);
        }
        if (section) {
            Section.remove({_id: section._id}, function (err) {
                if (err) {
                    next(err);
                }
                req.flash('info', section.name + ' has been successfully deleted');
                return res.redirect('/admin/roadmap_dashboard');
            });
        } else {
            req.flash('info', 'The section does not exist');
            return res.redirect('/admin/roadmap_dashboard');
        }
    });
});

router.get('/edit/:id', function (req, res, next) {
    async.parallel({
        section: function (callback) {
            Section.findById(req.params.id)
                .exec(callback);
        },
        courses: function (callback) {
            Course.find()
                .exec(callback);
        }
    }, function (err, results) {
        if (err) {
            next(err);
        }
        if (results.section) {
            res.render('admin/section/update', {
                title: 'Update Section',
                section: results.section,
                courses: results.courses
            });
        } else {
            req.flash('info', 'This section does not exist');
            return res.redirect('/admin/roadmap_dashboard');
        }
    });
});

router.post('/edit/:id', function (req, res, next) {

    var errors = getInputErrors(req);

    var newSection = new Section({
        name: req.body.name,
        visible: req.body.visible,
        courses: req.body.courses ? req.body.courses.split(',') : []
    });

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

                res.render('admin/section/edit', {
                    title: 'Edit Section',
                    section: newSection,
                    errors: errorMsgs,
                    courses: courses
                });
            });
    } else {
        Section.findOne({_id: req.params.id})
            .exec(function (err, section) {
                if (err) {
                    next(err);
                }
                if (section) {
                    section.name = newSection.name;
                    section.visible = newSection.visible;
                    section.courses = newSection.courses;
                    section.save(function (err) {
                         if (err) {
                             next(err);
                         }
                         req.flash('info', section.name + ' successfully updated');
                         return res.redirect('/admin/roadmap_dashboard');
                    });
                } else {
                    req.flash('info', 'Section does not exist, try creating a new one')
                    return res.redirect('/admin/roadmap_dashboard');
                }
            });
    }

});

function getInputErrors(req) {
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    req.sanitize('visible').escape();
    req.sanitize('visible').trim();

    req.sanitize('courses').escape();
    req.sanitize('courses').trim();

    req.checkBody('name', 'Section name must be provided').notEmpty();
    req.checkBody('name', 'Section name may only contain letters and numbers').matches(/^[a-zA-Z0-9 ]*$/, 'i');

    req.checkBody('visible', 'Visibility must be true or false').isBoolean();

    return req.validationErrors();
}

module.exports = router;

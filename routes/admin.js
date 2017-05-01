var express = require('express');
var passport = require('passport');

var User = require('../models/user');

var router = express.Router();

//GET request for dashboard
router.get('/roadmap-dashboard', function (req, res, next) {
    res.render('admin/roadmap_dashboard');
});

router.get('/add-course', function (req, res, next) {
    res.render('admin/add-course');
});

router.post('/add-course', function(req, res, next){

    res.render('admin/add-course');
});

module.exports = router;

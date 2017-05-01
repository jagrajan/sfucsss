var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    code: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    description: {type: String},
    credits: {type: Number, default: 3},
    prerequisites: [{type: mongoose.Schema.ObjectId, ref: 'Course'}]
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

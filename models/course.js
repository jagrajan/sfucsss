var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    code: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    description: {type: String},
    prerequisites: [{type: mongoose.Schema.ObjectId, ref: 'Course'}]
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

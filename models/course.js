var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    code: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    description: {type: String},
    credits: {type: Number, default: 3},
    prerequisites: [{type: mongoose.Schema.ObjectId, ref: 'Course'}]
});

courseSchema.methods.editUrl = function () {
    return '/admin/edit_course/' + this._id;
};

courseSchema.methods.deleteUrl = function () {
    return '/admin/delete_course/' + this._id;
};

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

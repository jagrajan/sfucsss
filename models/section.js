var mongoose = require('mongoose');

var sectionSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    visible: {type: Boolean, default: true},
    courses: [{type: mongoose.Schema.ObjectId, ref: 'Course'}]
});

sectionSchema.methods.editUrl = function () {
    return '/admin/section/edit/' + this._id;
};

sectionSchema.methods.deleteUrl = function () {
    return '/admin/section/delete/' + this._id;
};

var Section = mongoose.model('Section', sectionSchema);

module.exports = Section;

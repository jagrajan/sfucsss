var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");
require('mongoose-type-email');

var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    email: { type: mongoose.SchemaTypes.Email, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    role: {type: String, default: 'regular'},
    name: String,
    bio: String
});

var noop = function() {};

userSchema.pre("save", function(done) {
    var user = this;

    if (!user.isModified("password")) {
        return done();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});

userSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

userSchema.methods.displayName = function() {
    return this.name || this.email.substring(0, this.email.indexOf('@'));
};

var User = mongoose.model("User", userSchema);

module.exports = User;

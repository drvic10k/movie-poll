var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    password: String,
    email: { type: 'string', unique: true }
});

userSchema.path('email').index({ unique: true });

userSchema.pre("save", function (next) {
    var self = this;
    mongoose.models["User"].findOne({ email: self.email }, function (err, user) {
        if (err) {
            next(err);
        } else if (user) {
            self.invalidate("email", "email must be unique");
            next(new Error("email must be unique"));
        } else {
            next();
        }
    });
});

userSchema.methods.register = function (callback) {
    var self = this;
    this.save(function (err) {
        if (err) {
            callback(err);
        } else {
            callback(undefined, self);
        }
    });
};

userSchema.methods.login = function (callback) {
    var self = this;
    mongoose.models["User"].findOne({ email: self.email }, function (err, user) {
        if (err) {
            callback(err);
        } else if (!user) {
            self.invalidate("email", "user doesn't exist");
            callback(new Error("user doesn't exist"));
        } else if (user.password != self.password) {
            self.invalidate("password", "wrong password");
            callback(new Error("wrong password"));
        } else {
            callback(undefined, user);
        }
    });
};

exports.User = mongoose.model('User', userSchema);
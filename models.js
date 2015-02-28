var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

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

userSchema.methods.register = function () {
    var self = this;
    this.save(function (err) {
        if (err) {
            console.log(err);
            return err;
        } else {
            console.log("Saved: " + JSON.stringify(self));
        }
    });
};

exports.User = mongoose.model('User', userSchema);
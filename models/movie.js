var mongoose = require('mongoose');

var User = require('../models/user.js').User;

var movieSchema = mongoose.Schema({
    name: String,
    link: String,
    votes: { type: Number, required: true, default: 0 },
    voters: [String],
});

movieSchema.pre("save", function (next) {
    var self = this;
    mongoose.models["Movie"].findOne({ name: self.name }, function (err, movie) {
        if (err) {
            next(err);
        } else if (movie) {
            self.invalidate("name", "Movie with that name already exists");
            next(new Error("Movie with that name already exists"));
        } else {
            next();
        }
    });
});

movieSchema.methods.voted = function (userId) {
    return this.voters.indexOf(userId) > -1;
}

exports.Movie = mongoose.model('Movie', movieSchema);
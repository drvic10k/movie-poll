var mongoose = require('mongoose');

var Movie = require('../models/movie.js').Movie;

var pollSchema = mongoose.Schema({
    movies: [Movie]
});

exports.Poll = mongoose.model('Poll', pollSchema);
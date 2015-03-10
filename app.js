var express = require('express');
var hbs = require('hbs');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');

var models = require('./models.js');
var config = require('./config.js');

console.log("Starting...");
console.log("Registering partials...");
hbs.registerPartials(__dirname + '/views/partials');
console.log("Done");

console.log("Express setup...");
var app = express();
app.set('view engine', 'html');
// app.engine('html', hbs.__express);
app.use(express.static('static'));
app.use(bodyparser.json());

// serve the app
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Language', 'sk');
    res.sendFile(__dirname + '/views/index.html');
    // res.render('index.html');
});

// AJAX calls

// users
app.post('/users/register', function (req, res) {
    var user = new models.User();
    user.email = req.body.email;
    user.password = req.body.password;
    if (!user.email.match(/.+@.+/) || user.password == '') {
        res.status(500).send('invalid input');
    }
    user.register(function (err, logUser) {
        if (err) {
            res.status(500).send(err.message);
            console.log(err);
        } else {
            res.json(logUser);
        }
    });
});
app.post('/users/login', function (req, res) {
    var user = new models.User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.login(function (err, logUser) {
        if (err) {
            res.status(500).send(err.message);
            console.log(err);
        } else {
            res.json(logUser);
        }
    });
});

// movies
app.post('/movies/add', function (req, res) {
    var movie = new models.Movie();
    movie.name = req.body.name;
    movie.link = req.body.link;
    movie.save(function (err) {
        console.log(err);
        res.json(err ? err.message : "");
    });
});
app.get('/movies', function (req, res) {
    mongoose.models["Movie"].find({}, function (err, movies) {
        if (!err) {
            res.json(movies);
        }
    });
});
app.post('/movies/voteCounter/:id', function (req, res) {
    mongoose.models["Movie"].findOne({ _id: req.params.id }, function (err, movie) {
        if (!err) {
            if (!movie.votes)
                movie.votes = 0;
            movie.votes++;
            models.Movie.update({ _id: movie._id }, { $set: { votes: movie.votes } }, function () {
                res.json();
            });
        }
    });
});
app.post('/movies/castvote/:id/:user', function (req, res) {
    models.Movie.findOneAndUpdate({ _id: req.params.id }, { $push: { voters: req.params.user } }, function (err) {
        res.json();
    });
});
app.post('/movies/removevote/:id/:user', function (req, res) {
    models.Movie.findOneAndUpdate({ _id: req.params.id }, { $pull: { voters: req.params.user } }, function (err) {
        res.json();
    });
});
app.get('/movies/voted/:user', function (req, res) {
    models.Movie.findOne({ voters: req.params.user }, function (err, movie) {
        if (!err && movie) {
            res.json(movie);
        } else {
            res.status(500).send('no movie voted');
        }
    });
});

console.log("Done");

app.listen(config.port);
console.log('Listening on port ' + config.port + '...');

console.log("Connecting database...");
mongoose.connect('mongodb://localhost:27017/ERNIcinema');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Done");
});

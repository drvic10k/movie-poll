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
app.engine('html', hbs.__express);
app.use(express.static('static'));
app.use(bodyparser.json());

// serve the app
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Language', 'sk');

    res.render('index.html');
});

// AJAX calls
app.post('/users/register', function (req) {
    var user = new models.User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.register();
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

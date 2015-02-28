var express = require('express');
var hbs = require('hbs');

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
app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Language', 'sk');
    
    res.render('index.html');
});
console.log("Done");

app.listen(config.port);
console.log('Listening on port ' + config.port + '...');
var express = require('express');

var app = express();
var router = express.Router();

var logger = require('morgan'); // for debugging messages
var path = require('path'); // for combining file path names

app.set('view engine', 'ejs');
app.use(logger('dev'));

var routes = require('./routes/index');
app.use('/', routes);

// serve up static files using folder names within public
app.use(express.static('public'));
app.set('/views', path.join(__dirname, 'views'));

// 404
app.use('*', function(req, res) {
  res.status(404).send('404');
});

app.listen(8080, '0.0.0.0', function() {
  console.log('Running on port 8080...');
});
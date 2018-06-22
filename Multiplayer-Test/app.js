let express = require('express');
let app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static('node_modules'));
let router = express.Router();

let logger = require('morgan'); // for debugging messages
let path = require('path'); // for combining file path names

app.set('view engine', 'ejs');
app.use(logger('dev'));

let routes = require('./routes/index');
app.use('/', routes);

// serve up static files using folder names within public
app.use(express.static('public'));

// 404
app.use('*', function(req, res) {
  res.status(404).send('404');
});

let players = {};
let connectionHandler = require('./connections');
io.on('connection', function(socket) {
    connectionHandler(io, socket, players);
});

server.listen(8080, 'localhost', function() {
  console.log('Running on port 8080...');
});
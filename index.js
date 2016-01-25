var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('client-sessions');

var username;
var receiver;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(session({
    cookieName: 'session',
    secret: 'zhisongge',
    duration: 30*60*1000,
    activeDuration: 5*60*1000,
}));

app.get('/login', function(req, res){
    req.session.username = req.query.username;
    req.session.receiver = req.query.receiver;
    username = req.session.username;
    receiver = req.session.receiver;
    //console.log(req.session.username);
    //console.log(req.session.receiver);
    res.redirect('/');
});

app.get('/getUsername', function(req, res){
    res.send(req.session.username);
});

io.on('connection', function(socket){
    socket.on('ge chat', function(msg){
        console.log(receiver);
        io.emit(receiver, msg);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});
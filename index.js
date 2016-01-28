var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('client-sessions');

var pairs = {};


app.use(session({
    cookieName: 'session',
    secret: 'zhisongge',
    duration: 30*60*1000,
    activeDuration: 5*60*1000,
}));

app.get('/', function(req, res){
    if(req.session.username){
        console.log(req.session.username);
        console.log(req.session.receiver);
    }else {
        console.log('username undefined');
    }

    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('connection');

    socket.on('names', function(names){

        if(!pairs[names[0]]){
            pairs[names[0]] = {};
            pairs[names[0]][names[1]] = true;

            socket.on(names[0] + ' ' + names[1], function(msg){
                io.emit(names[1], msg);
                console.log(names[1] +': ' + msg);
            });

        }else if(!pairs[names[0]][names[1]]){
            pairs[names[0]][names[1]] = true;

            socket.on(names[0] + ' ' + names[1], function(msg){
                io.emit(names[1], msg);
                console.log(names[1] +': ' + msg);
            });
        }



        console.log(pairs);
        console.log('uname: ' + names[0]);
        console.log('rname: ' + names[1]);
    });

});


app.get('/login', function(req, res){

    req.session.username = req.query.username;
    req.session.receiver = req.query.receiver;
    console.log('login');
    console.log(req.session.username);
    console.log(req.session.receiver + '\n');

    res.redirect('/');
});

app.get('/getUname', function(req, res){
    res.send(req.session.username);
});

app.get('/getRname', function(req, res){
    res.send(req.session.receiver);
});

app.get('/getnames', function(req, res){
    res.send(req.session.username + ' ' + req.session.receiver);
});




http.listen(3000, function(){
    console.log('listening on *:3000');
});
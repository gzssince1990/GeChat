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

        /**
         * When refresh the web page, we will lose the socket.on listener for the tranceiver pair
         * This condition will solve the problem, recreate a valid listener when we refresh the page
         * while the session is not expired yet.
         */
        if(!pairs[req.session.username]){
            console.log('Did not send message yet, so in session not in pairs');
        }else if(!pairs[req.session.username][req.session.receiver]){
            console.log('Sent msg to other people but not ' + req.session.receiver);
        }else if(pairs[req.session.username][req.session.receiver] = 1){
            pairs[req.session.username][req.session.receiver] = 0;
            console.log('Reset the pair to 0, so we can recreate the socket.on listener');
        }else {
            console.log('This pair is already 0');
        }
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

app.get('/getnames', function(req, res){
    res.send(req.session.username + ' ' + req.session.receiver);
});




http.listen(3000, function(){
    console.log('listening on *:3000');
});
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile('index.html');
});
app.get('/food', function(req, res) {
    res.sendFile('food.html');
});
app.get('/message', function(req, res) {
    res.sendFile('message.html');
});
app.get('/video', function(req, res) {
    res.sendFile('video.html');
});

app.use(express.static(__dirname + '/public'));
// app.use('/static', express.static(path.join(__dirname + 'public')));

var gameState = {
    video: 0,
    food: 0
}

// [video][food]
var botState = {
    0: {
        0: "I'm full, I'm okay to pass this one",
        1: "I'm hungry, let's eat!",
        2: "Are you sure you want to eat?",
        3: "This is delicious!",
        4: "I only know good food"
    },
    1: {
        0: "What?? This food? Ugh, no",
        1: "Don't talk, just eat",
        2: "If you don't eat this, I'll finish it",
        3: "You are missing out on a 5 star menu",
        4: "I don't think you appreciate my choice"
    },
    2: {
        0: "Not in the mood",
        1: "Ok, I'll dine alone",
        2: "I just want to eat",
        3: "It's your choice...",
        4: "No food, no food"
    },
}

var videoNsp = io.of('/video');
videoNsp.on('connection', function(socket) {
    console.log('Video socket connected');
    // socket.emit('hi', 'hi video');

    socket.on('videoEvent', function(data) {
        gameState.video = data;
        var msg = processState(gameState.video, gameState.food);
        io.emit('displayMessage', msg);
        console.log(gameState);
    });
});

var foodNsp = io.of('/food');
foodNsp.on('connection', function(socket) {
    console.log('Food socket connected');
    // socket.emit('hi', 'hi food');

    socket.on('foodEvent', function(data) {
        gameState.food = data;
        var msg = processState(gameState.video, gameState.food);
        io.emit('displayMessage', msg);
        console.log(gameState);
    });
});

function processState(v_, f_) {
    let message = "";
    let v = v_.toString();
    let f = f_.toString();
    message = botState[v][f]

    console.log(message)
    return message
}

http.listen(3000, function() {
    console.log('listening on *:3000');
    console.log(botState["0"]["2"]);
});
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1411', {
    baudRate: 9600
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/food', function(req, res) {
    res.sendFile(__dirname + '/food.html');
});
app.get('/food-client', function(req, res) {
    res.sendFile(__dirname + '/food-client.html');
});
app.get('/message', function(req, res) {
    res.sendFile(__dirname + '/message.html');
});
app.get('/video', function(req, res) {
    res.sendFile(__dirname + '/video.html');
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
        0: {
            "dialogue": "I'm full, I'm okay to pass this one",
            "accept": "0"
        },
        1: {
            "dialogue": "I'm hungry, let's eat!",
            "accept": "1"
        },
        2: {
            "dialogue": "Are you sure you want to eat?",
            "accept": "0"
        },
        3: {
            "dialogue": "This is delicious!",
            "accept": "1"
        },
        4: {
            "dialogue": "I only know good food",
            "accept": "0"
        }
    },
    1: {
        0: {
            "dialogue": "What?? This food? Ugh, no",
            "accept": "0"
        },
        1: {
            "dialogue": "Don't talk, just eat",
            "accept": "0"
        },
        2: {
            "dialogue": "If you don't eat this, I'll finish it",
            "accept": "1"
        },
        3: {
            "dialogue": "You are missing out on a 5 star menu",
            "accept": "1"
        },
        4: {
            "dialogue": "I don't think you appreciate my choice",
            "accept": "0"
        }
    },
    2: {
        0: {
            "dialogue": "Not in the mood",
            "accept": "0"
        },
        1: {
            "dialogue": "Ok, I'll dine alone",
            "accept": "0"
        },
        2: {
            "dialogue": "I just want to eat",
            "accept": "1"
        },
        3: {
            "dialogue": "It's your choice...",
            "accept": "1"
        },
        4: {
            "dialogue": "No food, no food",
            "accept": "0"
        }
    },
}

var videoNsp = io.of('/video');
videoNsp.on('connection', function(socket) {
    console.log('Video socket connected');
    // socket.emit('hi', 'hi video');

    socket.on('videoEvent', function(data) {
        gameState.video = data;
        // var msg = processState(gameState.video, gameState.food);
        // io.emit('displayMessage', msg);
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
        var srv = processServoState(gameState.video, gameState.food);
        io.emit('displayMessage', msg);
        port.write(srv, function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('command servo with the command ' + srv)
        })
        console.log(gameState);
    });
});

function processState(v_, f_) {
    let message = "";
    let v = v_.toString();
    let f = f_.toString();
    message = botState[v][f]["dialogue"]

    console.log(message)
    return message
}

function processServoState(v_, f_) {
    let servoInput = ""
    let v = v_.toString();
    let f = f_.toString();
    servoInput = botState[v][f]["accept"]
    return servoInput;
}

http.listen(3000, function() {
    console.log('listening on *:3000');
    console.log(botState["1"]["4"]);
});
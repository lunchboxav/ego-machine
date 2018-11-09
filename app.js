var botState = require('./gameData.json');
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
app.get('/video-client', function(req, res) {
    res.sendFile(__dirname + '/video-client.html');
});

app.use(express.static(__dirname + '/public'));
// app.use('/static', express.static(path.join(__dirname + 'public')));

var gameState = {
    moodCounter: 5,
    mood: "neutral",
    video: '0',
    food: '0'
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
        var output = processState(gameState);
        gameState.moodCounter = output.moodCounter;
        gameState.mood = output.mood;

        io.emit('displayMessage', output);
        port.write(output.command, function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('command servo with the command ' + output.command)
        });
        console.log(gameState);
        console.log("mood counter is " + gameState.moodCounter + " mood is " + gameState.mood);
    });
});

// var moodCounter = 5;

function processState(obj) {
    let message = botState[obj.mood][obj.video][obj.food]["dialogue"];
    let command = botState[obj.mood][obj.video][obj.food]["accept"];

    let moodCounter = gameState.moodCounter;
    if (command == 1) {
        moodCounter++;
    } else if (command == 0) {
        moodCounter--;
    }

    if (moodCounter >= 7) {
        mood = "happy";
    } else if (moodCounter < 7 && moodCounter >= 4) {
        mood = "neutral"
    } else if (moodCounter < 4) {
        mood = "down";
    }

    var gameOutput = {};
    gameOutput["message"] = message;
    gameOutput["command"] = command;
    gameOutput["mood"] = mood;
    gameOutput["moodCounter"] = moodCounter;

    return gameOutput;
}

http.listen(3000, function() {
    console.log('listening on *:3000');
    /* for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            console.log(botState["happy"][i][j]);
        }
    } */
    //console.log(botState["down"]["1"]["4"]);
});
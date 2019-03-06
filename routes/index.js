const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

let availableDefaultNickNames = ["Rachel","Ross","Chandler", "Monica", "Phoebe", "Joey",
  "Marcel", "Carol", "Susan", "Gunther", "Janice", "Ugly Naked Guy", "Jack", "Judy", "Mike",
  "Emily", "Estelle", "Richard", "Frank", "Charlie", "Julie", "Tag", "Mona", "Ben", "Pete",
  "Barry", "David", "Emma", "Paolo", "Eddie"];

let mappedNicknames = {};
let onlineUsers = [];

let chatHistory = [];
let mappedNickColours = {};

//TODO:
// Messages posted by the user should be bolded in the chat log (or otherwise stylized).
// If the user gets disconnected and then the user reconnects again, the user should be assigned the same nickname. You can use browser cookies for this purpose.
// Stylize online users list and whole application
// Your application should look attractive
// Test on Firefox


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  if(mappedNicknames[socket.id]===undefined){
    mappedNicknames[socket.id] = availableDefaultNickNames.shift();
    mappedNickColours[socket.id] = "000000";
  }
  let name =  mappedNicknames[socket.id];
  if(!onlineUsers.includes(name)){
    onlineUsers.push(name);
  }
  io.emit('connected', onlineUsers);
  io.emit('chat message', chatHistory);
  socket.emit('displayUserName', name);
  socket.on('disconnect', function(){
    console.log('user disconnected');
    let name =  mappedNicknames[socket.id];
    var index = onlineUsers.indexOf(name);
    if (index > -1) {
      onlineUsers.splice(index, 1);
    }
    io.emit('connected', onlineUsers);
  });
});


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    let date = new Date();
    let hour = date.getHours();
    let min = date.getMinutes();
    msg = updateUserName(msg, socket);
    io.emit('connected', onlineUsers);
    msg = updateUserNameColour(msg, socket);
    let name = mappedNicknames[socket.id];
    socket.emit('displayUserName', name);
    let message = {user: name, color: mappedNickColours[socket.id], hr: hour, minute: min, content: msg };
    chatHistory.push(message);
    io.emit('chat message', chatHistory);
  });
});

function updateUserName(msg, socket){
  if(msg.includes("/nick ")){
    let newName = msg.split("/nick ")[1];
    if(!onlineUsers.includes(newName)){
      var index = onlineUsers.indexOf(mappedNicknames[socket.id]);
      onlineUsers.splice(index, 1);
      updateChatHistoryName(mappedNicknames[socket.id],newName);
      availableDefaultNickNames.push(mappedNicknames[socket.id]);
      mappedNicknames[socket.id]=newName;
      onlineUsers.push(newName);
    }else{
      msg = "Please select a unique name";
    }
  }
  return msg;
}


function updateChatHistoryName(oldName, newName){
  for(var i=0; i<chatHistory.length; i++){
    if(chatHistory[i].user===oldName){
      chatHistory[i].user = newName;
    }
  }
}


function updateUserNameColour(msg, socket){
  if(msg.includes("/nickcolor ")){
    let newColor = msg.split("/nickcolor ")[1];
    let isHexColor  = /[0-9A-F]{6}$/i.test(newColor);
    //If valid color
    if(isHexColor){
      //Then update color
      updateChatHistoryColour(mappedNickColours[socket.id], newColor);
      mappedNickColours[socket.id] = newColor;
    }
    else{
      msg = "Please select a valid hexadecimal color in the form of RRGGBB";
    }
  }
  return msg;
}


function updateChatHistoryColour(oldColour, newColour){
  for(var i=0; i<chatHistory.length; i++){
    if(chatHistory[i].color===oldColour){
      chatHistory[i].color = newColour;
    }
  }
}

app.use(express.static('public'));
$(function () {

    var socket = io();
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });



    socket.on('chat message', function(chatHistory, id, mappedNames){
        document.getElementById("messages").innerHTML = "";
        for(let i = 0; i<chatHistory.length; i++){
            let min = chatHistory[i].minute;
            min = min.toString();
            let hour = chatHistory[i].hr;
            let name = chatHistory[i].user;
            let msg = chatHistory[i].content;
            if(name===mappedNames[id]){
                msg = "<b>"+msg+"</b>";
            }
            let color = chatHistory[i].color;
            let nameStyle =  "<styleName style=" +"\""+"color: #"+color+";"+"\""+">"+name+"</styleName>";
            let period = "am";
            if(hour>=12) {
                if(hour>12){
                    hour = hour - 12;
                }
                period = "pm";
            }
            if(hour===0){
                hour = 12;
            }
            if(min.length===1){
                min = 0+min;
            }
            $('#messages').append("<li>"+hour+":"+min+period+" "+nameStyle+": "+msg+"</li>");
            var element = document.getElementById("messages");
            element.scrollTop = element.scrollHeight - element.clientHeight;
        }
    });


    socket.on('connected',function(onlineUsers){
        document.getElementById("userList").innerHTML = "";
        for(user in onlineUsers){
            $('#userList').append($('<li>').text(onlineUsers[user]));
        }
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight - element.clientHeight;

    });

    socket.on('displayUserName', function(name){
        document.getElementById("userIdentifier").innerText="You are "+name;
    });
});

//initialize socket with the current url
var socket = io.connect('/');

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    //showing username and the message sent
    var checkifdataisalink = data;
    var check = checkifdataisalink.split('://')
    if ((check[0] == 'http') || (check[0] == 'https')) {
        $('#conversation').append('<div id="receiver"><p><strong>' + username + ':</strong> <a id="link" href="' + data + '">' + data + '</a></p></div><br/>');

    } else {
        $('#conversation').append('<div id="receiver"><p><b>' + username + ':</b> ' + data + '</p></div><br>');
    }
});
socket.on('typingmsg', function (sender, text) {

    $('#typingmsg').empty();
    //if user types nothing dont show
    if (!text) {
        $('#typingmsg').empty();
    } else {
        $('#typingmsg').append('<b>' + sender + ':</b> ' + text);
    }
});
// listener, whenever the server emits 'updateusers', this updates the username list

/*socket.on('updateusers', function (data) {
 //add user who joined chat to div users tag
 $('#users').empty();
 $.each(data, function (key, value) {
 $('#users').append('<div>' + key + '</div>');

 });
 });*/

$(document).ready(function () {
    //load all online users
    var host = location.protocol + '//' + location.host + '/getonlineusers';
    $.get(host, function (data) {
        if (data) {
            $('#onlineusers').empty();
            for (var i in data) {
                var users = data[i];
                //split the username from their profile picture
                var finalusers = users.split(";", 3);

                $("#onlineusers").append('<li><a id="myusers" href="#">' + finalusers[0] + '</a><img src="/images/' + finalusers[1] + '"></li>');
                // '  '<img id="myimage" src=="' + data + '">
            }
        }
    });

    //use this variable to check if users as already been added to socket or not
    var added = false;
    //get the username into variable
    var username = document.getElementById("myusername").value;
    //run the code every 5 secs after opening the chat window to add new user to socket
    setInterval(function () {
        if (added == false) {
            // on connection to server, ask for user's name with an anonymous callback
            //add user to socket
            socket.emit('adduser', username);
        }
        added = true;
    }, 5000)

    //Get online users every 12 secs from the database via ajax call or ajax request
    setInterval(function () {
        var host = location.protocol + '//' + location.host + '/getonlineusers';
        $.get(host, function (data) {
            if (data) {
                $('#onlineusers').empty();
                for (var i in data) {
                    var users = data[i];
                    //split the username from their profile picture
                    var finalusers = users.split(";", 3);
                    $("#onlineusers").append('<li><a id="myusers" href="#">' + finalusers[0] + '</a><img src="/images/' + finalusers[1] + '"></li>');

                }
            }
        })
    }, 13000);

    //when the online username is clicked, get the usename into a label
    // indicating whom we are chatting with and creat a chat windown for him
    $("#myusers").live("click", function (e) {
        e.preventDefault();
        var href = $(this).text();

        if (href) {
            document.getElementById("selectedCustomerName").innerHTML = href;
        }
    });
    // when the client clicks SEND
    $('#datasend').click(function () {

        //get the message typed
        var message = $('#data').val();
        //get the reciepient
        var recipient = $('#selectedCustomerName').text();
        //get the sender name: main person
        var sender = $('#myusername').val();
        //for IE browser
        if (!message) {
            return;
        }
        if (!recipient) {
            errornotify();
            return;
        } else if (!sender) {
            errornotify();
            return
        }
        $('#data').val('');
        //show what the main person sent as well
        $('#conversation').append('<div id="sender"><p><b>' + sender + ':</b> ' + message + '</p></div><br>');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message, recipient, sender);
        $('#data').focus();
        //clear user is typing msg
        $('#typingmsg').empty();
    });
    // when the client hits ENTER on their keyboard
    $('#data').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
    $('#data').keypress(function (e) {

        //for showing if user is typing
        var text = ' is typing...';
        var recipient = $('#selectedCustomerName').text();
        var sender = $('#myusername').val();
        if (!recipient) {
            errornotify();
            return;
        }
        socket.emit('usertyping', text, recipient, sender);
    });
    $('#data').keyup(function (e) {
        //for showing user is not typing
        var text;
        var recipient = $('#selectedCustomerName').text();
        var sender = $('#myusername').val();
        if (!recipient) {
            errornotify();
            return;
        }
        socket.emit('usertyping', text, recipient, sender);
    });

    function errornotify() {
        $(this).notifyMe(
            'bottom', // Position
            'error', // Type
            'Chat Partner *', // Title
            'Chat cannot be initiated.Please select customer', // Description
            200,// Velocity of notification
            5000 // (optional) Time of delay to close automatically
        );
    }
});


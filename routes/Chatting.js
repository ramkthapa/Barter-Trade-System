/**
 * Created by ESSEL on 16-Dec-14.
 */
module.exports = function(app,myio,dbconnection) {

    var usernames = {};
    var onlineClients = {};
    app.get('/Chatting', isLoggedIn, function (req, res) {
        //emit the loggin user to socket

        res.render('pages/Chat', {userlogin: req.user.FN, userID: req.user.id});
    });
    //get the product ID and perpare a link for sending email
    app.get('/getonlineusers', isLoggedIn, function (req, res) {
        var userID = req.user.id;
        dbconnection.query('SELECT CONCAT(FirstName," ",LastName," ",MiddleName) As FullName,ProfilePicture from Customers where LoginStatus=? and CustomerID !=?', [1, userID], function (err, rows) {
            if (err) throw err;
            var onlineusers = [];
            for (var i = 0; i < rows.length; i++) {
                onlineusers.push(rows[i].FullName + ';' + rows[i].ProfilePicture);
            }
            var ousers = JSON.stringify(onlineusers);
            res.send(JSON.parse(ousers));
            console.log(JSON.stringify(ousers));
        });
    });

    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/logins');
    }

    myio.sockets.on('connection', function (socket) {
        // when the client emits 'sendchat', this listens and executes
        // socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        //io.sockets.emit('updatechat', socket.username, data);
        //modification
        socket.on('sendchat', function (message, recipient, sender, err) {
            if ((!recipient || recipient == '' || (!onlineClients.hasOwnProperty(recipient)))) {
                return
            } else {
                // we tell the client to execute 'updatechat' with 2 parameters
                var id = Object.keys(onlineClients);
                console.log(id);
                onlineClients[recipient].emit('updatechat', sender, message)
            }
        });
        socket.on('usertyping', function (text, recipient, sender) {
            if ((!recipient || recipient == '' || (!onlineClients.hasOwnProperty(recipient)))) {
                socket.broadcast.emit('updatechat', 'SERVER', 'Customer is either offline or no reciepient');
                return;
            } else {
                onlineClients[recipient].emit('typingmsg', sender, text)
            }
        });
        // when the client emits 'adduser', this listens and executes
        socket.on('adduser', function (username) {

            // usernames which are currently connected to the chat

            //empty objects and assign new data to it each time we get new online users
            onlineClients[username] = socket;
            console.log(onlineClients);
            // we store the username in the socket session for this client
            socket.username = username;
            // add the client's username to the global list
            usernames[username] = username;

            // echo to client they've connected
            // socket.emit('updatechat', 'SERVER', 'you have connected');

            // echo globally (all clients) that a person has connected
            //socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');

            // update the list of users in chat, client-side
            // myio.sockets.emit('updateusers', usernames);
            socket.emit('updateusers', usernames);
            //socket.broadcast.emit('updatechat', 'SERVER', username + ' has already  connected');


        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            // remove the username from global usernames list
            delete usernames[socket.username];
            // update list of users in chat, client-side
            myio.sockets.emit('updateusers', usernames);
            // echo globally that this client has left
            //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        });

    });

};
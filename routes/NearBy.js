/**
 * Created by ESSEL on 10-Mar-15.
 */
module.exports = function (app, dbconnection, transporter, myio) {
// listen for incoming connections from client
    myio.sockets.on('connection', function (socket) {
        // start listening for coords
        socket.on('send:coords', function (data) {

            // broadcast your coordinates to everyone except you
            socket.broadcast.emit('load:coords', data);
        });
    });
    app.get('/NearBy', isLoggedIn, function (req, res) {
        res.render('pages/NearBy.ejs', {userlogin: req.user.FN, userID: req.user.id});
    });
    // for checking if user is logged in before allowing user to access the page
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/logins');
    }

};
var http=require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql=require('mysql');
var engine=require('ejs-locals');
var io = require('socket.io');
var multer=require('multer');
var nodemailer = require('nodemailer');// create reusable transporter object using SMTP transport
var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.engine('ejs',engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest:'./public/images/'}));
app.use(cookieParser());
app.use(session({
    secret:"28.Steps",
    resave:false,//don't save session if undefined
    saveUninitialized:false//Don't create session until something is stored
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//our database connection
var dbconnection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'28.Steps',
    database:'bartertradedb',
    port:'3306'
})
//email settings
var transporter = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "adjeiessel@gmail.com",
        pass: "abokobA9003"
    }
});

//function AddActivityLog (activityData) {
var SaveActivity = function (activityData) {
    dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
        if (err) throw err;
    console.log('Activity Saved');
})
};
//function to save Notifications
var AddNotification=function(notifyData) {
    dbconnection.query('Insert  into notifications set? ', [notifyData], function (err) {
        if (err) throw err;
        console.log('Customer notified');
    })
}
//Server port declaration and settings
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + server.address().port);
});
//Bind the server to the socket IO
var myio=io.listen(server);

require('./routes/Login')(app,passport,dbconnection);
require('./routes/AuthenticationConfig')(passport,dbconnection,myio);//you need to pass passport-login details for configuration
require('./routes/CreateAccount')(app,passport);
require('./routes/profile')(app,dbconnection);
require('./routes/OfferProduct')(app, dbconnection);
require('./routes/Chatting')(app,myio,dbconnection);
require('./routes/ViewTransaction')(app, dbconnection);
require('./routes/DelAccount')(app,dbconnection);
require('./routes/AddGroup')(app,dbconnection);
require('./routes/GroupMembers')(app,dbconnection,transporter,AddNotification,SaveActivity);
require('./routes/GroupTrading')(app, dbconnection, SaveActivity, transporter);
require('./routes/PrivateMessages')(app,dbconnection,transporter);
require('./routes/OfferService')(app,dbconnection);
require('./routes/OfferPeerTrade')(app, dbconnection, transporter, AddNotification, SaveActivity);
require('./routes/Reputation')(app,dbconnection);
require('./routes/WishList')(app,dbconnection);
require('./routes/ViewOffersServices')(app,dbconnection);
require('./routes/Shipping')(app,dbconnection);
require('./routes/FriendRequest')(app,myio,dbconnection,AddNotification,SaveActivity);
require('./routes/Notifications')(app,myio,dbconnection);//pass the the Socekt IO , the dbconnection to the Notification file
require('./routes/EditCustomer')(app,dbconnection);
require('./routes/EditShipping')(app,dbconnection);
require('./routes/MyFriendList')(app,dbconnection,AddNotification,SaveActivity);
require('./routes/MyGroups')(app,dbconnection,SaveActivity);
require('./routes/MyWishList')(app,dbconnection);
require('./routes/MyMembers')(app,dbconnection);
require('./routes/MyMembersDelete')(app,dbconnection);
require('./routes/Offers')(app,dbconnection);
require('./routes/DeleteOffers')(app,dbconnection);
require('./routes/DeleteService')(app,dbconnection);
require('./routes/EditOfferProduct')(app,dbconnection);
require('./routes/EditOfferService')(app,dbconnection);
require('./routes/ServiceOffer')(app,dbconnection);
require('./routes/ProductOffers')(app,dbconnection);
require('./routes/ActivityLog')(app,dbconnection);
require('./routes/PingOffers')(app,dbconnection,transporter,SaveActivity,AddNotification);
require('./routes/PingResponse')(app,dbconnection,transporter,SaveActivity,AddNotification);
require('./routes/AcceptOffers')(app,dbconnection,transporter,SaveActivity,AddNotification);
require('./routes/AcceptPeerTrade')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/RespondPeerTrade')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/PeerInterest')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/GroupOffer')(app, dbconnection, transporter, SaveActivity);
require('./routes/GroupMemberOffer')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/AcceptMemberOffer')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/ViewTransaction')(app, dbconnection, transporter, SaveActivity, AddNotification);
require('./routes/NearBy')(app, dbconnection, transporter, myio);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;

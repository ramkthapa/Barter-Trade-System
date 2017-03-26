/**
 * Created by ESSEL on 12/4/2014.
 */
module.exports = function(app, passport,dbconnection) {
    // HOME PAGE (with login links)
    app.get('/', function(req, res) {
        // load the index.ejs file
        // get the user out of session and pass to template
        if (req.user){
            res.render('pages/index.ejs',{username:req.user});
        }else{
            res.render('pages/index.ejs',{username:''});
        }
    });
    //LOGIN ===============================
    // show the login form
    app.get('/logins', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/logins.ejs');
    });
    // process the login form
    // app.post('/login', do all our passport stuff here);
    // process the login form
    app.post('/logins', passport.authenticate('UserLogin', {
         successRedirect : '/', // redirect to the secure profile section
         failureRedirect : '/logins', // redirect back to the signup page if there is an error
         failureFlash : true // allow flash messages
    }));

    // LOGOUT ==============================
    app.get('/logout', isLoggedIn, function (req, res) {

            console.log('You are logging out customer ' + req.user.id);
            //save activity log
        var PostActivity = {
            CustomerID: req.user.id,
            ActivityName: 'Logout from system:',
            ActivityDateTime: new Date()
        };
        AddActivityLog(PostActivity);
            var Status = {
                LoginStatus: 0
            };
            //update customer login status to off
            dbconnection.query("update Customers set ? where CustomerID=?", [Status, req.user.id], function (err) {
                if (err) throw err;
                console.log("Updated login status : %s ");

            });
        //will remove the req.user property and clear the login session (if any).
            req.logout();
            res.redirect('/');


    });

    function AddActivityLog(activityData) {
    dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
        if (err) throw err
        console.log('Activity Saved');
    })
}
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
};
/**
 * Created by ESSEL on 19-Feb-15.
 */
module.exports=function(app,dbconnection){

    app.get('/ActivityLog',isLoggedIn,function(req,res){
        dbconnection.query("Select * from ActivityLogs As A Join Customers As C on A.CustomerID=C.CustomerID where C.CustomerID=?", [req.user.id], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/ActivityLog', {data: rows});
        });
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}
/**
 * Created by ESSEL on 07-Feb-15.
 */
module.exports = function(app, dbconnection) {
    app.get('/MyWishList', isLoggedIn, function (req, res) {
        dbconnection.query("Select WishListID,Product_ServiceName,Description,PublishedDate from WishList where CustomerID=? ",[req.user.id], function (err, Rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
        res.render('pages/MyWishList', {data: Rows});

        })
    });
    app.get('/MyWishList/:id',function(req,res){
        var id = req.params.id;
        dbconnection.query("DELETE FROM WishList where WishListID =? ",[id], function(err)
        {
            if(err){
                console.log("Error deleting from list : %s ",err);
            }
            console.log('Wish list deleted');
            //save activity log
            AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Deleted wish list:',ActivityDateTime:new Date()});
        });
        res.redirect('/MyWishList');
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
}
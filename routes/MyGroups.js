/**
 * Created by ESSEL on 07-Feb-15.
 */
module.exports = function(app, dbconnection,SaveActivity) {
    app.get('/MyGroups', isLoggedIn, function (req, res) {
        dbconnection.query("Select GroupName,GroupID,GroupIcon From groups As G Join Customers As C on G.CustomerID=C.CustomerID where G.CustomerID=? ",[req.user.id], function (err, Rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
        res.render('pages/MyGroups', {data: Rows});

        })
    });
    app.get('/MyGroups/:id',isLoggedIn,function(req,res){
        var id = req.params.id;
        console.log(id);
        dbconnection.query("DELETE FROM GroupTrade where GroupID =? ",[id], function(err){
            if(err){
                console.log("Error deleting from group trade: %s ",err);
            }
        });
        dbconnection.query("DELETE FROM GroupMembers where GroupID =? ",[id], function(err){
            if(err){
                console.log("Error deleting from group members : %s ",err);
            }
        });
        dbconnection.query("DELETE FROM Groups where GroupID =? ",[id], function(err)
        {
            if(err){
                console.log("Error deleting from groups : %s ",err);
            }
            //save activity log
            SaveActivity(PostActivity={CustomerID:req.user.id,ActivityName:'Deleted a group and related activity assocaited with group',ActivityDateTime:new Date()});
        });
        res.redirect('/MyGroups');
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }

}
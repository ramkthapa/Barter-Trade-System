module.exports = function(app,dbconnection) {
    app.get('/MyMembersDelete/:Mid',isLoggedIn,function(req,res){
        var id = req.params.Mid;
        console.log(id);
        dbconnection.query("DELETE FROM GroupMembers where GroupMembersID =? ",[id], function(err){
            if(err){
                console.log("Error deleting from group member: %s ",err);
            }
            console.log("Deleted: %s ");
            //save activity log
            AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Removed a friend from group:',ActivityDateTime:new Date()});
           // A back redirection redirects the request back to the referer, defaulting to / when the referer is missing.
            res.redirect('back');
        });

    })
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
  }
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
}

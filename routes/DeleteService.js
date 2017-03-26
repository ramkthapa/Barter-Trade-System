module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/DeleteService/:id', isLoggedIn, function (req, res) {
    var id = req.params.id;
    var userid = req.user.id;
    dbconnection.query("Delete from ServiceOffers Where ServiceOfferID=?", [id], function (err) {
      if (err) {
        console.log(err);
      }
      console.log('Deleted');
      //save activity log
      AddActivityLog(PostActivity={CustomerID:userid,ActivityName:'Removed/Deleted your service offer:',ActivityDateTime:new Date()});
        res.redirect('/');
      });
  });
// route middleware to make sure a user is logged in
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

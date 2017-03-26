module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/AddGroup', isLoggedIn, function (req, res) {

    res.render('pages/CreateGroup');
  });
  app.post('/AddGroup', function (req, res) {
    var PostData = {
      GroupName: req.body.GroupName,
      CustomerID: req.user.id,
      GroupIcon:req.files.GroupPhoto.name
    };
  //Save group
    dbconnection.query("INSERT INTO Groups set ? ", PostData, function (err, rows) {
      if (err) {
        console.log("Error inserting : %s ", err);
      }
      console.log('Saved Successfully');
      //save activity log
      AddActivityLog(PostActivity={CustomerID:PostData.CustomerID,ActivityName:'Created a group with name: '+ PostData.GroupName,ActivityDateTime:new Date()})
      res.redirect('/');

    })
  })
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

module.exports = function(app,dbconnection) {
  app.get('/MyMembers/:id', isLoggedIn, function (req, res) {
      var id = req.params.id;
    dbconnection.query("Select FirstName,LastName,MiddleName,Joined,EmailAddress,GroupMembersID from Customers As C join Groupmembers as GM on C.CustomerID=GM.MemberID where GM.GroupID=?",[id],function(err,rows) {
      if (err) {
        console.log(err);
      }
        console.log('success');
      res.render('pages/MyMembers',{result:rows});
    })

  });
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
  }
}

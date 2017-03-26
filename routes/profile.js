
module.exports = function(app,dbconnection) {
  app.get('/profile', isLoggedIn, function (req, res) {
   var CustomerID=req.user.id
    dbconnection.query("Select * from Customers where CustomerID='"+ CustomerID +"'",function(err,rows) {
      if (err) {
        console.log(err);
      }
      dbconnection.query("Select * from ShippingDetails As S Join Customers As C on S.CustomerID=C.CustomerID where S.CustomerID='"+ CustomerID +"'",function(err,shiprows) {
          if (err) {
              console.log(err);
          }
      res.render('pages/profile',{result:rows,ShipResults:shiprows});
    })
    })
  });
    app.get('/profile/:id', isLoggedIn, function (req, res) {
        var CustomerID=req.params.id
        dbconnection.query("Select * from Customers where CustomerID='"+ CustomerID +"'",function(err,rows) {
            if (err) {
                console.log(err);
            }
            dbconnection.query("Select * from ShippingDetails As S Join Customers As C on S.CustomerID=C.CustomerID where S.CustomerID='"+ CustomerID +"'",function(err,shiprows) {
                if (err) {
                    console.log(err);
                }
                res.render('pages/profile',{result:rows,ShipResults:shiprows});
            })
        })
    });
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

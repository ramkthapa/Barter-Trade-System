module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/OfferService', isLoggedIn,function (req, res) {
    var categories=[];
    dbconnection.query("Select * from ServiceCategory", function (err, rows) {

      if (err) {console.log('Error',err);}
      if(rows){
        for(var i in rows){
          categories[i]=rows[i].ServiceCatName;
        }
        console.log(categories);
      }
      res.render('pages/OfferService',{SerCategories:categories});
    })

  });
  app.post('/OfferService', function (req,res) {
    var SID, Suggest;
    var LogincustomerID=req.user.id;
    var PostData={
      CategoryName:req.body.ServiceCatName
    }
    var CatName=PostData.CategoryName;
    dbconnection.query('select ServiceCatID from ServiceCategory where ServiceCatName=?',[CatName],function(errs,results) {
      if (errs) {
        console.log(errs);
      }
      if (results) {
        for (var a in results) {
          SID = results[a].ServiceCatID;
          console.log('CategoryID', SID);
        }
      }
      var PostData={
        ServiceName:req.body.ServiceName,
        ServiceDescription:req.body.ServiceDescription,
        PublishedDate:new Date(),
        DateAvailable:req.body.AvailabilityDate,
        Duration:req.body.Duration,
        CustomerID:LogincustomerID,
        ServiceCatID:SID,
        StartDate:req.body.StartDate,
        EndDate:req.body.EndDate,
        PreferredService:req.body.PreferredService

      }
      dbconnection.query('Insert  into ServiceOffers set? ', [PostData],function(err){
        if(err)
        {
          console.log("Error Inserting data",err)
        }
        else
        {
          console.log('Saved Successfully');
          //save activity log
          AddActivityLog(PostActivity={CustomerID:PostData.CustomerID,ActivityName:'Published a service:'+PostData.ServiceName,ActivityDateTime:new Date()});

        }
      })
    })
    res.redirect('/');
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


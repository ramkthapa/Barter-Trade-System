module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/EditOfferService/:id', isLoggedIn,function (req, res) {
    var serviceid=req.params.id;
    var categories=[];
    dbconnection.query("Select * from ServiceCategory", function (err, rows) {

      if (err) {
        console.log('Error', err);
      }
      if (rows) {
        for (var i in rows) {
          categories[i] = rows[i].ServiceCatName;
        }
        console.log(categories);
      }
      dbconnection.query("Select * from ServiceOffers As S Join ServiceCategory As C on S.ServiceCatID=C.ServiceCatID where ServiceOfferID=?", [serviceid], function (err, allrows) {
        if (err) {
          console.log(err);
        }
        console.log(allrows);
        res.render('pages/EditOfferService', {AllService: allrows, SerCategories: categories});
      });
    });
  });
    app.post('/EditOfferService/:id', function (req, res) {
        var ServiceID = req.params.id;
    var SID;
    var LogincustomerID=req.user.id;
    var PostData={
      CategoryName:req.body.ServiceCatName
    };
    dbconnection.query('select ServiceCatID from ServiceCategory where ServiceCatName=?',[PostData.CategoryName],function(errs,results) {
      if (errs) {
        console.log(errs);
      }
      if (results) {
        for (var a in results) {
          SID = results[a].ServiceCatID;
          console.log('CategoryID', SID);
        }
      }
      var PostServiceData={
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
        dbconnection.query("Update  ServiceOffers set? where ServiceOfferID=?", [PostServiceData, ServiceID], function (err) {
        if(err)
        {
          console.log("Error updating data",err)
        }
        else
        {
            console.log('updated Successfully');
          //save activity log
          AddActivityLog(PostActivity={CustomerID:PostData.CustomerID,ActivityName:'updated a service details:'+PostData.ServiceName,ActivityDateTime:new Date()});

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


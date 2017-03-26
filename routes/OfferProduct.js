module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/OfferProduct', isLoggedIn,function (req, res) {
   //get all product categories from db into the select optionBox
    var categories=[];
    dbconnection.query("Select * from productcategories", function (err, rows) {

      if (err) {
        console.log('Error',err);
      }
      if(rows){
        for(var i in rows){
          categories[i]=rows[i].CategoryName;
        }
        console.log(categories);
      }
      res.render('pages/OfferProduct',{ProCategories:categories});
    })
  });
  app.post('/OfferProduct', function (req,res) {
   var CID, Suggest;
    //Get current logged in user ID from the session
    var LogincustomerID=req.user.id;
    var PostData={
      CategoryName:req.body.CategoryName
    }
    dbconnection.query('select CategoryID from ProductCategories where CategoryName=?',[PostData.CategoryName],function(errs,results) {
      if (errs) {
        console.log(errs);
      }
      if (results) {
        for (var a in results) {
          CID = results[a].CategoryID;
          console.log('CategoryID', CID);
        }
      }
      if(req.body.suggest){
        Suggest=1;
      }else{
          Suggest=0;
      }
      //prepare to submit data into the database
      var PostData = {
        ProductName: req.body.ProductName,
        OfferDetails: req.body.ProductDetails,
        OfferDate: new Date(),
        CustomerID: LogincustomerID,
        CategoryID: CID,
        SuggestOffers: Suggest,
        PreferredOffer: req.body.PreferredProduct,
        Condition: req.body.Condition,
        img0: req.files.myPhoto0.name,
        img1: req.files.myPhoto1.name,
        img2: req.files.myPhoto2.name,
        img3: req.files.myPhoto3.name,
        ProductValue: req.body.ProductValue,
        ProcessingTime: req.body.ProcessingTime,
        ShipsTo: req.body.SelectedAreas,
        ShippingCost: req.body.ShippingCost,
        ValueCurrency:req.body.CurrencyName,
        shipCurrencyName:req.body.shipCurrencyName
      }
      //Save customer product into the database
      dbconnection.query('Insert  into ProductOffers set? ', [PostData],function(err){
        if(err)
        {
          console.log("Error Inserting data",err)
        }
        else
        {
          console.log('Saved Successfully');
          //save activity log
          AddActivityLog(PostActivity={CustomerID:PostData.CustomerID,ActivityName:'Place a product offer:'+ PostData.ProductName,ActivityDateTime:new Date()});
        }
      })
    })
    res.redirect('/');
  })
// for checking if user is logged in before allowing user to access the page
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page
    res.redirect('/logins');
  }
  function AddActivityLog(activityData){
    dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
      if (err) throw err
      console.log('Activity Saved');
    })
  }
}


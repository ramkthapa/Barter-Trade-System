module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/EditOfferProduct/:id', isLoggedIn,function (req, res) {
    var id=req.params.id;
    dbconnection.query("Select * from ProductCategories", function (err, rows) {
      if(err){
        console.log(err);
      }
      dbconnection.query("Select * from ProductOffers As P Join ProductCategories As C on P.CategoryID=C.CategoryID where ProductOfferID=?",[id],function(err,allrows){
        if(err){
          console.log(err);
        }
      res.render('pages/EditOfferProduct',{AllProducts:allrows,ProCategories:rows});
    })
    })
  });
    app.post('/EditOfferProduct/:id', function (req, res) {
        var productID = req.params.id;
        var CID, Suggest;
    //Get current logged in user ID from the session
    var LogincustomerID=req.user.id;
    var PostData={
        CategoryName: req.body.CategoryName
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

        //prepare to submit data into the database either with images or not
        if (req.body.newphoto) {
            var PostProductData = {
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
                ValueCurrency: req.body.CurrencyName,
                shipCurrencyName: req.body.shipCurrencyName
            }
        } else {
            var PostProductData = {
                ProductName: req.body.ProductName,
                OfferDetails: req.body.ProductDetails,
                OfferDate: new Date(),
                CustomerID: LogincustomerID,
                CategoryID: CID,
                SuggestOffers: Suggest,
                PreferredOffer: req.body.PreferredProduct,
                Condition: req.body.Condition,
                ProductValue: req.body.ProductValue,
                ProcessingTime: req.body.ProcessingTime,
                ShipsTo: req.body.SelectedAreas,
                ShippingCost: req.body.ShippingCost,
                ValueCurrency: req.body.CurrencyName,
                shipCurrencyName: req.body.shipCurrencyName
            }
        }
      //Save customer product into the database
        dbconnection.query("Update  ProductOffers set? where ProductOfferID=?", [PostProductData, productID], function (err) {
        if(err) throw err
          console.log('Saved Successfully');
        //save activity log
        AddActivityLog(PostActivity={CustomerID:LogincustomerID,ActivityName:'Updated your offer: '+PostProductData.ProductName,ActivityDateTime:new Date()});
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


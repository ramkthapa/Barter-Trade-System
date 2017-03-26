module.exports = function(app, dbconnection) {
//   GET home page.
    app.get('/ViewOffersServices', isLoggedIn, function (req, res) {
    var customerid=req.user.id;
      var ProductStatus = "Available";
      var ServiceStatus = "Available";
    //select productCategory and assign to option select field for seach
    dbconnection.query('SELECT CategoryName from ProductCategories ', function (err, Catrows) {
      if (err) {
        console.log("Error Selecting : %s ", err);
      }
      //select serviceCategory and assign to option select field for seach
      dbconnection.query('SELECT ServiceCatName from ServiceCategory ', function (err, SerCatRows) {
        if (err) {
          console.log("Error Selecting : %s ", err);
        }
          //select all listed productsoffers and show
          dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where C.CustomerID !=? and ProductStatus=?", [customerid, ProductStatus], function (err, rows) {
            if (err) {
              console.log("Error Selecting : %s ", err);
            }
            //select all listed serviceoffers and show
              dbconnection.query("Select * from ServiceOffers As S Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID Join Customers As C on S.CustomerID=C.CustomerID where C.CustomerID !=? and ServiceStatus=?", [customerid, ServiceStatus], function (err, ServiceRows) {
              if (err) {
                console.log("Error Selecting : %s ", err);
              }
              //Get total number of records return by productoffers and serviceoffers and use a loop to add all records in an array
              // and pass the array to the view for presentation
              res.render('pages/ViewOffersServices', {data: rows, ProCat: Catrows, SerCat: SerCatRows, ServiceData:ServiceRows
              });
            })
          });
        });
      });
  });
    app.get('/productsearch', function (req, res) {
        var ProductStatus = 'Available';
        var CustomerId = req.user.id;
        dbconnection.query('SELECT ProductName from ProductOffers where (CustomerID!="' + CustomerId + '" and ProductStatus="' + ProductStatus + '")and ProductName like "%' + req.query.key + '%"', function (err, rows) {
      if (err) throw err;
      var data = [];
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].ProductName);
      }
      res.end(JSON.stringify(data));
      console.log(JSON.stringify(data));
    });
  });
    app.get('/servicesearch', function (req, res) {
        var ServiceStatus = 'Available';
        var CustomerId = req.user.id;
        dbconnection.query('SELECT ServiceName from ServiceOffers where (CustomerID!="' + CustomerId + '" and ServiceStatus="' + ServiceStatus + '")and ServiceName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].ServiceName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    });
    app.post('/ViewOffersServices', isLoggedIn, function (req, res) {
        var ProductData = {}
            , ServiceData = {};
        var customerid = req.user.id;
        var ProductStatus = "Available";
        var ServiceStatus = "Available";
        var PostData = {
            OptionP: req.body.option,
            OptionS: req.body.optionS
        };
        if (PostData.OptionP === "Product") {
            dbconnection.query('SELECT CategoryName from ProductCategories ', function (err, Catrows) {
                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                //select serviceCategory and assign to option select field for seach
                dbconnection.query('SELECT ServiceCatName from ServiceCategory ', function (err, SerCatRows) {
                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }

                    var GetNameandCat = {
                        ProductName: req.body.typeahead,
                        ProdcutCategoy: req.body.ProductCategories
                    };
                    //Get service listing to still show
                    dbconnection.query("Select * from ServiceOffers As S Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID Join Customers As C on S.CustomerID=C.CustomerID where C.CustomerID !=? and ServiceStatus=?", [customerid, ServiceStatus], function (err, ServiceRows) {
                        if (err) {
                            console.log("Error Selecting : %s ", err);
                        }
                        //select all listed productsoffers and show
                        dbconnection.query('Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where (C.CustomerID !=? and ProductStatus=? and ProductName=?) or CategoryName="' + GetNameandCat.ProdcutCategoy + '"', [customerid, ProductStatus, GetNameandCat.ProductName], function (err, rows) {
                            if (err) {
                                console.log("Error Selecting : %s ", err);
                            }
                            res.render('pages/ViewOffersServices', {
                                data: rows,
                                ProCat: Catrows,
                                SerCat: SerCatRows,
                                ServiceData: ServiceRows
                            });
                        });
                    })
                })
            })
        }
        if (PostData.OptionS === "Service") {
            dbconnection.query('SELECT CategoryName from ProductCategories ', function (err, Catrows) {
                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                //select serviceCategory and assign to option select field for seach
                dbconnection.query('SELECT ServiceCatName from ServiceCategory ', function (err, SerCatRows) {
                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    var GetNameandCat = {
                        ServiceName: req.body.typeaheadservice,
                        ServiceCategoy: req.body.ServiceCategories
                    };
                    //Get product listing to still show
                    dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where C.CustomerID !=? and ProductStatus=?", [customerid, ProductStatus], function (err, rows) {
                        if (err) {
                            console.log("Error Selecting : %s ", err);
                        }
                        //select all listed serviceoffers and show
                        dbconnection.query('Select * from ServiceOffers As S Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID Join Customers As C on S.CustomerID=C.CustomerID where (C.CustomerID !=? and ServiceStatus=? and ServiceName=?) or ServiceCatName="' + GetNameandCat.ServiceCategoy + '"', [customerid, ServiceStatus, GetNameandCat.ServiceName], function (err, ServiceRows) {
                            if (err) {
                                console.log("Error Selecting : %s ", err);
                            }
                            res.render('pages/ViewOffersServices', {
                                data: rows,
                                ProCat: Catrows,
                                SerCat: SerCatRows,
                                ServiceData: ServiceRows
                            });
                        });
                    });
                });
            })
        }
    });

    function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page   res.redirect('/');
    res.redirect('/logins');
  }
};
module.exports = function (app, dbconnection) {
//   GET home page.
    //Get all offers posted by current loggin customer only
    app.get('/Offers', isLoggedIn, function (req, res) {
//based on his/her ID customerID
        var id = req.user.id;
        var offerstatus = "Available";
        dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where P.CustomerID=? and ProductStatus=?", [id, offerstatus], function (err, rows) {
            if (err) {
                console.log(err);
            }
            dbconnection.query("Select * from ServiceOffers As S Join Customers As C on S.CustomerID=C.CustomerID Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID where C.CustomerID=? and ServiceStatus=?", [id, offerstatus], function (err, srows) {
                if (err) {
                    console.log(err);
                }
                res.render('pages/Offers', {results: rows, loginuser: req.user.id, serviceresults: srows});
            });
        });
    });
    //Get the product other customer is interested in: The product Pinged
    app.get('/Offers/:id', isLoggedIn, function (req, res) {
        //based on his/her ID
        //shows the pingoffers form instead, that's where the other customer can respond
        var PingID = req.params.id;
        var customerID;
        dbconnection.query("Select InterestedCustomerID from ProductOfferPings where PingID=?", [PingID], function (err, pingrows) {
            if (err) {
                console.log(err);
            }
            if (pingrows) {
                for (var i in pingrows) {
                    customerID = pingrows[i].InterestedCustomerID;
                }
            }

            dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where P.CustomerID=?", [customerID], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                res.render('pages/PingProductOffers', {
                        results: rows,
                        loginuser: req.user.id,
                        GetPingID:PingID,
                        Message: 'Customer also has these products to offer.Ping back if you are interested in any'
                    });
                });
            });
    });
    app.get('/ServiceOffer/:id', isLoggedIn, function (req, res) {
        //based on his/her ID
        //shows the pingoffers form instead, that's where the other customer can respond
        var PingID = req.params.id;
        var customerID;
        dbconnection.query("Select InterestedCustomerID from ServiceOfferPings where ServicePingID=?", [PingID], function (err, pingrows) {
            if (err) {
                console.log(err);
            }
            if (pingrows) {
                for (var i in pingrows) {
                    customerID = pingrows[i].InterestedCustomerID
                }
            }
            dbconnection.query("Select * from ServiceOffers As S Join Customers As C on S.CustomerID=C.CustomerID Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID where C.CustomerID=?", [customerID], function (err, srows) {
                if (err) {
                    console.log(err);
                }
                res.render('pages/PingServiceOffers', {
                    loginuser: req.user.id,
                    serviceresults: srows,
                    GetPingID: PingID,
                    Message: 'Customer also has these service(s) to offer.Ping back if you are interested in any'
                });
            });
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
};

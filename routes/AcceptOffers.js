/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function(app,dbconnection,transporter,SaveActivity,AddNotification) {
    var interestedCustomerEmail, PostCustomerName, PostedCustomerEmail, InterestedCustomerName, InterestedCustomerProduct;
    var PostedCusProductID, InterCusProductID, PostedCustomerProduct, InterestedCustomerID;

    var sInterestedCustomerEmail, sPostCustomerName, sPostedCustomerEmail, sInterestedCustomerName, sInterestedCustomerService;
    var sPostedCusServiceID, sInterCusServiceID, sPostedCustomerService, sInterestedCustomerID;

    //For Product
    app.get('/AcceptOffers/:id',isLoggedIn,function(req,res) {
        //Get the PingID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var pingID = req.params.id;
        var tradestatus='Responded';
        //shows the PostedCutomerID
        dbconnection.query("Select * from ProductOffers As P Join ProductOfferPings As O on P.ProductOfferID=O.ProductOfferID Join Customers As C on C.CustomerID=O.PostedCustomerID where pingID=? and TradeStatus=?", [pingID,tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if(row){
                for(var i in row){
                    PostCustomerName = row[i].FirstName + ' ' + row[i].LastName + '' + row[i].MiddleName;
                    PostedCusProductID = row[i].ProductOfferID;
                    PostedCustomerProduct = row[i].ProductName;
                    PostedCustomerEmail = row[i].EmailAddress;
                }
            }
            //shows what the interested customer has to offer
            dbconnection.query("Select * from ProductOffers As P Join ProductOfferPings As O on P.ProductOfferID=O.InterestedProductID Join Customers As C on C.CustomerID=O.InterestedCustomerID where pingID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if(rows){
                    for(var i in rows){
                        InterestedCustomerID = rows[i].InterestedCustomerID;
                        InterCusProductID = rows[i].InterestedProductID;
                        interestedCustomerEmail=rows[i].EmailAddress;
                        InterestedCustomerName = rows[i].FirstName + ' ' + rows[i].LastName + '' + rows[i].MiddleName;
                        InterestedCustomerProduct=rows[i].ProductName
                    }
                }
                res.render('pages/AcceptOffers', {FirstCustomerResults: row,SecondCustomerResults:rows});
            })
        })
    });
    app.post('/AcceptOffers/:id',isLoggedIn,function(req,res) {
        //interested or decline offer
        var pingID = req.params.id;
        var tradestatus, ProductStatus, Activity;
        if(req.body.Decline=='Declined'){
            tradestatus = 'Declined';
            ProductStatus = 'Available';
            Activity='Declined Offer from '+InterestedCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: PostedCustomerEmail + ',' + interestedCustomerEmail,// list of receivers
                subject: 'Product Trade:Declined', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + InterestedCustomerName + ' </b> and <b>' + PostCustomerName + '</b> was not accepted and/or declined.<br>Offer is still ' +
                'listed for other interested customer to see and contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }else{
            tradestatus = 'Accepted';
            ProductStatus = 'Traded Out';
            Activity='Accepted Offer from '+InterestedCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: PostedCustomerEmail + ',' + interestedCustomerEmail, // list of receivers
                subject: 'Product Trade:Accepted', // Subject line
                html: 'Hello ' + PostCustomerName + ',<br><br> ' + InterestedCustomerName + ' has accepted to trade with you ' + PostedCustomerProduct + ' for ' + InterestedCustomerProduct + '. Please ' +
                'be ready to ship the item to the customer. Customer shipping address can be found under their profile.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }
        var AcceptOffer={
            TradeStatus:tradestatus,
            DecisionDate:new Date()
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        dbconnection.query('Update ProductOfferPings set? where PingID=?', [AcceptOffer,pingID], function (err) {
            if (err) throw err;
            console.log('Trade Completed');
        });
        //update product status for each offer in the productoffer
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus,PostedCusProductID], function (err) {
            if (err) throw err;
            console.log('First Product Status Updated');
        })
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus,InterCusProductID], function (err) {
            if (err) throw err;
            console.log('Second Product Status Updated');
        });
        //save activity
        var PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()}
        SaveActivity(PostActivity);
        //Add notification
        var PostNotify = {
            CustomerID: req.user.id,
            NotificationDetails:'Accepted your offer',
            FlagAsShown:'0',
            ToCustomerID: PostedCusProductID,
            NotificationDate:new Date()
        };
        AddNotification(PostNotify);
        res.redirect('/');
    });

    //For Service
    app.get('/AcceptServiceOffers/:id', isLoggedIn, function (req, res) {
        //Get the PingID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var pingID = req.params.id;
        var tradestatus = 'Responded';
        //shows the PostedCutomerID
        dbconnection.query("Select * from ServiceOffers As S Join ServiceOfferPings As SP on S.ServiceOfferID=SP.ServiceOfferID Join Customers As C on C.CustomerID=SP.PostedCustomerID where ServicePingID=? and TradeStatus=?", [pingID, tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if (row) {
                for (var i in row) {
                    sPostCustomerName = row[i].FirstName + ' ' + row[i].LastName + '' + row[i].MiddleName;
                    sPostedCusServiceID = row[i].ServiceOfferID;
                    sPostedCustomerService = row[i].ServiceName;
                    sPostedCustomerEmail = row[i].EmailAddress;
                }
            }
            //shows what the interested customer has to offer
            dbconnection.query("Select * from ServiceOffers As S Join ServiceOfferPings As SP on S.ServiceOfferID=SP.InterestedServiceID Join Customers As C on C.CustomerID=SP.InterestedCustomerID where ServicePingID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        sInterestedCustomerID = rows[i].InterestedCustomerID;
                        sInterCusServiceID = rows[i].InterestedServiceID;
                        sInterestedCustomerEmail = rows[i].EmailAddress;
                        sInterestedCustomerName = rows[i].FirstName + ' ' + rows[i].LastName + '' + rows[i].MiddleName;
                        sInterestedCustomerService = rows[i].ServiceName
                    }
                }
                res.render('pages/AcceptServiceOffers', {FirstCustomerResults: row, SecondCustomerResults: rows});
            })
        })
    });
    app.post('/AcceptServiceOffers/:id', isLoggedIn, function (req, res) {
        //interested or decline offer
        var pingID = req.params.id;
        var tradestatus, ProductStatus, Activity;
        if (req.body.Decline === 'Declined') {
            tradestatus = 'Declined';
            ProductStatus = 'Available';
            Activity = 'Declined Offer from ' + sInterestedCustomerName;
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: sPostedCustomerEmail,// list of receivers
                subject: 'Service Trade:Declined', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + sInterestedCustomerName + ' </b> and <b>' + sPostCustomerName + '</b> was not accepted and/or declined.<br>Offer is still ' +
                'listed for other interested customer to see and contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        } else {
            tradestatus = 'Accepted';
            ProductStatus = 'Traded Out';
            Activity = 'Accepted Offer from ' + sInterestedCustomerName;
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: sPostedCustomerEmail, // list of receivers
                subject: 'Service Trade:Accepted', // Subject line
                html: 'Hello ' + sInterestedCustomerName + ',<br><br> ' + sPostCustomerName + ' has accepted your service offer ' + sPostedCustomerService + ' for ' + sInterestedCustomerService + '. Please ' +
                'be ready to accept and sign agreement for the transaction to be processed<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }
        var AcceptOffer = {
            TradeStatus: tradestatus,
            DecisionDate: new Date()
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        dbconnection.query('Update ServiceOfferPings set? where ServicePingID=?', [AcceptOffer, pingID], function (err) {
            if (err) throw err;
            console.log('Service Trade Completed');
        });
        //update product status for each offer in the productoffer
        dbconnection.query('Update ServiceOffers set ServiceStatus=? where ServiceOfferID =?', [ProductStatus, sPostedCusServiceID], function (err) {
            if (err) throw err;
            console.log('First Service Status Updated');
        });
        dbconnection.query('Update ServiceOffers set ServiceStatus=? where ServiceOfferID =?', [ProductStatus, sInterCusServiceID], function (err) {
            if (err) throw err;
            console.log('Second Service Status Updated');
        });
        //save activity
        var PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()};
        SaveActivity(PostActivity);
        //Add notification
        var PostNotify = {
            CustomerID: req.user.id,
            NotificationDetails: 'Accepted service offer',
            FlagAsShown: '0',
            ToCustomerID: InterestedCustomerID,
            NotificationDate: new Date()

        };
        AddNotification(PostNotify);
        res.redirect('/');
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
};
module.exports = function (app, dbconnection, transporter, AddNotification, SaveActivity) {
    //GET home page.
    //OFFERING PEER TRADING

    //Get product and service categories
    app.get('/OfferPeerTrade', isLoggedIn, function (req, res) {

        //get all product categories from db into the select optionBox
        dbconnection.query("Select * from productcategories", function (err, rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
            dbconnection.query("Select * from ServiceCategory", function (err, servicerows) {
                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                res.render('pages/PeerTrade', {
                    ProCategories: rows,
                    SerCategories: servicerows
                });
            });
        });
    });

    //Perform Ajax search of friend/peer
    app.get('/searchpeer', function (req, res) {
        dbconnection.query('Select FirstName,LastName,MiddleName from FriendsList  As F Join Customers As C on C.CustomerID=F.FriendID where ( Status="' + 1 + '" and F.CustomerID="' + req.user.id + '" )and FirstName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (var i = 0; i < rows.length; i++) {
                data.push(rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    })

    //save offer and send to friend
    app.post('/OfferPeerTrade', function (req, res) {
        var CID, SID, Email, FriendID, PartnersID;
        //Get current logged in user ID from the session
        var LogincustomerID = req.user.id;
        //Get Data
        var PostData = {
            CategoryName: req.body.CategoryName,
            ServiceCatName: req.body.ServiceCatName,
            OptionP: req.body.OptionProduct,
            OptionS: req.body.OptionService,
            FriendName: req.body.typeahead
        }
        //GetFriendID(LogincustomerID,PostData.FriendName);
        //Get friendID from the Peer Table and use this to get the FriendID to save transaction between two friends
        dbconnection.query('Select FriendID,EmailAddress from FriendsList  As F Join Customers As C on F.FriendID=C.CustomerID where F.CustomerID=? and CONCAT(FirstName," ",lastName," ",MiddleName)=?', [LogincustomerID, PostData.FriendName], function (err, row) {
            if (err) {
                console.log(err);
            } else {
                for (var a in row) {
                    FriendID = row[a].FriendID;
                    Email = row[a].EmailAddress
                    console.log('FriendID', FriendID);
                }
            }
            //Get the FriendListID which is common between the two friends
            dbconnection.query('Select FriendListID from FriendsList where CustomerID=? and FriendID=?', [LogincustomerID, FriendID], function (perrs, presults) {
                if (perrs) {
                    console.log(perrs);
                } else {
                    for (var a in presults) {
                        PartnersID = presults[a].FriendListID;
                        console.log('FriendListID', PartnersID);
                    }
                }
                if (PostData.OptionP === "Product") {
                    //if the offer is product

                    //Get product categoryID
                    dbconnection.query('select CategoryID from ProductCategories where CategoryName=?', [PostData.CategoryName], function (errs, results) {
                        if (errs) {
                            console.log(errs);
                        } else {
                            for (var a in results) {
                                CID = results[a].CategoryID;
                                console.log('Product CategoryID', CID);
                            }
                        }
                        //object to store the peer offer into the productoffers table
                        var PostProductData = {
                            //prepare to submit data into the database
                            ProductName: req.body.ProductName,
                            OfferDetails: req.body.ProductDetails,
                            OfferDate: new Date(),
                            CustomerID: LogincustomerID,
                            CategoryID: CID,
                            SuggestOffers: '0',
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
                        };
                        //Save trade data into the database respective tabeles
                        dbconnection.query('Insert  into ProductOffers set? ', [PostProductData], function (err, prows) {
                            if (err) {
                                console.log("Error Inserting data", err);
                            } else {
                                console.log("products saved", prows);
                            }
                            //Save data(product) into the peerTrade table as well
                            var ProductToPeerData = {
                                FirstFriendProductOfferID: prows.insertId,
                                FriendListID: PartnersID,
                                TradeDate: new Date(),
                                TradeStatus: "Pending"
                            };
                            dbconnection.query('Insert into PeerTrade set?', [ProductToPeerData], function (errs, peerrows) {
                                if (errs) {
                                    console.log("Error Inserting data", errs);
                                } else {
                                    console.log("Peer trade saved");
                                    //Get the just inserted ID and pass it to the URL to send to the friend
                                    var PeerTradeID = peerrows.insertId

                                    var urllink = "http://" + req.get('host') + "/RespondPeerTrade/" + PeerTradeID

                                    //send mail
                                    var mailOptions = {
                                        to: Email, // list of receivers
                                        subject: 'Peer Trade:Product', // Subject line
                                        html: 'Hello ' + PostData.FriendName + ',<br><br> ' + req.user.FN + ' wants to trade ' + PostProductData.ProductName + ' with you.' +
                                        '<br>Please open the link below to see if you are interested to trade any of your item(s)/product(s) with him for that offer.' +
                                        '<br><br><a href="' + urllink + '">Click to check offer from friend</a><br><br>Thank you!<br>Barter Trading Team </br>'
                                    };
                                    //send email
                                    sendemail(mailOptions);

                                    //save activity log
                                    var PostActivity = {
                                        CustomerID: req.user.id,
                                        ActivityName: 'Sent product offer to friend',
                                        ActivityDateTime: new Date()
                                    }
                                    SaveActivity(PostActivity);

                                    //Send notification
                                    var PostNotify = {
                                        CustomerID: req.user.id,
                                        NotificationDetails: 'wants to trade' + PostProductData.ProductName + ' with you',
                                        FlagAsShown: '0',
                                        ToCustomerID: FriendID,
                                        NotificationDate: new Date()

                                    }
                                    AddNotification(PostNotify)
                                }
                            })
                        })
                    })
                }
                //NOT TOUCHED YET: Complete peer trade for service
                else if (PostData.OptionS == "Service") {
                    //Get service categoryID
                    dbconnection.query('select ServiceCatID from ServiceCategory where ServiceCatName=?', [PostData.ServiceCatName], function (errs, results) {
                        if (errs) {
                            console.log(errs);
                        } else {
                            for (var a in results) {
                                SID = results[a].ServiceCatID;
                                console.log('ServiceID', SID);
                            }
                        }
                        //Save service offer into the service offers table
                        var PostServiceData = {
                            ServiceName: req.body.ServiceName,
                            ServiceDescription: req.body.ServiceDescription,
                            PublishedDate: new Date(),
                            DateAvailable: req.body.AvailabilityDate,
                            Duration: req.body.Duration,
                            CustomerID: LogincustomerID,
                            ServiceCatID: SID,
                            StartDate: req.body.StartDate,
                            EndDate: req.body.EndDate,
                            PreferredService: req.body.PreferredService
                        }
                        dbconnection.query('Insert  into ServiceOffers set? ', [PostServiceData], function (err, rows) {
                            if (err) {
                                console.log("Error Inserting data", err)
                            } else {
                                console.log("service data saved", rows)
                            }

                        //SAVE data into the peerTrade table as well
                            var ServiceToPeerData = {
                                FirstFriendServiceOfferID: rows.insertId,
                                FriendListID: PartnersID,
                                TradeDate: new Date(),
                                TradeStatus: "Pending"
                            };
                            dbconnection.query('Insert into PeerTrade set?', [ServiceToPeerData], function (errs, servicerows) {
                            if (errs) {
                                console.log("Error Inserting data", errs)
                            } else {
                                console.log("Peer trade saved" + servicerows);

                                //Get the just inserted ID and pass it to the URL to send to the friend
                                var PeerTradeID = servicerows.insertId;

                                var urllink = "http://" + req.get('host') + "/RespondPeerService/" + PeerTradeID;

                                //send mail
                                var mailOptions = {
                                    to: Email, // list of receivers
                                    subject: 'Peer Trade:Service', // Subject line
                                    html: 'Hello ' + PostData.FriendName + ',<br><br> ' + req.user.FN + ' wants to offer ' + PostServiceData.ServiceName + ' with you and other group members' +
                                    '<br>Please open the link below to see if you are interested in offering any service to him for that offer.' +
                                    '<br><br><a href="' + urllink + '">Click to check offer from friend</a><br><br>Thank you!<br>Barter Trading Team </br>'
                                };
                                //send email
                                sendemail(mailOptions);

                                //save activity log
                                var PostActivity = {
                                    CustomerID: req.user.id,
                                    ActivityName: 'Trade service with a friend:',
                                    ActivityDateTime: new Date()
                                }

                                SaveActivity(PostActivity);

                                //Send notification
                                var PostNotify = {
                                    CustomerID: req.user.id,
                                    NotificationDetails: 'wants to trade' + PostServiceData.ServiceName + ' with you',
                                    FlagAsShown: '0',
                                    ToCustomerID: FriendID,
                                    NotificationDate: new Date()

                                }
                                AddNotification(PostNotify)
                            }
                            });
                        });
                    });
                }
            });
        });
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

    // send mail with defined transport object
    function sendemail(mailOptions) {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
    }
}


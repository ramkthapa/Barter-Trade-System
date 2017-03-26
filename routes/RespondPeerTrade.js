module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
//   GET home page.

    //Get the details of the product the friend posted to peer
    app.get('/RespondPeerTrade/:id', isLoggedIn, function (req, res) {
        var pingID = req.params.id;
        var tradestatus = "Pending";

        dbconnection.query("Select * from ProductOffers As P Join PeerTrade As PT on P.ProductOfferID=PT.FirstFriendProductOfferID Join ProductCategories As C on C.CategoryID=P.CategoryID where PeerTradeID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
            console.log(rows);
            res.render('pages/PeerInterest', {PeerOffer: rows});
        });
    });
    //Respond to Offer(Accept or Decline)If Accepted the tradedetails should be updated and the
    // form should be redirected to  RESPOND PEER TRADE where he can also make an offer to friend
    // If Declined, just send an email informing friend of unsuccessful trade but rather the item will show in general
    //offers
    //Respond to peer offer from PeerInterest form
    app.post('/RespondPeerTrade/:id', function (req, res) {
        //Indicate if friend is interested or not interested in the product offer
        var PeerTradeID = req.params.id;
        var FirstCustomerEmail, FullName, FirstCustomerID = 0;
        //Get the details of the customer who first offered the service
        dbconnection.query('Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID where PeerTradeID=? ', [PeerTradeID], function (err, rows) {
            if (err) throw err;
            if (rows) {
                for (var i in rows) {
                    FirstCustomerID = rows[i].CustomerID;
                    FirstCustomerEmail = rows[i].EmailAddress;
                    FullName = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
                    console.log(rows);
                }
            }
            if (req.body.Decline === "Declined") {
                var PeerTrade = {
                    TradeStatus: 'Declined'
                };

                dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                    if (err) throw err;
                    console.log('Peer Trade Rejected');
                });
                //send mail
                var mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: FirstCustomerEmail, // list of receivers
                    subject: 'Peer Trade Response:Product', // Subject line
                    html: 'Hello ' + FullName + ',<br><br> ' + req.user.FN + ' is not interested in your product offer.' +
                    '<br>Your offer is still listed for other customer to see and contact if they are interested' +
                    '<br><br>Thank you!<br>Barter Trading Team </br>'
                };
                //send email
                sendemail(mailOptions);
                //save activity log
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'not interested in peer product offer:',
                    ActivityDateTime: new Date()
                };

                SaveActivity(PostActivity);

                //Send notification
                var PostNotify = {
                    CustomerID: req.user.id,
                    NotificationDetails: 'is not interested in your product offer',
                    FlagAsShown: '0',
                    ToCustomerID: FirstCustomerID,
                    NotificationDate: new Date()

                }
                AddNotification(PostNotify);
                res.redirect('/');
            } else {
                //NB think of not updating yet because link expires if customer doesn't not offer immidiately
                var PeerTrade = {
                    TradeStatus: 'Interested'
                }
                dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                    if (err) throw err
                })
                dbconnection.query('Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID where PeerTradeID=? ', [PeerTradeID], function (err, rows) {
                    if (err) throw err
                    console.log(rows);
                    //get all product categories from db into the select optionBox
                    dbconnection.query("Select * from ProductCategories", function (err, prorows) {
                        if (err) {
                            console.log("Error Selecting : %s ", err);
                        }
                        dbconnection.query("Select * from ServiceCategory", function (err, servicerows) {
                            if (err) {
                                console.log("Error Selecting : %s ", err);
                            }
                            console.log('Peer Interested');
                            //send mail
                            var mailOptions = {
                                from: 'B-Commerce <adjeiessel@gmail.com',
                                to: FirstCustomerEmail, // list of receivers
                                subject: 'Peer Trade Response:Product', // Subject line
                                html: 'Hello ' + FullName + ',<br><br> ' + req.user.FN + ' is interested in your product offer and will be sending' +
                                '<br>you an offer to see if you are interested as well.' +
                                '<br><br>Thank you!<br>Barter Trading Team </br>'
                            };
                            //send email
                            sendemail(mailOptions);
                            //save activity log
                            var PostActivity = {
                                CustomerID: req.user.id,
                                ActivityName: 'interested in peer product offer:',
                                ActivityDateTime: new Date()
                            }
                            SaveActivity(PostActivity);

                            //Send notification
                            var PostNotify = {
                                CustomerID: req.user.id,
                                NotificationDetails: 'is interested in your product offer',
                                FlagAsShown: '0',
                                ToCustomerID: FirstCustomerID,
                                NotificationDate: new Date()

                            }
                            AddNotification(PostNotify);

                            //redirect to RespondPeerTrade to allow customer to also make an offer and notify customer via email and notification
                            res.render('pages/RespondPeerTrade', {
                                CustomerDetails: rows,
                                ProCategories: prorows,
                                SerCategories: servicerows,
                                PeerID: PeerTradeID
                            });
                        });
                    });

                });
            }
        });
    });

    app.get('/RespondPeerService/:id', isLoggedIn, function (req, res) {
        //Get the details of the service offered by friend
        var pingID = req.params.id;
        var tradestatus = "Pending";

        dbconnection.query("Select * from ServiceOffers As S Join PeerTrade As PT on S.ServiceOfferID=PT.FirstFriendServiceOfferID Join ServiceCategory C on C.ServiceCatID=S.ServiceCatID where PeerTradeID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
            console.log(rows);
            res.render('pages/PeerServiceInterest', {PeerOffer: rows});
        });

    });
    //Respond to friend's service offer either by showing interest or declining offer
    app.post('/RespondPeerService/:id', isLoggedIn, function (req, res) {
        //Indicate if friend is interested or not interested in the product offer
        var PeerTradeID = req.params.id;
        var FirstCustomerEmail, FullName, FirstCustomerID = 0;
        //Get the details of the customer who first offered the service
        dbconnection.query('Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID where PeerTradeID=? ', [PeerTradeID], function (err, rows) {
            if (err) throw err;
            if (rows) {
                for (var i in rows) {
                    FirstCustomerID = rows[i].CustomerID;
                    FirstCustomerEmail = rows[i].EmailAddress;
                    FullName = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName
                    console.log(rows);
                }
            }
            if (req.body.Decline === "Declined") {
                var PeerTrade = {
                    TradeStatus: 'Declined'
                };
                //Update PeerTrade Setting Trade Status to declined
                dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                    if (err) throw err;
                    console.log('Service Peer Trade Rejected');
                });
                //send mail
                var mailOptions = {
                    to: FirstCustomerEmail, // list of receivers
                    subject: 'Peer Trade Response:Service', // Subject line
                    html: 'Hello ' + FullName + ',<br><br> ' + req.user.FN + ' is not interested in your service offer.' +
                    '<br>Your offer is still listed for other customer to see and contact if they are interested' +
                    '<br><br>Thank you!<br>Barter Trading Team </br>'
                };
                //send email
                sendemail(mailOptions);

                //save activity log
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'is not interested in peer service offer:',
                    ActivityDateTime: new Date()
                }
                SaveActivity(PostActivity);

                //Send notification
                var PostNotify = {
                    CustomerID: req.user.id,
                    NotificationDetails: 'is not interested in your service offer',
                    FlagAsShown: '0',
                    ToCustomerID: FirstCustomerID,
                    NotificationDate: new Date()

                }
                AddNotification(PostNotify);
                res.redirect('/');
            } else {
                //NB think of not updating yet because link expires if customer doesn't not offer immidiately
                var PeerTrade = {
                    TradeStatus: 'Interested'
                };
                //Update the PeerTable setting the TradeStatus to Interested
                dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                    if (err) throw err;
                });
                //get all product categories from db into the select optionBox
                dbconnection.query("Select * from ProductCategories", function (err, prorows) {
                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    dbconnection.query("Select * from ServiceCategory", function (err, servicerows) {
                        if (err) {
                            console.log("Error Selecting : %s ", err);
                        }
                        console.log('Peer Interested');

                        //send mail
                        var mailOptions = {
                            to: FirstCustomerEmail, // list of receivers
                            subject: 'Peer Trade Response:Service', // Subject line
                            html: 'Hello ' + FullName + ',<br><br> ' + req.user.FN + ' is interested in your service offer and will be sending' +
                            '<br>you an offer to see if you are interested as well.' +
                            '<br><br>Thank you!<br>Barter Trading Team </br>'
                        };
                        //send email
                        sendemail(mailOptions);
                        //save activity log
                        var PostActivity = {
                            CustomerID: req.user.id,
                            ActivityName: 'Interested in peer service offer:',
                            ActivityDateTime: new Date()
                        }
                        SaveActivity(PostActivity);

                        //Send notification
                        var PostNotify = {
                            CustomerID: req.user.id,
                            NotificationDetails: 'is interested in your service offer',
                            FlagAsShown: '0',
                            ToCustomerID: FirstCustomerID,
                            NotificationDate: new Date()

                        }
                        AddNotification(PostNotify);

                        //redirect to RespondPeerTrade to allow customer to also make an offer and notify customer via email and notification
                        res.render('pages/RespondPeerService', {
                            CustomerDetails: rows,
                            ProCategories: prorows,
                            SerCategories: servicerows,
                            PeerID: PeerTradeID
                        });
                    });
                });
            }
        });
    });


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


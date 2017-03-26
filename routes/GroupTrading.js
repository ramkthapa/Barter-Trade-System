module.exports = function (app, dbconnection, SaveActivity, transporter) {
//   GET home page.
//FOR POSTING OFFER TO THE ENTIRE GROUP MEMBERS
    app.get('/GroupTrade', isLoggedIn, function (req, res) {
        //based on his/her ID customerID
        var CustomerId = req.user.id;
        var GroupName = [];
        dbconnection.query("Select * from Groups where CustomerID=?", [CustomerId], function (err, rows) {
            if (err) {
                console.log(err);
            }
            if (rows) {
                for (var i in rows) {
                    GroupName[i] = rows[i].GroupName;
                }
                console.log(GroupName);
            }
            res.render('pages/GroupTrade', {YourGroups: GroupName});
        });
    });
    app.get('/searchproduct', function (req, res) {
        var ProductStatus = 'Available';
        var CustomerId = req.user.id;
        dbconnection.query('Select ProductName from ProductOffers where (CustomerID="' + CustomerId + '" and ProductStatus="' + ProductStatus + '")and ProductName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (var i = 0; i < rows.length; i++) {
                data.push(rows[i].ProductName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    });
    app.get('/searchservice', function (req, res) {
        var ServiceStatus = 'Available';
        var CustomerId = req.user.id;
        dbconnection.query('Select ServiceName from ServiceOffers where (CustomerID="' + CustomerId + '" and ServiceStatus="' + ServiceStatus + '")and ServiceName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (var i = 0; i < rows.length; i++) {
                data.push(rows[i].ServiceName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    });
    app.post('/GroupTrade', function (req, res) {
        var GID, EmailAddress = [], ServiceEmailAddress = [], productofferID, serviceofferID;
        var PostData = {
            GroupName: req.body.GroupName,
            ProductName: req.body.typeahead,
            ServiceName: req.body.typeaheadservice,
            OptionP: req.body.option,
            OptionS: req.body.optionS
        };
        if (PostData.OptionP === "Product") {
            //Get Email
            dbconnection.query('Select EmailAddress from Customers As C Join GroupMembers As GM On C.CustomerID=GM.MemberID Join Groups As G on G.GroupID=GM.GroupID Where GroupName=?', [PostData.GroupName], function (err, myemails) {
                if (err)throw err;
                if (myemails) {
                    for (var i in myemails) {
                        EmailAddress.push(myemails[i].EmailAddress);
                        console.log(EmailAddress);
                    }
                }
                //Get GroupID
                dbconnection.query('select GroupID from Groups where GroupName=?', [PostData.GroupName], function (errs, results) {
                    if (errs) throw errs;
                    if (results) {
                        for (var a in results) {
                            GID = results[a].GroupID;
                            console.log('GroupID', GID);
                        }
                    }
                    //Get ProductID
                    dbconnection.query('select ProductOfferID from ProductOffers where ProductName=?', [PostData.ProductName], function (errs, results) {
                        if (errs) throw errs;
                        if (results) {
                            for (var a in results) {
                                productofferID = results[a].ProductOfferID;
                                console.log('productOfferID', productofferID);
                            }
                        }
                        //Create an object that will be submitted to the database
                        var SubmitAllData = {
                            GroupID: GID,
                            ProductOfferID: productofferID,
                            TradeStatus: 'Pending',
                            TradeDate: new Date()
                        };
                        dbconnection.query('Insert  into GroupTrade set? ', [SubmitAllData], function (err, Grows) {
                            if (err) throw err;
                            console.log('Group Trade has Saved Successfully Created for product');
                            var GroupTradeID = Grows.insertId;

                            var urllink = "http://" + req.get('host') + "/GroupOffer/" + GroupTradeID;

                            var mailOptions = {
                                from: 'B-Commerce <adjeiessel@gmail.com',
                                to: EmailAddress, // list of receivers
                                subject: 'Group Offer:Product', // Subject line
                                html: 'Hello ,<br><br> ' + req.user.FN + ' wants to trade <b>' + PostData.ProductName + '</b> with you and other group members.<br>Please ' +
                                'open the link below to see if you are interested<br> to trade any item/product with him for that offer.<br><br><a href="' + urllink + '">Click to check offer</a><br><br>Thank you!<br>Barter Trading Team </br>'
                            };
                            sendemail(mailOptions);

                            //save activity log
                            var PostActivity = {
                                CustomerID: req.user.id,
                                ActivityName: 'Offered to trade your product with your group members: ',
                                ActivityDateTime: new Date()
                            };
                            SaveActivity(PostActivity);
                        });
                    });
                });
            });
        } else if (PostData.OptionS === "Service") {
            //GET email address
            //Get Email
            dbconnection.query('Select EmailAddress from Customers As C Join GroupMembers As GM On C.CustomerID=GM.MemberID Join Groups As G on G.GroupID=GM.GroupID Where GroupName=?', [PostData.GroupName], function (err, emailsrows) {
                if (err)throw err;
                if (emailsrows) {
                    for (var i in emailsrows) {
                        ServiceEmailAddress.push(emailsrows[i].EmailAddress);
                        console.log(ServiceEmailAddress);
                    }
                }
                //Get GroupID
                dbconnection.query('select GroupID from Groups where GroupName=?', [PostData.GroupName], function (errs, results) {
                    if (errs) throw errs;
                    if (results) {

                        for (var a in results) {
                            GID = results[a].GroupID;
                            console.log('GroupID', GID);
                        }
                    }
                    //Get Service offer ID
                    dbconnection.query('select ServiceOfferID from ServiceOffers where ServiceName=?', [PostData.ServiceName], function (errs, rows) {
                        if (errs) throw errs;
                        if (rows) {
                            for (var a in rows) {
                                serviceofferID = rows[a].ServiceOfferID;
                                console.log('serviceofferID', serviceofferID);
                            }
                        }
                        //Create an object that will be submitted to the database
                        var SubmitAllData = {
                            GroupID: GID,
                            ServiceOfferID: serviceofferID,
                            TradeStatus: 'Pending',
                            TradeDate: new Date()
                        };
                        dbconnection.query('Insert  into GroupTrade set? ', [SubmitAllData], function (err, Srows) {
                            if (err) throw err;
                            console.log('Group Trade has Saved Successfully Created for Service');

                            var GroupTradeID = Srows.insertId;

                            var urllink = "http://" + req.get('host') + "/GroupServiceOffer/" + GroupTradeID;
                            //Prepare mail
                            var mailOptions = {
                                from: 'B-Commerce <adjeiessel@gmail.com',
                                to: ServiceEmailAddress, // list of receivers
                                subject: 'Group Offer:Service', // Subject line
                                html: 'Hello ,<br><br> ' + req.user.FN + ' wants to trade <b>' + PostData.ServiceName + '</b> with you and other group members.<br>Please ' +
                                'open the link below to see if you are interested in trading any service for such service offer.<br><br><a href="' + urllink + '">Click to check offer</a><br><br>Thank you!<br>Barter Trading Team </br>'
                            };
                            //send email
                            sendemail(mailOptions);

                            //save activity log
                            var PostActivity = {
                                CustomerID: req.user.id,
                                ActivityName: 'placed  service with your group members: ',
                                ActivityDateTime: new Date()
                            };
                            SaveActivity(PostActivity);
                        });
                    });
                });
            });
        }
        res.redirect('/');
    });

    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }

    // send mail with defined transport object
    function sendemail(mailOptions) {
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
    }

};


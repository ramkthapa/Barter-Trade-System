/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    //product variables
    var GroupOwner, GroupOwnerProductOffer, GroupOwnerProductID, GroupOwnerID;
    //service variables
    var GroupOwnerServiceOffer, GroupOwnerServiceID;
    var MemberProductOffer, MemberProductID, MemberEmail, MemberName, TradeID;

    app.get('/MemberOffer/:id', isLoggedIn, function (req, res) {
        //Get the member offerID
        var memberID = req.params.id;
        var tradestatus = 'Interested';
        var productStatus = 'Pending Acceptance';
        var OwnerProductStatus = 'Available';
        var GroupTradeID, Groupownername;
        var GroupMemberName;

        //Gets the Product Posted by first Group Member: Group Owner
        dbconnection.query("Select * from ProductOffers As P Join GroupTrade As GT on P.ProductOfferID=GT.ProductOfferID Join GroupMemberOffer As GM on GM.GroupTradeID=GT.GroupTradeID " +
        "where memberOfferID=? and(TradeStatus=? and ProductStatus=?) ", [memberID, tradestatus, OwnerProductStatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            //Get the GroupTradeID
            if (row) {
                for (var i in row) {
                    GroupTradeID = row[i].GroupTradeID;
                    TradeID = GroupTradeID;
                    GroupOwnerProductOffer = row[i].ProductName;
                    GroupOwnerProductID = row[i].ProductOfferID;
                    console.log('Group Trade ID' + GroupTradeID);
                }
            }
            //Get the Offer made by the second customer: Member of the Group
            dbconnection.query("Select * from ProductOffers As P Join GroupMemberOffer As GM on P.ProductOfferID=GM.ProductOfferID Join GroupTrade As GT on GT.GroupTradeID=GM.GroupTradeID" +
            " where memberOfferID=? and (TradeStatus=? and ProductStatus=?)", [memberID, tradestatus, productStatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        MemberProductOffer = rows[i].ProductName;
                        MemberProductID = rows[i].ProductOfferID;
                    }
                }
                dbconnection.query("Select FirstName,LastName,MiddleName from Customers As C Join Groups As G On C.CustomerID=G.CustomerID Join GroupTrade As T  On T.GroupID=G.GroupID where GroupTradeID=?", [GroupTradeID], function (error, Gropownerrows) {
                    if (error) {
                        console.log(error);
                    }
                    if (Gropownerrows) {
                        for (var i in Gropownerrows) {
                            Groupownername = Gropownerrows[i].FirstName + ' ' + Gropownerrows[i].LastName + ' ' + Gropownerrows[i].MiddleName
                            GroupOwner = Groupownername;
                            GroupOwnerID = Gropownerrows[i].CustomerID;
                        }
                    }
                    //Get Member name
                    dbconnection.query("Select FirstName,LastName,MiddleName,EmailAddress from Customers As C Join ProductOffers AS P on C.CustomerID=P.CustomerID Join GroupMemberOffer As GM on GM.ProductOfferID=P.ProductOfferID where memberOfferID=?", [memberID], function (error, memrows) {
                        if (error) {
                            console.log(error);
                        }
                        if (memrows) {
                            for (var i in memrows) {
                                GroupMemberName = memrows[i].FirstName + ' ' + memrows[i].LastName + ' ' + memrows[i].MiddleName;
                                MemberEmail = memrows[i].EmailAddress;
                                MemberName = GroupMemberName;
                            }
                        }

                        res.render('pages/AcceptMemberOffer', {
                            FirstCustomerResults: row,
                            SecondCustomerResults: rows,
                            MemberName: GroupMemberName,
                            OwnerName: Groupownername
                        });
                    })
                })
            })
        })
    });
    app.post('/MemberOffer/:id', isLoggedIn, function (req, res) {
        //interested or decline offer
        var memberID = req.params.id;
        var tradestatus, ProductStatus, Activity;
        if (req.body.Decline == 'Declined') {
            tradestatus = 'Declined';
            ProductStatus = 'Available';
            Activity = 'Declined Offer from ' + MemberName;
            //put decline message code here

            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: MemberEmail, // list of receivers
                subject: 'Group Trade Completed', // Subject line
                html: 'Hello ' + MemberName + ',<br><br> <b>' + GroupOwner + '</b> has declined the offer made and/or is not to trade <b>' + GroupOwnerProductOffer + '</b> for <b>' + MemberProductOffer + '</b>. Please ' +
                'your offer is made available for other interested customer to contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        } else {
            tradestatus = 'Accepted';
            ProductStatus = 'Traded Out';
            Activity = 'Accepted Offer from ' + MemberName;
            //put accept message code here
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: MemberEmail, // list of receivers
                subject: 'Group Trade Completed', // Subject line
                html: 'Hello ' + MemberName + ',<br><br> <b>' + GroupOwner + '</b> has accepted to trade with you <b>' + GroupOwnerProductOffer + '</b> for <b>' + MemberProductOffer + '</b>. Please ' +
                'be ready to ship the item to the customer. Customer shipping address can be found under their profile.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }
        var AcceptOffer = {
            TradeStatus: tradestatus,
            DecisionDate: new Date()
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        dbconnection.query('Update GroupTrade set? where GroupTradeID=?', [AcceptOffer, TradeID], function (err) {
            if (err) throw err;
            console.log('Group Trade Completed');
        });
        //update product status for each offer in the productoffer
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus, GroupOwnerProductID], function (err) {
            if (err) throw err;
            console.log('First Product Status Updated');
        });
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus, MemberProductID], function (err) {
            if (err) throw err;
            console.log('Member Product Status Updated');
        });
        //save activity
        SaveActivity(PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()})
        //Add notification
        AddNotification(PostNotify = {
            CustomerID: req.user.id,
            NotificationDetails: 'Accepted your offer',
            FlagAsShown: '0',
            ToCustomerID: GroupOwnerID,
            NotificationDate: new Date()

        });
        res.redirect('/');

    });

    app.get('/MemberServiceOffer/:id', isLoggedIn, function (req, res) {
        //Get the services posted by all parties
        //Get the member offerID
        var memberID = req.params.id;
        var tradestatus = 'Interested';
        var serviceStatus = 'Pending Acceptance';
        var OwnerServiceStatus = 'Available';
        var GroupTradeID, Groupownername;
        var GroupMemberName;

        //Gets the service Posted by first Group Member: Group Owner
        dbconnection.query("Select * from ServiceOffers As S Join GroupTrade As GT on S.ServiceOfferID=GT.ServiceOfferID Join GroupMemberOffer As GM on GM.GroupTradeID=GT.GroupTradeID " +
        "where memberOfferID=? and(TradeStatus=? and ServiceStatus=?) ", [memberID, tradestatus, OwnerServiceStatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            //Get the GroupTradeID
            if (row) {
                for (var i in row) {
                    GroupTradeID = row[i].GroupTradeID;
                    TradeID = GroupTradeID;
                    GroupOwnerServiceOffer = row[i].ProductName;
                    GroupOwnerServiceID = row[i].ServiceOfferID;
                    console.log('Group Trade ID' + GroupTradeID);
                }
            }
            //Get the service Offer made by the second customer: Member of the Group
            dbconnection.query("Select * from ServiceOffers As S Join GroupMemberOffer As GM on S.ServiceOfferID=GM.ServiceOfferID Join GroupTrade As GT on GT.GroupTradeID=GM.GroupTradeID" +
            " where memberOfferID=? and (TradeStatus=? and ServiceStatus=?)", [memberID, tradestatus, serviceStatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        MemberProductOffer = rows[i].ServiceName;
                        MemberProductID = rows[i].ServiceOfferID;
                    }
                }
                //Get the name of the person who posted the service, the group owner
                dbconnection.query("Select FirstName,LastName,MiddleName from Customers As C Join Groups As G On C.CustomerID=G.CustomerID Join GroupTrade As T  On T.GroupID=G.GroupID where GroupTradeID=?", [GroupTradeID], function (error, Gropownerrows) {
                    if (error) {
                        console.log(error);
                    }
                    if (Gropownerrows) {
                        for (var i in Gropownerrows) {
                            Groupownername = Gropownerrows[i].FirstName + ' ' + Gropownerrows[i].LastName + ' ' + Gropownerrows[i].MiddleName
                            GroupOwner = Groupownername;
                            GroupOwnerID = Gropownerrows[i].CustomerID;
                        }
                    }
                    //Get Member name, interested member name
                    dbconnection.query("Select FirstName,LastName,MiddleName,EmailAddress from Customers As C Join GroupMemberOffer As GM on GM.CustomerID=C.CustomerID where memberOfferID=?", [memberID], function (error, memrows) {
                        if (error) {
                            console.log(error);
                        }
                        if (memrows) {
                            for (var i in memrows) {
                                GroupMemberName = memrows[i].FirstName + ' ' + memrows[i].LastName + ' ' + memrows[i].MiddleName;
                                MemberEmail = memrows[i].EmailAddress;
                                MemberName = GroupMemberName;
                            }
                        }

                        res.render('pages/AcceptServiceOffer', {
                            FirstCustomerResults: row,
                            SecondCustomerResults: rows,
                            MemberName: GroupMemberName,
                            OwnerName: Groupownername
                        });
                    })
                })
            })
        })
    })
    app.post('/MemberServiceOffer/:id', isLoggedIn, function (req, res) {
        //interested or decline offer
        var memberID = req.params.id;
        var tradestatus, serviceStatus, Activity;
        if (req.body.Decline == 'Declined') {
            tradestatus = 'Declined';
            serviceStatus = 'Available';
            Activity = 'Declined Offer from ' + MemberName;
            //post deline message here
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: MemberEmail, // list of receivers
                subject: 'Group trade completed for service', // Subject line
                html: 'Hello ' + MemberName + ',<br><br> <b>' + GroupOwner + '</b> has declined the service offer made and/or is not to trade <b>' + GroupOwnerServiceOffer + '</b> for <b>' + MemberProductOffer + '</b>. Please ' +
                'be ready to sign or make an agreement with customer or group member for service.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        } else {
            tradestatus = 'Accepted';
            serviceStatus = 'Traded Out';
            Activity = 'Accepted Offer from ' + MemberName;
            //post message code here
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: MemberEmail, // list of receivers
                subject: 'Group trade completed for service', // Subject line
                html: 'Hello ' + MemberName + ',<br><br> <b>' + GroupOwner + '</b> has accepted to trade with you <b>' + GroupOwnerServiceOffer + '</b> for <b>' + MemberProductOffer + '</b>. Please ' +
                'your service offer is made available for other interested customer to contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }
        var AcceptOffer = {
            TradeStatus: tradestatus,
            DecisionDate: new Date()
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        dbconnection.query('Update GroupTrade set? where GroupTradeID=?', [AcceptOffer, TradeID], function (err) {
            if (err) throw err;
            console.log('Group Trade Completed');
        });
        //update product status for each offer in the productoffer
        dbconnection.query('Update ServiceOffers set ServiceStatus=? where ServiceOfferID =?', [serviceStatus, GroupOwnerProductID], function (err) {
            if (err) throw err;
            console.log('First Service Status Updated');
        });
        dbconnection.query('Update ServiceOffers set ServiceStatus=? where ServiceOfferID =?', [serviceStatus, MemberProductID], function (err) {
            if (err) throw err;
            console.log('Member service Status Updated');
        });
        //save activity
        var PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()};
        SaveActivity(PostActivity);
        //Add notification
        var PostNotify = {
            CustomerID: req.user.id,
            NotificationDetails: 'Accepted your service offer',
            FlagAsShown: '0',
            ToCustomerID: GroupOwnerID,
            NotificationDate: new Date()

        };
        AddNotification(PostNotify);
        res.redirect('/');
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
};
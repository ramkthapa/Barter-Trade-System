/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    var FirstCustomerName, FirstCustomerEmail, FirstCustomerProduct, FID;
    var SecondCustomerName, SecondCustomerEmail, SecondCustomerProduct, SID;
    //for Product
    app.get('/AcceptPeerTrade/:id', isLoggedIn, function (req, res) {
        //Get the PeertradeID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var peerTradeID = req.params.id;
        var tradestatus = 'Interested';
        //shows the Posted Customer offered
        dbconnection.query("Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID Join ProductOffers AS P on P.ProductOfferID=PT.FirstFriendProductOfferID where PeerTradeID=? and TradeStatus=?", [peerTradeID, tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if (row) {
                for (var i in row) {
                    FirstCustomerName = row[i].FirstName + ' ' + row[i].LastName + '' + row[i].MiddleName;
                    FirstCustomerEmail = row[i].EmailAddress;
                    FirstCustomerProduct = row[i].ProductName;
                    FID = row[i].CustomerID;
                }
            }
            //shows what the interested customer also has to offer
            dbconnection.query("Select * from  Customers As  C Join FriendsList As F on C.CustomerID=F.FriendID Join PeerTrade As PT on PT.FriendListID=F.FriendListID Join ProductOffers AS P on P.ProductOfferID =PT.SecondFriendProductOfferID where PeerTradeID=? and TradeStatus=?", [peerTradeID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        SecondCustomerEmail = rows[i].EmailAddress;
                        SecondCustomerName = rows[i].FirstName + ' ' + rows[i].LastName + '' + rows[i].MiddleName;
                        SecondCustomerProduct = rows[i].ProductName;
                        SID = row[i].CustomerID;
                    }
                }
                res.render('pages/AcceptPeerTrade', {FirstCustomerResults: row, SecondCustomerResults: rows});
            })
        })
    });
    app.post('/AcceptPeerTrade/:id', isLoggedIn, function (req, res) {

        var PeerID = req.params.id;
        var tradestatus, ProductStatus, Activity;
        var Decision = req.body.Decline
        if (Decision === 'Declined') {
            tradestatus = 'Declined'
            ProductStatus = 'Available'
            Activity = 'Declined Offer from ' + SecondCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: FirstCustomerEmail + ', ' + SecondCustomerEmail,// list of receivers
                subject: 'Peer Trade Completed:Declined', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + FirstCustomerName + ' </b> and <b>' + SecondCustomerName + '</b> was not accepted.Product/Item is still listed for <br>for other ' +
                'interested customers to contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        } else {
            tradestatus = 'Accepted'
            ProductStatus = 'Traded Out'
            Activity = 'Accepted Offer from ' + FirstCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: FirstCustomerEmail + ', ' + SecondCustomerEmail,// list of receivers
                subject: 'Peer Trade Completed:Accepted', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + FirstCustomerName + ' </b> and <b>' + SecondCustomerName + '</b> has successfully been completed.<br>Please ' +
                'be ready to ship the item/product to your friend.<br>Shipping address can be found under their profile.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        var PeerTrade = {
            TradeStatus: tradestatus
        };
        var ProductStatus = {
            ProductStatus: ProductStatus
        };
        dbconnection.query('Update ProductOffers  As P Join PeerTrade As PT On PT.FirstFriendProductOfferID=P.ProductOfferID set? where PT.PeerTradeID=? ', [ProductStatus, PeerID], function (err) {
            if (err) throw err;
            console.log('First Product Status Updated');
        });
        dbconnection.query('Update ProductOffers  As P Join PeerTrade As PT On PT.SecondFriendProductOfferID=P.ProductOfferID set? where PT.PeerTradeID=? ', [ProductStatus, PeerID], function (err) {
            if (err) throw err;
            console.log('Second Product Status Updated');
        });
        dbconnection.query('Update PeerTrade set? where PeerTradeID=?', [PeerTrade, PeerID], function (errs) {
            if (errs) throw errs;
            console.log('Peer Trade Status Updated');
        });
        //save activity
        var PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()}
        SaveActivity(PostActivity);
        //Add notification
        var PostNotify1 = {
            CustomerID: FID,
            NotificationDetails: 'Peer Trade Completed',
            FlagAsShown: '0',
            ToCustomerID: SID,
            NotificationDate: new Date()

        };
        var PostNotify2 = {
            CustomerID: SID,
            NotificationDetails: 'Peer Trade Completed',
            FlagAsShown: '0',
            ToCustomerID: FID,
            NotificationDate: new Date()

        }
        AddNotification(PostNotify1);
        AddNotification(PostNotify2);
        res.redirect('/');
    });
    //for service
    app.get('/AcceptPeerService/:id', isLoggedIn, function (req, res) {
        //Get the PeertradeID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var peerTradeID = req.params.id;
        var tradestatus = 'Interested';
        //shows the service Customer offered
        dbconnection.query("Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on" +
        " PT.FriendListID=F.FriendListID Join ServiceOffers AS S on S.ServiceOfferID=PT.FirstFriendServiceOfferID where PeerTradeID=? " +
        "and TradeStatus=?", [peerTradeID, tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if (row) {
                for (var i in row) {
                    FirstCustomerName = row[i].FirstName + ' ' + row[i].LastName + '' + row[i].MiddleName;
                    FirstCustomerEmail = row[i].EmailAddress;
                    FirstCustomerProduct = row[i].ProductName;
                    FID = row[i].CustomerID;
                }
            }
            //shows what the interested customer also has to offer
            dbconnection.query("Select * from  Customers As  C Join FriendsList As F on C.CustomerID=F.FriendID Join PeerTrade As PT" +
            " on PT.FriendListID=F.FriendListID Join ServiceOffers AS S on S.ServiceOfferID=PT.SecondFriendServiceOfferID where PeerTradeID=? " +
            "and TradeStatus=?", [peerTradeID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        SecondCustomerEmail = rows[i].EmailAddress;
                        SecondCustomerName = rows[i].FirstName + ' ' + rows[i].LastName + '' + rows[i].MiddleName;
                        SecondCustomerProduct = rows[i].ProductName;
                        SID = row[i].CustomerID;
                    }
                }
                //new view for accepting service
                res.render('pages/AcceptPeerServiceTrade', {FirstCustomerResults: row, SecondCustomerResults: rows});
            })
        })
    });
    app.post('/AcceptPeerService/:id', isLoggedIn, function (req, res) {

        var PeerID = req.params.id;
        var tradestatus, ServiceStatus, Activity;
        var Decision = req.body.Decline;
        if (Decision === 'Declined') {
            tradestatus = 'Declined'
            ServiceStatus = 'Available'
            Activity = 'Declined Offer from ' + SecondCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: FirstCustomerEmail + ', ' + SecondCustomerEmail,// list of receivers
                subject: 'Peer Trade Completed:Declined', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + FirstCustomerName + ' </b> and <b>' + SecondCustomerName + '</b> was not accepted and/or declined.<br>Offer is still ' +
                'listed for other interested customer to see and contact you.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        } else {
            tradestatus = 'Accepted'
            ServiceStatus = 'Traded Out'
            Activity = 'Accepted Offer from ' + FirstCustomerName
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: FirstCustomerEmail + ', ' + SecondCustomerEmail,// list of receivers
                subject: 'Peer Trade Completed:Accepted', // Subject line
                html: 'Hello, <br><br> Your trade between <b>' + FirstCustomerName + ' </b> and <b>' + SecondCustomerName + '</b> has successfully been completed.<br>Please ' +
                'be ready to accept and sign agreement for the transaction to be processed.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
            };
        }
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        });
        var PeerTrade = {
            TradeStatus: tradestatus
        };
        var ServiceStatus = {
            ServiceStatus: ServiceStatus
        };
        dbconnection.query('Update ServiceOffers  As S Join PeerTrade As PT On PT.FirstFriendServiceOfferID=S.ServiceOfferID set? where PT.PeerTradeID=? ', [ServiceStatus, PeerID], function (err) {
            if (err) throw err;
            console.log('First Service Status Updated');
        });
        dbconnection.query('Update ServiceOffers  As S Join PeerTrade As PT On PT.SecondFriendServiceOfferID=S.ServiceOfferID set? where PT.PeerTradeID=? ', [ServiceStatus, PeerID], function (err) {
            if (err) throw err;
            console.log('Second Service Status Updated');
        });
        dbconnection.query('Update PeerTrade set? where PeerTradeID=?', [PeerTrade, PeerID], function (errs) {
            if (errs) throw errs;
            console.log('Peer Status Updated');
        });
        //save activity
        var PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()}
        SaveActivity(PostActivity);
        //Add notification
        var PostNotify1 = {
            CustomerID: FID,
            NotificationDetails: 'Peer Trade completed and accepted',
            FlagAsShown: '0',
            ToCustomerID: SID,
            NotificationDate: new Date()

        };
        var PostNotify2 = {
            CustomerID: SID,
            NotificationDetails: 'Peer trade completed and accepted',
            FlagAsShown: '0',
            ToCustomerID: FID,
            NotificationDate: new Date()

        }
        AddNotification(PostNotify1);
        AddNotification(PostNotify2);
        res.redirect('/');
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
}
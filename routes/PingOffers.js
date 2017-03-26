/**
 * Created by ESSEL on 23-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    //for product
    app.get('/PingOffers/:id', isLoggedIn, function (req, res) {
        var urllink;
       //check if the customer who wants to ping has posted an offer before they can be allowed to ping someone's offer
        dbconnection.query('Select * from ProductOffers where CustomerID=?', [req.user.id], function (err, data) {
            if (err) throw err;
            if (!data.length >= 1) {
                res.send(' <br><strong>No Offers</strong><br> <span style="width: 712px;float: left;margin:0 auto;padding: 10px 13px ; border: 1px solid rgba(25, 122, 160, 0.5);border-radius: 4px">' +
                'Please you cannot ping customer about their products if you do not have any item to offer</span> </div>');
                return;
            }
            //Get the ID of the product the customer is Pinging/interested In
            var productID = req.params.id;
            //Get the ID of the customer who is interested in the offer/or who wants to ping
            var InterestedCustomerID = req.user.id;

            var PostedCustomerID,  EmailAdd, fname, productname,host;
            host = req.get('host');

            //Get the Details(customerID, email and the firstname of the customer who posted the item)
            dbconnection.query('Select C.CustomerID,EmailAddress,FirstName,ProductName from Customers As C Join ProductOffers' +
            ' As P on C.CustomerID=P.CustomerID where ProductOfferID=?', [productID], function (err, rows) {
                if (err) throw err
                if (rows) {
                    for (var i in rows) {
                        PostedCustomerID = rows[i].CustomerID;
                        EmailAdd = rows[i].EmailAddress;
                        fname = rows[i].FirstName;
                        productname = rows[i].ProductName;
                    }
                }

                //Save data into the productofferpings
                var PostPing = {
                    PostedCustomerID: PostedCustomerID,
                    InterestedCustomerID: InterestedCustomerID,
                    ProductOfferID: productID,
                    InterestedProductID: '0',
                    PingStatus: '0',
                    TradeStatus: 'Pending',
                    TransactionDate: new Date()
                };
                dbconnection.query('Insert  into ProductOfferPings set? ', [PostPing], function (err,rows) {
                    if (err) throw err;
                    console.log('Customer pinged');
                    if(rows){
                        //Prepare a link to be sent to the customer who posted the item, with the ID of the customer who
                        //is interested in his/her item, this link will enable him/her  get the items posted by the interested
                        //Customer, if he's interested in any, he respond with a ping for that item as well
                        urllink = "http://" + req.get('host') + "/Offers/" + rows.insertId
                    }

                //send the posted customer an email about possible trade and link to check other customers's item
                var mailOptions = {
                    to: EmailAdd, // list of receivers
                    subject: 'Notification of possible product trade', // Subject line
                    html: 'Hello ' + fname + ',<br><br> ' + req.user.FN + ' is interested in your product <b>' + productname + '.</b><br> Please ' +
                    'follow the link to check his/her product(s)/item(s) if you are interested to trade your item for any his/her product(s)/item(s).' +
                    '<br><br><a href="' + urllink + '">Products</a><br><br>Thank you!<br>Barter Trading Team </br>'
                };

                // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent:');
                    }
                })
                });
                //Save the activity preformed
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'ping customer about' + productname + '',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                //Notify posted customer about ping
                var PostNotify = {
                    CustomerID: InterestedCustomerID,
                    NotificationDetails: 'is interested in your ' + productname,
                    FlagAsShown: '0',
                    ToCustomerID: PostedCustomerID,
                    NotificationDate: new Date()

                };
                AddNotification(PostNotify);
                res.redirect('/ViewOffersServices');
            })
        })
    });

    //for service
    app.get('/PingService/:id', isLoggedIn, function (req, res) {
        var urllink;
        //check if the customer who wants to ping has posted an offer before they can be allowed to ping someone's offer
        dbconnection.query('Select * from ServiceOffers where CustomerID=?', [req.user.id], function (err, data) {
            if (err) throw err;
            if (!data.length >= 1) {
                res.send(' <br><strong>No Offers</strong><br> <span style="width: 712px;float: left;margin:0 auto;padding: 10px 13px ; border: 1px solid rgba(25, 122, 160, 0.5);border-radius: 4px">' +
                'Please you cannot ping customer about their products if you do not have any item to offer</span> </div>');
                return;
            }
            //Get the ID of the product the customer is Pinging/interested In
            var serviceID = req.params.id;
            //Get the ID of the customer who is interested in the offer/or who wants to ping
            var InterestedCustomerID = req.user.id;

            var PostedCustomerID, EmailAdd, fname, ServiceName, host;
            host = req.get('host');

            //Get the Details(customerID, email and the firstname of the customer who posted the service
            dbconnection.query('Select C.CustomerID,EmailAddress,FirstName,ServiceName from Customers As C Join ServiceOffers As S on C.CustomerID=S.CustomerID where ServiceOfferID=?', [serviceID], function (err, rows) {
                if (err) throw err;
                if (rows) {
                    for (var i in rows) {
                        PostedCustomerID = rows[i].CustomerID;
                        EmailAdd = rows[i].EmailAddress;
                        fname = rows[i].FirstName;
                        ServiceName = rows[i].ServiceName;
                    }
                }

                //Save data into the service offer pings
                var PostPing = {
                    PostedCustomerID: PostedCustomerID,
                    InterestedCustomerID: InterestedCustomerID,
                    ServiceOfferID: serviceID,
                    InterestedServiceID: '0',
                    PingStatus: '0',
                    TradeStatus: 'Pending',
                    PingDate: new Date()
                };
                dbconnection.query('Insert  into ServiceOfferPings set? ', [PostPing], function (err, rows) {
                    if (err) throw err;
                    console.log('Customer pinged');
                    if (rows) {
                        //Prepare a link to be sent to the customer who posted the item, with the ID of the customer who
                        //is interested in his/her item, this link will enable him/her  get the items posted by the interested
                        //Customer, if he's interested in any, he respond with a ping for that item as well
                        urllink = "http://" + req.get('host') + "/ServiceOffer/" + rows.insertId
                    }

                    //send the posted customer an email about possible trade and link to check other customers's item
                    var mailOptions = {
                        from: 'B-Commerce <adjeiessel@gmail.com',
                        to: EmailAdd, // list of receivers
                        subject: 'Notification of possible service trade', // Subject line
                        html: 'Hello ' + fname + ',<br><br> ' + req.user.FN + ' is interested in your service offer <b>' + ServiceName + '.</b><br> Please ' +
                        'follow the link to check if there are available service from customer to warrant to trade.' +
                        '<br><br><a href="' + urllink + '">Service</a><br><br>Thank you!<br>Barter Trading Team </br>'
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent:');
                        }
                    })
                });
                //Save the activity preformed
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'ping customer about ' + ServiceName + '',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                //Notify posted customer about ping
                var PostNotify = {
                    CustomerID: InterestedCustomerID,
                    NotificationDetails: 'is interested in your ' + ServiceName,
                    FlagAsShown: '0',
                    ToCustomerID: PostedCustomerID,
                    NotificationDate: new Date()

                };
                AddNotification(PostNotify);
                res.redirect('/ViewOffersServices');
            })
        })
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
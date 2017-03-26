/**
 * Created by ESSEL on 05-Mar-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {

    app.post('/GroupMemberOffer', isLoggedIn, function (req, res) {
        var postData = {
            GroupName: req.body.GroupName,
            CustomerName: req.body.MemberName,
            ProductName: req.body.typeahead,
            ServiceName: req.body.typeaheadservice,
            PostOption: req.body.option
        }
        var GroupTradeID, CustomerID, ProductID, ServiceID, GroupName, urllink, MemberOfferID,
            EmailAddress, ProductStatus = "Pending Acceptance", ServiceStatus = "Pending Acceptance";
        if (postData.PostOption == "Product") {
            //CODE POSTING PRODUCT

            //Select customer who posted the product for the interested member to send an offer to

            //Get the GrouptradeID of the transaction
            dbconnection.query('Select GroupTradeID from GroupTrade As T Join Groups As G on G.GroupID=T.GroupID where GroupName=?', [postData.GroupName], function (error, rows) {
                if (error)throw error
                if (rows) {
                    for (var i in rows) {
                        GroupTradeID = rows[i].GroupTradeID;
                    }
                }
                //Get the Member whom we are making the offer to
                dbconnection.query('Select CustomerID,EmailAddress from Customers where CONCAT(FirstName," ",LastName," ",MiddleName)=?', [postData.CustomerName], function (error, rows) {
                    if (error)throw error
                    if (rows) {
                        for (var i in rows) {
                            CustomerID = rows[i].CustomerID;
                            EmailAddress = rows[i].EmailAddress;
                        }
                    }
                    //Get the productID of the product we are offering to the initial posted customer
                    dbconnection.query('Select ProductOfferID from ProductOffers where ProductName=?', [postData.ProductName], function (error, row) {
                        if (error)throw error
                        if (row) {
                            for (var i in row) {
                                ProductID = row[i].ProductOfferID;
                            }
                        }

                        var PostMemberOffer = {
                            GroupTradeID: GroupTradeID,
                            CustomerID: CustomerID,
                            ProductOfferID: ProductID
                        }
                        dbconnection.query("Update ProductOffers set ProductStatus=? where ProductOfferID=?", [ProductStatus, PostMemberOffer.ProductOfferID], function (err) {
                            if (err)throw err
                            console.log('Update ProductOffer status');
                        })
                        dbconnection.query("Insert into GroupMemberOffer Set?", [PostMemberOffer], function (err, memrows) {
                            if (err) {
                                throw err
                            } else {
                                console.log('Member offer Added');
                                MemberOfferID = memrows.insertId;


                                //send link to all members about the interest and for them to also see what a member also has to offer
                                urllink = "http://" + req.get('host') + "/MemberOffer/" + MemberOfferID;
                                var mailOptions = {
                                    from: 'B-Commerce <adjeiessel@gmail.com',
                                    to: EmailAddress, // list of receivers
                                    subject: 'Group Member Offer:Product Offer', // Subject line
                                    html: 'Hello ' + req.user.FN + ' ,<br><br><b>' + postData.CustomerName + '</b> made you an offer of <b>' + postData.ProductName + '</b> for your product posted to group members<br><br>Please' +
                                    ' open the link below to either accept or decline the offer.' +
                                    '<br><br><a href="' + urllink + '">Click to check offer</a><br><br>' +
                                    'Thank you!<br>Barter Trading Team </br>'
                                };
                                sendemail(mailOptions);
                                //save activity log
                                SaveActivity(PostActivity = {
                                    CustomerID: req.user.id,
                                    ActivityName: 'Interested in offer to Group',
                                    ActivityDateTime: new Date()
                                });
                                res.redirect('/');
                            }
                        })
                    })
                })
            })
        } else {
            //CODE POSTING service

            //Select customer who posted the product for the interested member to send an offer to

            //Get the GroupTradeID of the transaction
            dbconnection.query('Select GroupTradeID from GroupTrade As T Join Groups As G on G.GroupID=T.GroupID where GroupName=?', [postData.GroupName], function (error, rows) {
                if (error)throw error
                if (rows) {
                    for (var i in rows) {
                        GroupTradeID = rows[i].GroupTradeID;
                    }
                }
                //Get the Member whom we are making the offer to
                dbconnection.query('Select CustomerID,EmailAddress from Customers where CONCAT(FirstName," ",LastName," ",MiddleName)=?', [postData.CustomerName], function (error, rows) {
                    if (error)throw error
                    if (rows) {
                        for (var i in rows) {
                            CustomerID = rows[i].CustomerID;
                            EmailAddress = rows[i].EmailAddress;
                        }
                    }
                    //Get the ServiceID of the Service we are offering to the initial posted customer
                    dbconnection.query('Select ServiceOfferID from ServiceOffers where ServiceName=?', [postData.ServiceName], function (error, row) {
                        if (error)throw error
                        if (row) {
                            for (var i in row) {
                                ServiceID = row[i].ServiceOfferID;
                            }
                        }

                        var PostServiceOffer = {
                            GroupTradeID: GroupTradeID,
                            CustomerID: CustomerID,
                            ServiceOfferID: ServiceID
                        }
                        dbconnection.query("Update ServiceOffers set ServiceStatus=? where ServiceOfferID=?", [ServiceStatus, PostServiceOffer.ServiceOfferID], function (err) {
                            if (err)throw err
                            console.log('Update Service Offer status');
                        })
                        dbconnection.query("Insert into GroupMemberOffer Set?", [PostServiceOffer], function (err, memrows) {
                            if (err) {
                                throw err
                            } else {
                                console.log('Member service offer Save');
                                MemberOfferID = memrows.insertId;


                                //send link to all members about the interest and for them to also see what a member also has to offer
                                urllink = "http://" + req.get('host') + "/MemberServiceOffer/" + MemberOfferID;
                                var mailOptions = {
                                    from: 'B-Commerce <adjeiessel@gmail.com',
                                    to: EmailAddress, // list of receivers
                                    subject: 'Group Member Offer:Service', // Subject line
                                    html: 'Hello ' + req.user.FN + ' ,<br><br><b>' + postData.CustomerName + '</b> made you an offer of <b>' + postData.ServiceName + '</b> for your service to group members<br><br>Please' +
                                    ' open the link below to either accept or decline the offer.' +
                                    '<br><br><a href="' + urllink + '">Click to check offer</a><br><br>' +
                                    'Thank you!<br>Barter Trading Team </br>'
                                };
                                sendemail(mailOptions);
                                //save activity log
                                var PostActivity = {
                                    CustomerID: req.user.id,
                                    ActivityName: 'Interested in service offer to Group',
                                    ActivityDateTime: new Date()
                                };
                                SaveActivity(PostActivity);
                                res.redirect('/');
                            }
                        })
                    })
                })
            })
        }

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


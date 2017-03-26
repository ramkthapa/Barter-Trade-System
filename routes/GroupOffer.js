/**
 * Created by ESSEL on 05-Mar-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity) {

    //for showing product to Group Member
    app.get('/GroupOffer/:id', isLoggedIn, function (req, res) {
        //get the details of the product posted to customer
        var GroupTradeID = req.params.id;
        var ProductStatus = 'Available';
        dbconnection.query("Select * from ProductOffers As P Join GroupTrade As G on P.ProductOfferID=G.ProductOfferID Join ProductCategories As C on P.CategoryID=C.CategoryID Join Groups As GP on GP.GroupID=G.GroupID where GroupTradeID=? and ProductStatus=?", [GroupTradeID, ProductStatus], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/GroupOffer', {GroupTrade: rows});
        })
    });

    //for showing service to Group Member
    app.get('/GroupServiceOffer/:id', isLoggedIn, function (req, res) {
        //get the details of the product posted to customer
        var GroupTradeID = req.params.id;
        var ProductStatus = 'Available';
        dbconnection.query("Select * from ServiceOffers As S Join GroupTrade As G on S.ServiceOfferID=G.ServiceOfferID Join ServiceCategory As SC on S.ServiceCatID=SC.ServiceCatID Join Groups As GP on GP.GroupID=G.GroupID where GroupTradeID=? and ServiceStatus=?", [GroupTradeID, ProductStatus], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/GroupServiceOffer', {GroupTrade: rows});
        })
    });

    //For either showing interest or declining offer for product
    app.post('/GroupOffer/:id', isLoggedIn, function (req, res) {
        //Accept or declined

        var GroupTradeID = req.params.id;
        var CustomerID = req.user.id;
        var GroupName, EmailAddress, FullName, TradeStatus;
        //Select customer who posted the product for the interested member to send an offer to


        //Get the name of the user who is interested in the offer
        dbconnection.query('Select GroupName,FirstName,LastName,MiddleName,EmailAddress from Customers As C Join Groups As G On C.CustomerID=G.CustomerID ' +
        'Join GroupTrade As T On T.GroupID=G.GroupID Where GroupTradeID=?', [GroupTradeID], function (error, rows) {
            if (error)throw error;
            if (rows) {
                for (var i in rows) {
                    GroupName = rows[i].GroupName;
                    EmailAddress = rows[i].EmailAddress;
                    FullName = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
                }
            }
            var Option = req.body.Decline;
            if (Option == 'Declined') {

                TradeStatus = "Declined";

                dbconnection.query("Update GroupTrade set TradeStatus=? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err;
                    console.log('Update group trade Declined');
                });

                mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello ' + GroupName + 'Group Members<br><br>' + req.user.FN + ' is not interested in the product/item offered to the group.' +
                    'Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);

                //save activity log
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Declined product offer in group',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                res.redirect('/');
            }
            else {
                TradeStatus = "Interested";
                dbconnection.query("Update GroupTrade set TradeStatus=? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err;
                    console.log('Update group trade interested');
                });

                var mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello <b>' + GroupName + '</b> Group Members,<br><br>' + req.user.FN + ' is interested in the product/item you offered to the group.<br><br> Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);
                //save activity log
                PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Interested product in offer to Group',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                res.render('pages/GroupMemberOffer', {Name: FullName, GroupName: GroupName});
            }
        })
    });

    //For either showing interest or declining offer for service
    app.post('/GroupServiceOffer/:id', isLoggedIn, function (req, res) {
        //Accept or declined

        var GroupTradeID = req.params.id;
        var CustomerID = req.user.id;
        var GroupName = '', EmailAddress = '', FullName = '', Option = req.body.Decline;
        //Select customer who posted the product for the interested member to send an offer to


        //Get the name of the user who is interested in the offer
        dbconnection.query('Select GroupName,FirstName,LastName,MiddleName,EmailAddress from Customers As C Join Groups As G On C.CustomerID=G.CustomerID ' +
        'Join GroupTrade As T On T.GroupID=G.GroupID Where GroupTradeID=?', [GroupTradeID], function (error, rows) {
            if (error)throw error;
            if (rows) {
                for (var i in rows) {
                    GroupName = rows[i].GroupName;
                    EmailAddress = rows[i].EmailAddress;
                    FullName = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
                }
            }
            if (Option === 'Declined') {

                var TradeStatus = "Declined";

                dbconnection.query("Update GroupTrade set TradeStatus=? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err;
                    console.log('Update group trade Declined');
                });

                var mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello ' + GroupName + 'Group Members<br><br>' + req.user.FN + ' is not interested in your service offer to the group.' +
                    'Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);

                //save activity log
                PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Declined service offer in group',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                res.redirect('/');
            }
            else {
                TradeStatus = "Interested";
                dbconnection.query("Update GroupTrade set TradeStatus=? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err;
                    console.log('Update group trade interested');
                });

                mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello <b>' + GroupName + '</b> Group Members,<br><br>' + req.user.FN + ' is interested in the service you offered to the group.<br><br> Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);
                //save activity log
                var PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Interested in service offer to Group',
                    ActivityDateTime: new Date()
                };
                SaveActivity(PostActivity);
                res.render('pages/GroupMemberOffer', {Name: FullName, GroupName: GroupName});
            }
        })
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
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
    }
};


module.exports = function (app, dbconnection) {
//   GET home page.
    app.get('/ViewTransaction', isLoggedIn, function (req, res) {
        var customemrID = req.user.id;
        dbconnection.query("Select ProductName,CategoryName,OfferDetails,OfferDate,ProductStatus from ProductOffers As P Join ProductCategories As C on P.CategoryID=C.CategoryID Where CustomerID=?", [customemrID], function (error, rows) {
            if (error) {
                throw error
            }
            dbconnection.query("Select ServiceName,ServiceCatName,ServiceDescription,EndDate,ServiceStatus from ServiceOffers As P Join ServiceCategory As S on S.ServiceCatID=S.ServiceCatID Where CustomerID=?", [customemrID], function (err, row) {
                if (err) {
                    throw err
                }

                dbconnection.query("Select ProductName,GroupName,OfferDetails,OfferDate,ProductStatus from ProductOffers As P Join GroupTrade As T on P.ProductOfferID=T.ProductOfferID Join Groups As G on G.GroupID=T.GroupID where G.CustomerID=?", [customemrID], function (errs, Grows) {
                    if (errs) {
                        throw errs
                    }

                    dbconnection.query("Select ProductName,CategoryName,OfferDetails,TradeDate,TradeStatus from PeerTrade As P Join FriendsList As F on P.FriendListID=F.FriendListID Join productoffers As PO on PO.ProductOfferID=P.FirstFriendProductOfferID Join ProductCategories As C on C.CategoryID=PO.CategoryID where PO.CustomerID=?", [customemrID], function (errs, peerrows) {
                        if (errs) {
                            throw errs
                        }
                        res.render('pages/ViewTransactions', {
                            ProductOffers: rows,
                            ServiceOffers: row,
                            GroupOffer: Grows,
                            PeerOffers: peerrows
                        });
                    })
                });
            })
        });
    })
    app.post('/Viewtransaction', function (req, res) {


        var CustomerID = req.user.id;
        var fromDate = req.body.FromDate;
        var ToDate = req.body.ToDate;

        dbconnection.query("Select ProductName,CategoryName,OfferDetails,OfferDate,ProductStatus from " +
        "ProductOffers As P Join ProductCategories As C on P.CategoryID=C.CategoryID Where CustomerID=? and (OfferDate between ? and ?)", [CustomerID, fromDate, ToDate], function (error, rows) {
            if (error) {
                throw error
            }
            dbconnection.query("Select ServiceName,ServiceCatName,ServiceDescription,EndDate,ServiceStatus from ServiceOffers As P Join " +
            "ServiceCategory As S on S.ServiceCatID=S.ServiceCatID Where CustomerID=? and (EndDate between ? and ?)", [CustomerID, fromDate, ToDate], function (err, row) {
                if (err) {
                    throw err
                }

                dbconnection.query("Select ProductName,GroupName,OfferDetails,OfferDate,ProductStatus from ProductOffers " +
                "As P Join GroupTrade As T on P.ProductOfferID=T.ProductOfferID Join Groups As G on G.GroupID=T.GroupID where G.CustomerID=? and (OfferDate between ? and ?)", [CustomerID, fromDate, ToDate], function (errs, Grows) {
                    if (errs) {
                        throw errs
                    }

                    dbconnection.query("Select ProductName,CategoryName,OfferDetails,TradeDate,TradeStatus from PeerTrade As P Join FriendsList As F on P.FriendListID=F.FriendListID Join productoffers As PO on PO.ProductOfferID=P.FirstFriendProductOfferID" +
                    " Join ProductCategories As C on C.CategoryID=PO.CategoryID where PO.CustomerID=? and (TradeDate between ? and ?)", [CustomerID, fromDate, ToDate], function (errs, peerrows) {
                        if (errs) {
                            throw errs
                        }
                        res.render('pages/ViewTransactions', {
                            ProductOffers: rows,
                            ServiceOffers: row,
                            GroupOffer: Grows,
                            PeerOffers: peerrows
                        });
                    })
                });
            })
        });
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
}


module.exports = function (app, dbconnection) {
//   GET home page.
    app.get('/WishList', isLoggedIn, function (req, res) {
        res.render('pages/WishList');
    });
    app.post('/WishList', function (req, res) {
        var LogincustomerID = req.user.id
        var negotiation, pub
        if (req.body.Negotiation) {
            negotiation = 1;
        }
        if (req.body.Publish) {
            pub = 1;
        }
        var PostData = {
            CustomerID: LogincustomerID,
            Product_ServiceName: req.body.ProServiceName,
            Description: req.body.Description,
            PublishedDate: new Date(),
            Published: pub,
            OpenNegotiation: negotiation
        }

        dbconnection.query('Insert  into WishList set? ', [PostData], function (err, rows) {
            if (err) {
                console.log("Error Inserting data", err)
            }
            else {
                console.log('Saved Successfully');
                //save activity log
                AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Added/Created a wishlist:',ActivityDateTime:new Date()});

            }
            res.redirect('/');
        })
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }

}


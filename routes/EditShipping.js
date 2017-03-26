/**
 * Created by ESSEL on 03-Feb-15.
 */
module.exports = function (app, dbconnection) {
    app.get('/EditShipping', isLoggedIn, function (req, res) {
        var CustomerID = req.user.id
        dbconnection.query("Select * from ShippingDetails where CustomerID='" + CustomerID + "'", function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/EditShipping', {shipData: rows});
        });
    });
    app.post('/EditShipping', function (req, res) {
        var Shipping = {
            AddressName: req.body.Address,
            City: req.body.City,
            State: req.body.State,
            PostalCode: req.body.PostalCode,
            Country: req.body.Country,
            MobileNumber: req.body.fullmobilenumber,
            OtherNumber: req.body.fullothernumber,
            OtherDetails: req.body.OtherDetails
        }
        dbconnection.query("Update shippingdetails set? Where CustomerID=?", [Shipping, req.user.id], function (err) {
            if (err) throw err
            console.log('Saved Successfully');
            //save activity log
            AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Updated shipping and address information:',ActivityDateTime:new Date()});
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
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
}

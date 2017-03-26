/**
 * Created by ESSEL on 03-Feb-15.
 */
module.exports = function(app,dbconnection) {
    app.get('/Shipping', isLoggedIn, function (req, res) {
        res.render('pages/Shipping');
    });
    app.post('/Shipping',function(req,res){
        var Shipping={
            CustomerID:req.user.id,
            AddressName:req.body.Address,
            OtherDetails:req.body.OtherDetails,
            City:req.body.City,
            State:req.body.State,
            PostalCode:req.body.PostalCode,
            Country:req.body.Country,
            MobileNumber:req.body.fullmobilenumber,
            OtherNumber:req.body.fullothernumber
        }
        dbconnection.query('Insert  into shippingdetails set? ', [Shipping], function (err) {
            if (err) {
                console.log("Error Inserting data", err)
            }
            else {
                console.log('Saved Successfully');
                //save activity log
                AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Added shipping/address details:',ActivityDateTime:new Date()});
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
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
}
/**
 * Created by ESSEL on 20-Feb-15.
 */
module.exports=function(app,dbconnection){

    app.get('/ServiceOffers/:sid', isLoggedIn, function (req, res) {
        var id = req.params.sid;
        dbconnection.query("Select * from ServiceOffers As S Join Customers As C on S.CustomerID=C.CustomerID Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID where ServiceOfferID=?", [id], function (err, srows) {
            if (err) {
                console.log(err);
            }
            //renders the details view when a service is selected
            res.render('pages/ServiceDetails', {loginuser: req.user.id, serviceresults: srows});
        });
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}
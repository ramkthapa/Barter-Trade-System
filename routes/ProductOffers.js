/**
 * Created by ESSEL on 20-Feb-15.
 */
module.exports=function(app,dbconnection){
    app.get('/ProductOffers/:pid', isLoggedIn, function (req, res) {
        //Get a selected offer details
        var id = req.params.pid;
        dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where ProductOfferID=?",[id],function(err,rows) {
            if (err) {
                console.log(err);
            }
            //renders the details view when a product is selected
            res.render('pages/ProductDetails', {results: rows, loginuser: req.user.id});
        });
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}
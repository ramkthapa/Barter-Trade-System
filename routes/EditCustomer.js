/**
 * Created by ESSEL on 06-Feb-15.
 */
module.exports = function(app,dbconnection) {
    app.get('/EditCustomer', isLoggedIn, function (req, res) {
        var CustomerID=req.user.id
        dbconnection.query("Select * from Customers where CustomerID='"+ CustomerID +"'",function(err,rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/EditCustomer',{result:rows});
        })
    });
    app.post('/EditCustomer',function(req,res){
        if (!req.files.myPhoto0) {
            var data = {
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                MiddleName: req.body.MiddleName,
                DateOfBirth: req.body.DOB,
                EmailAddress: req.body.email,
                Gender: req.body.Gender

            };
        } else {
            var data = {
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                MiddleName: req.body.MiddleName,
                DateOfBirth: req.body.DOB,
                EmailAddress: req.body.email,
                Gender: req.body.Gender,
                ProfilePicture: req.files.myPhoto0.name

            };
        }

    dbconnection.query("UPDATE customers set ? WHERE CustomerID = ? ",[data,req.user.id], function(err, rows)
    {
        if (err){
            console.log("Error Updating : %s ",err );
        }
        //save activity log
        AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Updated your account personal data:',ActivityDateTime:new Date()});
        res.redirect('/profile');

    });
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

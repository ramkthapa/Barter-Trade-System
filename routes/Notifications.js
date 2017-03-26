/**
 * Created by ESSEL on 16-Dec-14.
 */
module.exports = function (app, myio,dbconnection) {
    //get all notifications for the customer within a particular period
    app.get('/Notifications', isLoggedIn, function (req, res) {
       // CurrentUserID=req.user.id;
        //Get all notification from the last month into a table or div container for the customers to read
        var Details,NoteDate;
        var startDate=new Date();
        var endDate=new Date();
        startDate.setMonth(startDate.getMonth()-1)
        dbconnection.query('Select * from Notifications AS N Join Customers As C on C.CustomerID=N.CustomerID  where N.ToCustomerID=? and NotificationDate between ? and ?',[req.user.id,startDate,endDate],function(err,rows){
            if(err) throw err
            res.render('pages/Notifications',{NDetails:rows});
        })
    });
    app.get('/notify', isLoggedIn,function (req, res) {
       var startDate=new Date();
        var endDate=new Date();
        startDate.setTime(startDate.getTime()-1200000)
        dbconnection.query('SELECT Concat(FirstName," ",LastName," ",MiddleName) As FullName,NotificationDetails,NotificationDate from Customers As C Join Notifications As N on C.CustomerID=N.CustomerID where (N.ToCustomerID=? and FlagAsShown=? )and NotificationDate between ? and ?',[req.user.id,'0', startDate,endDate] , function (err, rows) {
            if (err) throw err;
            if(rows.length){
                var name,details,date;
                for (i = 0; i < rows.length; i++) {
                    name=(rows[i].FullName);
                    details=(rows[i].NotificationDetails)
                    date=(rows[i].NotificationDate)
                }
            }
            //update the noification table setting the first message to show as shown giving room for the next within the time
            dbconnection.query('Update Notifications Set FlagAsShown="'+ 1 +'" where(ToCustomerID=? and FlagAsShown=?) and  NotificationDate between ? and ?',[req.user.id,'0', startDate,endDate] ,function(err,rows){
                if(err) throw err
                if(rows){console.log('flag as shown');}

            })
             res.send({Name:name,Details:details,Date:new Date(date).toLocaleDateString()});
            console.log(JSON.stringify(name));

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
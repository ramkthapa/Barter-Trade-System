/**
 * Created by ESSEL on 07-Feb-15.
 */
module.exports = function(app, dbconnection,AddNotification,SaveActivity) {

    app.get('/MyFriendList', isLoggedIn, function (req, res) {
        dbconnection.query("Select * from FriendsList As F Join Customers As C on C.CustomerID=F.FriendID where F.CustomerID=? and Initiator !=? ", [req.user.id, 1], function (err, Rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
        res.render('pages/MyFriendList', {data: Rows});
        })
    });
    app.get('/MyFriendList/:id',function(req,res){
        var fid = req.params.id;
        var customerid = req.user.id
        dbconnection.query("DELETE FROM FriendsList  WHERE  CustomerID=? and FriendID=?", [customerid, fid], function (err, rows) {
            if (err) {
                console.log("Error deleting : %s ", err);
            }
            dbconnection.query("DELETE FROM FriendsList  WHERE  CustomerID=? and FriendID=?", [fid, customerid], function (err, rows) {
                if (err) {
                    console.log("Error deleting : %s ", err);
                }
                //save activity log
                SaveActivity(PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Removed a friend from your trade Friend list:',
                    ActivityDateTime: new Date()
                });
                res.redirect('/MyFriendList');
            });
        });
    })
    app.get('/AcceptFriend/:id',function(req,res){
        var CusID, FriendID;
        var fid = req.params.id;
        var customerid = req.user.id;
        // console.log(friendid);
        var Add={
            Status: '1',
            Initiator: 0
        };
        dbconnection.query("Update FriendsList Set?  WHERE CustomerID=? and FriendID=?", [Add, customerid, fid], function (err)
        {
            if(err){
                console.log("Error deleting : %s ",err);
            }
            console.log("Requested accepted : %s ", err);
        });
        //interchange the friendID's because A become B's friend and B becomes A's friend as well
        dbconnection.query("Update FriendsList Set?  WHERE CustomerID=? and FriendID=?", [Add, fid, customerid], function (err) {
            if (err) {
                console.log("Error deleting : %s ", err);
            }
            console.log("Requested accepted : %s ", err);
        });
        /* //for getting friend's A ID based on Friend B
         dbconnection.query('Select CustomerID from FriendsList where FriendID=?',[fid],function(error,rows){
            if(error) throw error
                if(rows){
                    for (var i in rows){
         CusID=rows[i].CustomerID
                    }
                }
         //for getting friend's A ID based on Friend B
         dbconnection.query('Select FriendID from FriendsList where CustomerID=?',[customerid],function(error,rows){
         if(error) throw error
         if(rows){
         for (var i in rows){
         FriendID=rows[i].FriendID
         }
         }*/
        var PostNotify1 = {
            CustomerID: req.user.id,
            NotificationDetails: 'Accepted your friend request. You can now trade with him/her',
            FlagAsShown: '0',
            ToCustomerID: fid,
            NotificationDate: new Date()
        };
        var PostNotify2 = {
            CustomerID: fid,
            NotificationDetails: 'Accepted a friend request. You can now trade with him/her',
            FlagAsShown: '0',
            ToCustomerID: req.user.id,
            NotificationDate: new Date()
        }
        AddNotification(PostNotify1);
        AddNotification(PostNotify2);

            console.log('Accepted Friend');
            //save activity log
        var PostActivity = {
            CustomerID: req.user.id,
            ActivityName: 'Accepted friend request:',
            ActivityDateTime: new Date()
        }
        SaveActivity(PostActivity);
            res.redirect('/MyFriendList');
    });

    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }

};
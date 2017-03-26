/**
 * Created by ESSEL on 12/10/2014.
 */
module.exports = function(app,myio,dbconnection,AddNotification,SaveActivity) {
//   GET home page.
    app.get('/FriendRequest', isLoggedIn, function (req, res) {
            res.render('pages/FriendRequest')
    })
    app.get('/search', function (req, res) {
        dbconnection.query('SELECT FirstName,LastName,MiddleName from customers where FirstName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].FirstName+' '+rows[i].LastName+' '+rows[i].MiddleName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    });
    app.post('/FriendRequest', function (req, res) {
        var LogincustomerID = req.user.id;
        var SelectCustomerID;
        var InvitePost = {
            Customer: req.body.typeahead
        }
        dbconnection.query('select CustomerID from Customers where CONCAT(FirstName," ",LastName," ",MiddleName)=?', [InvitePost.Customer], function (errs, results) {
            if (errs) throw errs
            if (results) {
                for (var a in results) {
                    SelectCustomerID = results[a].CustomerID,
                        console.log('Selected CustomerID', SelectCustomerID);
                }
            }
            dbconnection.query('select FriendID from FriendsList where CustomerID=? and FriendID=?', [LogincustomerID, SelectCustomerID], function (errs, rows) {
                if (errs) throw errs
                if (rows.length>0) {
                    console.log('total records'+rows.length);
                    res.send('You already have him/her as a Friend');
                    return;
                }
                if (req.user.id == SelectCustomerID) {
                    console.log("cannot request yourself");
                    res.send("Sorry !,Please you cannot add yourself");
                    return;
                }
                var AddFriends1 = {
                    CustomerID: LogincustomerID,
                    FriendID: SelectCustomerID,
                    DateAdded: new Date,
                    RequestDate: new Date,
                    Status: 0,
                    Initiator: 1
                }
                var AddFriends2 = {
                    CustomerID: SelectCustomerID,
                    FriendID: LogincustomerID,
                    DateAdded: new Date,
                    RequestDate: new Date,
                    Status: 0,
                    Initiator: 0
                }
                saveData(AddFriends1);
                saveData(AddFriends2);
                //save activity log
                SaveActivity(PostActivity={CustomerID:LogincustomerID,ActivityName:'Sent a friend request to: '+req.body.typeahead,ActivityDateTime:new Date()})
                //Notify friend
                AddNotification(PostNotify={
                    CustomerID:req.user.id,
                    NotificationDetails:'sent you a friend request',
                    FlagAsShown:'0',
                    ToCustomerID:SelectCustomerID,
                    NotificationDate:new Date()

                })
                res.redirect('/');
            });
        });
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
    function saveData(FList){
        dbconnection.query('Insert  into FriendsList set? ', [FList], function (err) {
            if (err) throw err
            console.log('Request Sent');
        })
    }
}
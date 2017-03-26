/**
 * Created by ESSEL on 12/7/2014.
 */
module.exports = function(app,dbconnection,transporter,AddNotification,SaveActivity) {
//   GET home page.
    app.get('/GroupMembers', isLoggedIn, function (req, res) {
        var LogincustomerID=req.user.id;
        var GroupName=[];
        var Count=0;
        dbconnection.query("Select * from Groups where CustomerID=?",[LogincustomerID], function (err, rows) {

                if (err) {console.log('Error',err);}
                if(rows){
                    for(var i in rows){
                        GroupName[i]=rows[i].GroupName;
                    }
                    console.log(GroupName);
                }
            res.render('pages/AddGroupMembers',{YourGroups:GroupName});
            });
    });
    app.get('/searchgroup', function (req, res) {
        dbconnection.query("Select C.CustomerID,FirstName,LastName,MiddleName from Customers As C Join FriendsList As FL on C.CustomerID=FL.FriendID where Status='1' and FirstName like '%" + req.query.key + "%' and FL.CustomerID=?",[req.user.id], function (err, rows) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].FirstName+' '+rows[i].LastName+' '+rows[i].MiddleName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    })
    app.post('/GroupMembers',function(req,res){

        var FriendID,GID,FriendEmail;
        var PostData={
            GroupName:req.body.GroupName,
            FriendName:req.body.typeahead
        }
        dbconnection.query('select GroupID from Groups where GroupName=?',[PostData.GroupName],function(errs,results) {
            if (errs) {
                console.log(errs);
            }
            if (results) {
                for (var a in results) {
                    GID = results[a].GroupID;
                    console.log('GroupID', GID);
                }
            }
            dbconnection.query('select CustomerID,EmailAddress from Customers where CONCAT(FirstName," ",LastName," ",MiddleName)=?',[PostData.FriendName],function(err,rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var k in rows) {
                        FriendID= rows[k].CustomerID;
                        FriendEmail=rows[k].EmailAddress;
                        console.log('Customer is', FriendID);
                    }
                }
                var GroupData = {
                    GroupID: GID,
                    MemberID: FriendID,
                    Joined: new Date()
                }
                //check if friend is not already added to selected group
                dbconnection.query('Select GroupMembersID from GroupMembers where GroupID=? and MemberID=?', [GID, FriendID], function (errs, rows) {
                    if (errs) throw errs;
                    if (rows.length > 0) {

                        res.send("You have already added friend in the selected group");
                        return;
                    } else {
                        AddGroupMember(GroupData);
                        // setup e-mail data with unicode symbols
                        var mailOptions = {
                            from: 'B-Commerce <adjeiessel@gmail.com',
                            to: FriendEmail, // list of receivers
                            subject: 'Added to Group', // Subject line
                            html: '<br> Hello '+PostData.FriendName +',<br> Your friend <b>'+ req.user.FN +'</b> has added you their group: <b>' +PostData.GroupName +'</b>.You can now trade with friends within the group<br><br> Thank you<br><br>Barter Trading Team '// plaintext body

                        };
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Message sent:');
                            }
                        });
                        //save activity log
                        SaveActivity(PostActivity={CustomerID:req.user.id,ActivityName:'Added a friend: '+PostData.FriendName +' :to your group: '+PostData.GroupName,ActivityDateTime:new Date()});
                        //Add notification
                        AddNotification(PostNotify={
                            CustomerID:req.user.id,
                            NotificationDetails:'Add you to a group',
                            FlagAsShown:'0',
                            ToCustomerID:FriendID,
                            NotificationDate:new Date()

                        })
                    }
                    res.redirect('/');
                })
            })
        })
    })

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/logins');
    }
    function AddGroupMember(GData){
        dbconnection.query('Insert  into GroupMembers set? ', [GData], function (err, rows) {
            if (err) throw err;
            console.log('Saved Successfully');
        })
    }

}
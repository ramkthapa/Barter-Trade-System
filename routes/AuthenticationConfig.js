var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
module.exports = function (passport, dbconnection) {
    var CID;
    passport.serializeUser(function(user, done) {
        // use the user ID returned from the db to serialize to the session to create
        // a session ID, so user.id will return the customer ID
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        //Here we deserialize the users by getting the ID from the db
        dbconnection.query("Select * from Customers where CustomerID='"+ id +"'",function(err,rows){
            var cusID,Cususername,Gender,DateJoined,EAddress,Reputation;
            if(rows) {
                for (var i in rows) {
                    cusID = rows[i].CustomerID;
                    Cususername = rows[i].UserName;
                    FullName= rows[i].FirstName + " " + rows[i].LastName + " " + rows[i].MiddleName;
                }
            }

                // all is well, return successful user
            done(err, {id:cusID, name:Cususername,FN:FullName});
        });
    });
    passport.use('UserLogin',new LocalStrategy({
            usernameField:'username',
            passwordField:'password',
            passReqToCallback:true
    },
        function (req, username, password, done) {
            var hashpassword;
            var fullname;
            dbconnection.query("select * from customers where EmailAddress=? or UserName=?", [username,username], function (err, rows) {
                if (err)
                    return done(err, false, console.log( err));
                if (!rows.length <= 0)
                {
                    for (var i in rows) {
                        CID = rows[i].CustomerID;
                        hashpassword = rows[i].Password;
                        fullname = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
                    }
                    bcrypt.compare(password, hashpassword, function (err, hashmatch) {
                        if (hashmatch) {
                            //update login status when user login
                            UpdateLoginStatus();
                            AddActivityLog(PostActivity={CustomerID:CID,ActivityName:'Logged into system:',ActivityDateTime:new Date()})
                            return done(null, {id: CID});
                            //all is well, return successful user
                            //return an object of customerID  which is passed to serialize
                            //update the customer table setting loginStatus as 1
                            //save activity log

                        } else {
                            return done(null, false);
                        }
                    })
                }
                else {
                    return done(null, false);
                }

            });
        }));

    passport.use('UserSignUp',new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
        function(req,username,password,done) {
        dbconnection.query("select * from Customers where EmailAddress=? or UserName=?",[username,username], function (err, rows) {
            if (err)
                return done(err, false, console.log( err));
            if (rows.length) {
                return done(null, false);
            } else {
                // if there is no user with that email
                // create the user
                var postCustomerData = {
                    //note the firstname: represents the column names in the database and the
                    // req.body.firstname represents the html attributes names
                    FirstName: req.body.FirstName,
                    LastName: req.body.LastName,
                    MiddleName: req.body.MiddleName,
                    DateOfBirth: req.body.DOB,
                    EmailAddress: req.body.username,
                    Gender: req.body.sex,
                    username: req.body.username,
                    password:bcrypt.hashSync(req.body.password, 11),
                    DateJoined: new Date(),
                    ProfilePicture:req.files.myPhoto0.name
                };
                /*var newUserMysql = new Object();
                 newUserMysql.email    = email;
                 newUserMysql.password = password; // use the generateHash function in our user model*/
                dbconnection.query("INSERT INTO customers set ? ", postCustomerData, function (err, rows) {
                    if (!err) {
                        console.log('Saved Successfully');
                        //save activity log
                        AddActivityLog(PostActivity={CustomerID:rows.insertId,ActivityName:'Joined Barter trading;created account:',ActivityDateTime:new Date()})
                        //get id for serialization
                        postCustomerData.id=rows.insertId;
                        return done(null, postCustomerData);
                    }
                    else {
                        console.log("Error inserting : %s ", err);
                        done(null, false);
                    }

                });
            }
        });
        }));
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
    function UpdateLoginStatus(){
        var Status={
          LoginStatus:1
        };
        dbconnection.query("update Customers set ? where CustomerID=?", [Status,CID], function (err) {
            if(err){
                console.log("Error Selecting : %s ",err );
            }
            })
    }

};



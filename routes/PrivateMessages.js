module.exports = function(app,dbconnection,transporter) {
    //Loads the message vuew
    app.get('/PrivateMessages', isLoggedIn, function (req, res) {
        res.render('pages/Messages', {Email: '', Name: ''});
    });
    //search for customer
    app.get('/searchcustomer', isLoggedIn, function (req, res) {
        //Search for customer
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
    //perform ajax search of customer email through customer name
    app.get('/searchemail', isLoggedIn, function (req, res) {
    dbconnection.query('SELECT EmailAddress from customers where Concat(FirstName," ",LastName," ",MiddleName)=?' ,[ req.query.name], function (err, rows) {
    if (err) throw err;
    var emaildata = [];
    for (i = 0; i < rows.length; i++) {
      emaildata.push(rows[i].EmailAddress);
    }
    var email=JSON.stringify(emaildata);
    res.send(JSON.parse(email));
    console.log(JSON.stringify(emaildata));
  });
    });
    //send message itself
    app.get('/sendmessages', isLoggedIn, function (req, res) {
    // setup e-mail data with unicode symbols
        //check if the mail is through a neaby trade with a link or just a mail
        if (req.query.html) {
            //Send html body mail with links that's for NearBy Customers
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: req.query.to, // list of receivers
                subject: req.query.subject, // Subject line
                html: req.query.text + '<br>' + '<a href="' + req.query.html + '">Check Offer:From Customer Near By</a>' +
                '<br><br>Thank you!<br>Barter Trading Team </br>'
            };
        } else {
            //Send plaintext mail without links
            var mailOptions = {
                from: 'B-Commerce <adjeiessel@gmail.com',
                to: req.query.to, // list of receivers
                subject: req.query.subject, // Subject line
                html: req.query.text + '<br>' + '<br><br>Thank you!<br>Barter Trading Team </br>'// plaintext body
            };
        }
// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
          res.send('sent');
        console.log('Message sent:');
      }
    });

  });
    //for getting customer who posted a product
    app.get('/PrivateMessages/:id', isLoggedIn, function (req, res) {
        //Contact customer who posted the product
        var productID = req.params.id;
      dbconnection.query('SELECT EmailAddress,FirstName,LastName,MiddleName from Customers As C Join ProductOffers As P on C.CustomerID=P.CustomerID Where ProductOfferID=?', [productID], function (err, rows) {
      if (err) throw err;
      var emaildata,name;
      for (i = 0; i < rows.length; i++) {
        emaildata=(rows[i].EmailAddress);
          name = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
      }
          res.render('pages/ContactMessages', {Email: emaildata, Name: name});
    });
  });
    //for getting customer nearby
    app.get('/Messages/:id', isLoggedIn, function (req, res) {
        //Contact customer NearBy your location
        var CusID = req.params.id;
        dbconnection.query('SELECT EmailAddress,FirstName,LastName,MiddleName from Customers Where CustomerID=?', [CusID], function (err, rows) {
            if (err) throw err;
            var emaildata, name;
            for (i = 0; i < rows.length; i++) {
                emaildata = (rows[i].EmailAddress);
                name = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
            }
            res.render('pages/NearByMessages', {Email: emaildata, Name: name});
        });
    });
    //get customer who posted the service
    app.get('/ServiceMessages/:id', isLoggedIn, function (req, res) {
        //Contact customer who posted service
        var serviceID = req.params.id;
        dbconnection.query('SELECT EmailAddress,FirstName,LastName,MiddleName from Customers As C Join ServiceOffers As S on C.CustomerID=S.CustomerID Where ServiceOfferID=?', [serviceID], function (err, rows) {
            if (err) throw err;
            var emaildata, name;
            for (i = 0; i < rows.length; i++) {
                emaildata = (rows[i].EmailAddress);
                name = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
            }
            res.render('pages/Messages', {Email: emaildata, Name: name});
        });
    });
    //get the product ID and perpare a link for sending email
    app.get('/searchproductID', isLoggedIn, function (req, res) {

        dbconnection.query('SELECT ProductOfferID from ProductOffers where ProductName=?', [req.query.name], function (err, rows) {
            if (err) throw err;
            var productdata = [];
            for (var i = 0; i < rows.length; i++) {
                productdata.push(rows[i].ProductOfferID);
            }
            var productID = JSON.stringify(productdata);
            res.send(JSON.parse(productID));
            console.log(JSON.stringify(productID));
        });
    });
    //Get the serviceId for preparing a link for sending email
    app.get('/searchserviceID', isLoggedIn, function (req, res) {

        dbconnection.query('SELECT ServiceOfferID from ServiceOffers where ServiceName=?', [req.query.name], function (err, rows) {
            if (err) throw err;
            var servicedata = [];
            for (var i = 0; i < rows.length; i++) {
                servicedata.push(rows[i].ServiceOfferID);
            }
            var serviceID = JSON.stringify(servicedata);
            res.send(JSON.parse(serviceID));
            console.log(JSON.stringify(serviceID));
        });
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
};


module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/', function (req, res) {

    res.render('pages/PartnerReputation');
  });
}


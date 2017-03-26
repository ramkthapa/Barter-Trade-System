/**
 * Created by ESSEL on 12-Feb-15.
 */
module.exports = function(app, passport) {
app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
   res.render('pages/signup.ejs');
});
app.post('/signup', passport.authenticate('UserSignUp', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages

}));
};
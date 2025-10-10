const express = require('express');
const mysql = require("mysql");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const flash = require('express-flash');
const router = express.Router();


const app = express();





// connection to remote database "Heroku"
var connection = mysql.createConnection({
port:'3306',
host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user: 'xg5zu6ft9vcegj1i',
password: 'u7ulq2hmz6797r5n',
database:'rkycf99cdfosu3q0',

});

// session
app.use(cookieParser('SecretStringForCookies'));
app.use(flash())
app.use(session ({
secret:'SecretStringForCookies',
resave:true,
saveUninitialized:true,
cookie: {
maxAge: 24 * 60 * 60 * 1000,
resave:true,
saveUninitialized:true
}
}));
app.use(passport.authenticate('session'));


const bcrypt = require('bcrypt');

 router.post("/login", passport.authenticate("local", {
    successRedirect: "home",
    failureRedirect: "login",
    failureFlash: true

 }


 ));
passport.use(new LocalStrategy(async function verify(username, password, cb) {
    
   

    try {await connection.query('SELECT * FROM externalUsers WHERE username = ?', [username], (error, results) => {
         const wrongPassword = "Password is Incorrect"
        const noAccountFound = "No account was found"
    

        if(error) {
   
           console.log(error);
       }
   
       if(results.length > 0) {
        const user = results[0];
       const storedPassword = results[0].password;
       
       bcrypt.compare(password, storedPassword,(err, results) => {
       if (err) {
           console.log("Error comparing password", err);
       }
       else {
           if (results) {
              return cb(null, user);
              
           } else {
            
           
             return cb(null, false, { message: 'Incorrect username or password.' });
           }
       }

       });    
       } else {
       
        //  return cb({message:'No user found.'});
         return cb(null, false, { message: 'User not found.' });
        
       }})}
       catch (err) {
        return cb(err);
    }
    

               
      

passport.serializeUser((user, cb) =>{
cb(null, user)
});

passport.deserializeUser((user, cb) =>{
    cb(null, user)
    });
           
 }));


 //======================================log out ======================================
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) console.error(err);
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/login');
    });
  });
});



    module.exports = router;



    
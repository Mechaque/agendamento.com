var createError = require('http-errors');
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
const bodyParser = require("body-parser");
const { fileURLToPath }= require("url") ;
const mysql = require("mysql");
const passport = require("passport");
const { request } = require("http");
const pkg = require('passport-local');
const {Strategy, strategy} = pkg;
const app = express();
var router = express.Router();

//==============================Database connection==========================================

const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var connection = mysql.createConnection({
port:'3306',
host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user: 'xg5zu6ft9vcegj1i',
password: 'u7ulq2hmz6797r5n',
database:'rkycf99cdfosu3q0',
timeout: 10000 // 10 seconds

});


//========================Laboratories ======================================

router.get("/searchLab", (req, res) => {
      if (req.isAuthenticated()) {

  const sql = "SELECT * FROM laboratories";

        connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
         console.log(results);

         res.render('labList.ejs', {appointment: results});
    });
   } else {

        res.redirect('login')
    }

})
//============================lab test history===========================
router.get("/appointmentHistory",async (req, res) =>{
    if (req.isAuthenticated()) {
        var authenticatedUser = req.user.phoneNumber;

        // console.log(model);

        try {
        await connection.query('SELECT * FROM appointment where phoneNumber = ?', [authenticatedUser] ,function(error, result){
            
            if (error) console.log(error);
        // console.log(result);
        res.render('appointmentHistory.ejs', {appointment: result});
    });
    } catch (err) {
        console.log(err);
    }
    
}
else {
    res.redirect('login')

}

        });
//============================================lab test request =====================================
router.get('/labTestRequest', (req, res)=> {

    res.render('labTestRequest.ejs')
})

//==============================================lab testing history====================================

router.get('/labHistory', async(req, res)=> {
    if (req.isAuthenticated()) {

        var authenticatedUser = req.user.userID;
        var model = authenticatedUser.slice(0, 7);

   await connection.query('SELECT * FROM externalUsers',function(error, result){
            
            if (error) console.log(error);
         let lastUser = result[result.length - 1];
         let lastUser1 = lastUser.userID;
         let model1 = lastUser1.slice(0, 7);
         str = lastUser1.substring(7, lastUser1.length );
         var str1 = parseInt(str,10);
         str1 ++;
        var externalID = model1 + str1;
        console.log(externalID);
    });





   
   
     
    
    






     res.render('labTestHistory.ejs')

    } else {


        res.redirect('login')
    }


   
})







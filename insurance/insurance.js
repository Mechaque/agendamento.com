const express = require("express");
const mysql = require("mysql");
const app = express();
const bcrypt = require('bcrypt');
var router = express.Router();

//===============================================import database connection================================================================
var connection = mysql.createConnection({
port:'3306',
host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user: 'xg5zu6ft9vcegj1i',
password: 'u7ulq2hmz6797r5n',
database:'rkycf99cdfosu3q0',
timeout: 10000 // 10 seconds

});
//====================================Insurance home page=====================================

router.get('/insurance', (req,res) => {
      res.render('insurance.ejs');

    })
 //======================================Insurance login page =====================================
 router.get('/insuranceLogin', (req,res) => {
    res.render('insuranceLogin.ejs');
})

router.post('/Logins', async(req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
    const CheckInfo = await connection.query('SELECT * FROM users WHERE username =?',[username], (error, results)=> {

        if (results.length > 0) {
            const user = results[0];
            const storedPassword = results.password;
    
        bcrypt.compare(password, storedPassword,(error, results) =>{
            if (error) {
                console.log("error with comparing", error);
            } else {
               if(results){
                res.render("insurance.ejs");
               } else {

                res.send("wrong password");
               }
            }
        });
            
        } else {
    
            res.send("No users");
        }

    });
} catch (error) {

    console.log(error);
}
   
    // res.render('insuranceLogin.ejs');
})
//====================================== Submeter Claim ============================================================
router.get('/insuranceClaim', (req,res) => {
    res.render('insuranceClaim.ejs');

})
//=======================================Portal Route
router.get('/insurancePortal', (req,res)=>{
    let  sql = "select * from Claims";
        let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        
        res.render('insurancePortal.ejs', {Claims: rows});
        console.log(rows);
        
        });

   
})
//======================================Post Claim=============================
router.post('/claimForm', (req,res)=>{
    const {fname, email, clinicID, policy, claimType} = req.body;
    // res.render('insurancePortal.ejs');

    let temp = "clinfaadm0";
    var sql = "INSERT INTO Claims (fullName,email,clinicID,typeOfPolice,policeNumber,documents,description)\
     VALUES ('"+ req.body.fname+"', '"+ req.body.email+"','"+ req.body.clinicID+"','"+ req.body.typeOfPolice+"','"+ req.body.policeNumber+"','"+ temp +"','"+ req.body.description+"')";
    connection.query(sql, function (err, rows, fields){
    
    if (err) throw err
    res.redirect('/insurancePortal');
    });
    
    console.log(fname);
    console.log(email);
    console.log(clinicID);
    console.log(policy);
    console.log(claimType);
})


router.get('/viewClaim', (req,res) => {
    
    let sql = "select * from Claims where claimID = ?;";
                var id = req.query.claimID;

            let query = connection.query(sql,[id], (err, result) => {
            if(err) throw err;
            let data = result[0];
           // console.log(data);
            let name = data.fname;
            res.render('viewClaim.ejs', {data: data});
            console.log(name);

});
});



module.exports = router;

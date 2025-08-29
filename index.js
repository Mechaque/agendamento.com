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


var authRouter = require('./routes/auth/auth');

//===========================================passport config ================
// const flash = require('express-flash');
const flash = require("connect-flash");




// session

app.use(session ({
secret:'SecretStringForCookies',
resave:false,
saveUninitialized:false,
cookie: {
//maxAge: 24 * 60 * 60 * 1000
}
}));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());

//const __dirname =dirname(fileURLToPath(import.meta.url));

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


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine" , "ejs");
app.use(express.static("public"));
app.timeout = 300000;


const publicDirectory = path.join(__dirname, './public');
// parse URL-encoded bodies . (as sent by HTML forms)
app.use(express.urlencoded({extended:false}));
//app.use(express.json);

app.use('/', require('./routes/auth/auth'));


// make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
// ---------------- Main Page ----------------
app.get("/", (req, res) => {
  res.render("front.ejs");
});

//================================================== Clinic per province==================================
  app.post('/provClinic', async(req, res)=>{
     if (req.isAuthenticated()) {
    
         let sql = "SELECT * FROM clinics    WHERE province = ?;";

                     var id = req.body.provName;
                try {
                 let query = await connection.query(sql,[id], (err, result) => {
                 if(err) console.log(err);
                 let data = result;
                 let name = result.clinicName;
           
                //  res.render('addAppointment.ejs');
                  res.render('clinicList.ejs',{appointment: result});
               
               console.log(name);
                
     
     });} catch (err) {
        console.log(err);o
     }
     
        } else {

        res.redirect('login')
    }


    })
//==================================== View details of theSelected Clinic ==========================================

app.get('/viewCliList', async(req,res) => {
    if (req.isAuthenticated()) {
    let sql = "select * from clinics where clinicID = ?;";
                var id = req.query.clinicID;
                var clinicName = req.query.clinicName;
                console.log(id);
            try {
            let query = await connection.query(sql,[id], (err, result) => {
            if(err) console.log(err);
            var clname = result[0].clinicName;
            var claddress = result[0].clinicAddress;
            var provincia = result[0].province;

           

            
        res.render('doctorsList.ejs', {appointment:result,clname,claddress,provincia});

           console.log(id);

});} catch (err) {
    console.log(err);
}
   } else {

        res.redirect('login')
    }
});

//===================================Doctors of the selected doctors==========================================

app.get('/doctorsProfile', async(req,res) => {

    if (req.isAuthenticated()) {
    var id = req.query.doctoreID;
    

    const today = new Date();
    const formattedDate = today.toISOString().substring(0, 10);
    var date = formattedDate;
    
    
    const sql = "SELECT * FROM doctors WHERE doctoreID = ?";

        connection.query(sql, [id], function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
        // `results` will be an array, where each element corresponds to the result of one statement.
        var docFName = results[0].fname;
        var docLName = results[0].lname;
        var speciality = results[0].speciality;
        var email = results[0].email;
        console.log('Result of first query:', results);
        console.log(docFName);
          console.log(docLName);
        console.log(date);
        

         res.render('doctorsProfile.ejs', {appointment:results,docFName,docLName,speciality,id,date,email});
    });
   
      } else {

        res.redirect('login')
    }
 
});

//=============================view doctors list from selected clinic===========================================

app.get("/viewDocList", (req, res) =>{
     if (req.isAuthenticated()) {

    const id = req.query.clinicID;

  const sql = "SELECT * FROM doctors WHERE clinics = ?";

        connection.query(sql, [id], function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
//         // `results` will be an array, where each element corresponds to the result of one statement.
        
//         console.log(id);
         console.log(results);

        

         res.render('doctorsList_2 - Copy.ejs', {appointment: results});
    });
   } else {

        res.redirect('login')
    }

})

//=================================================To view the Booking page==========================
app.get("/appointmentBooking", async (req, res) => {

     if (req.isAuthenticated()) {
             const id = req.query.clinicID;
            let authenticatedUser = req.user.username;
    
    try {
    
    await connection.query('SELECT * FROM externalUsers WHERE username = ?', [authenticatedUser], (error, results) => {
    if(error) {
    console.log(error);
    }
    if (results.length > 0){
     const sql = "SELECT * FROM clinics WHERE clinicID = ?";
    connection.query(sql, [id], function (err,result){
        const name = results[0].fname;
        const lname = results[0].lastName;
        const email = results[0].username;
        const telephone = results[0].phoneNumber;
        const clname = result[0].clinicName;
        const clID = result[0].clinicID;

      res.render('reviewAppointment.ejs',{clname,lname,name,email,telephone,clID})
    });
    }
    else {
        console.log("User not authenticated")
    }
    
    });
    
    }
    catch (err) {
    console.log(err);
    }} else {
            res.redirect('login')

        }
    
    });

 
//================================================Add Appointment============================================================
app.post('/addAppointment',
  
    async (req, res) =>{
        
        if (req.isAuthenticated()) {

            var authenticatedUser = req.user.phoneNumber;
        const {numeroDaClinica,fname,email,phoneNumber,appointmentDate,appointmentTime,reasonForVisit} = req.body;
    

            try {
        await connection.query('SELECT patientID FROM  patient WHERE phoneNumber = ?',[authenticatedUser], function  (error, results) {
            if(error) {
            console.log(error);
            }
            if (results.length > 0){
            
             var selectedUser = results[0].patientID;
             var model = selectedUser.slice(0, 6);
            
    
          connection.query('SELECT * FROM  appointment where appointmentID like ?',['%' + numeroDaClinica + '%'], function  (error, result) {
            if(error) {
            console.log(error);
            }
           
             var lastUser = result[result.length - 1].appointmentID;
             var model1 = lastUser.slice(0, 9);
             str = lastUser.substring(9, lastUser.length );
             var str1 = parseInt(str,10);
             str1 ++;
              var lastID = model1 + str1;
              console.log(model);
            console.log(selectedUser);
            console.log(lastID,fname,email,phoneNumber,appointmentDate,appointmentTime,reasonForVisit,selectedUser,numeroDaClinica);
            if(result.length > 0) {
        
                var dia = "2025-08-21";

          var sql = "INSERT INTO appointment (appointmentID,fname,appointmentDate,appointmentTime,reasonForVisit,phoneNumber)\
             VALUES ('"+lastID+"','"+ req.body.fname+"','"+dia+"','"+req.body.appointmentTime+"','"+req.body.reasonForVisit+"','"+req.body.phoneNumber+"')";
            connection.query(sql, function (err, rows, fields){
            
                console.log(rows);
            if (err) console.log(err)
           // req.flash('user',successfullReg);
            return res.redirect('/appointmentHistory');
            });
                console.log(result);
                console.log(lastID);

            }
            });
        
            } else {
              console.log(authenticatedUser);
                console.log("User not found");
             
            }
            
            });
            
            } catch (err) {
                console.log(err);
            }
        } else {
            res.redirect('login')

        }
        
});

//==================================================== Route to login page============================================================================
app.get("/login", (req, res) => {
  res.render("login", {
    success: req.flash("success"),
    error: req.flash("error")
  });
});

//================================================Home page after successful login=====================================
app.get('/home', (req,res) => {
    if (req.isAuthenticated()) {

         res.render('portal.ejs')

    } else {

        res.redirect('login')
    }
    
       
    });

//=====================================================================Users Profile Route==================================

app.get('/userProfile', (req,res) => {
    if (req.isAuthenticated()) {

         res.render('userProfile.ejs')

    } else {

        res.redirect('login')
    }
    
       
    });
//=========================================Route to the insurance page ===============================================

app.get("/insurance", (req, res) =>{

    res.render('insurance1.ejs')

})

//========================================================Appointment Router=======================================
app.get("/appointment", (req, res) =>{
if (req.isAuthenticated()) {
    res.render('appointments.ejs')

    } else {

        res.redirect('login')
    }
    

})

//============================================ laboratories route =============================================
app.get("/laboratory", (req, res) =>{

    res.render('laboratories.ejs')

})
//==============================================appointment history route=====================================
app.get("/appointmentHistory",async (req, res) =>{
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





//==========================registration page =========================================
app.post("/registration", async (req, res) => {
  const { fname, lname, username, password, passwordConfirm, phoneNumber } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const dupplicateMessage = "That email is already registered, try logging in.";
  const passwordMisMatch = "Passwords do not match!";
  const successfullReg = "✅ You have successfully registered, you can login now.";

  try {
    connection.query("SELECT username FROM externalUsers WHERE username = ?", [username], (error, results) => {
      if (error) {
        console.log(error);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/registration");
      }

      if (results.length > 0) {
        req.flash("error", dupplicateMessage);
        return res.redirect("/registration");
      } else if (password !== passwordConfirm) {
        req.flash("error", passwordMisMatch);
        return res.redirect("/registration");
      } else {

        
   

        const sql = "INSERT INTO externalUsers (fname, lastName, phoneNumber, username, password) VALUES (?, ?, ?, ?, ?)";
        connection.query(sql, [fname, lname, phoneNumber, username, hashedPassword], (err) => {
          if (err) {
            console.log(err);
            req.flash("error", "Registration failed, please try again.");
            return res.redirect("/registration");
          }
          req.flash("success", successfullReg);
          return res.redirect("/login");
        });
      }
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Unexpected server error.");
    res.redirect("/registration");
  }
});

//========================Laboratories list of labs ======================================

app.get("/searchLab", (req, res) => {
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
app.get("/appointmentHistory",async (req, res) =>{
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
app.get('/labTestRequest', (req, res)=> {

    res.render('labTestRequest.ejs')
})

//==============================================lab testing history====================================

app.get('/labHistory', async(req, res)=> {
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

//==============================================appointment history route=====================================
app.get("/searchClinic", (req, res) =>{
if (req.isAuthenticated()) {
const sql = "SELECT * FROM clinics";

        connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
//         // `results` will be an array, where each element corresponds to the result of one statement.
        
//         console.log(id);
         console.log(results);

        

     res.render('searchClinic.ejs',{appointment: results})
    });
   
} else {

        res.redirect('login')
    }
})
//==============================================Registration page=================================
app.get("/registration", (req, res) => {
  res.render("registration", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
});

app.get('/change-date', (req, res) => {

    if (req.isAuthenticated()) {
  
  const { date, userID } = req.query;
  const selectedDate = date || new Date().toISOString().split('T')[0];
  const id = userID;
  
var data = date.toString();
 
 try {
    connection.query("SELECT * FROM doctors WHERE doctoreID = ?", [id], (error, results) => {
      if (error) {
        console.log(error);
       
      }

      if (results.length > 0) {
        var clinicID = results[0].clinics;
        var docFName = results[0].fname;
        var docLName = results[0].lname;
        var speciality = results[0].speciality;
        var email = results[0].email;
        var clinicID = results[0].clinics;
  

      const sql = "SELECT time FROM availableDays WHERE date = ?";

        connection.query(sql, [data], function(err, result) {
      if (result.length === 0) {
    var tempo = [];
    res.render('doctorAvaiability.ejs', { tempo, clinicID,docFName, speciality,docLName, email, id,data, message: "No Time available" });
} else {
    var tempo = result.map(r => r.time); // extract only the time field
    res.render('doctorAvaiability.ejs', { tempo, clinicID,docFName, speciality,docLName, email, id,data, message: null });
}
          
    });
       
      } else {
       
      }
    });
  } catch (err) {
    console.log(err);
  
  }
   
} else {

        res.redirect('login')
    }
});
//====================================appointment booking  Router==============================================================
 
app.post("/book-time", async(req, res) => {

 if (req.isAuthenticated()) {
 let authenticatedUser = req.user.username;
  const { doctorID, time, clinicID,date,docLName,docFName } = req.body;  

  if (!time) {
    return res.send("Please select a time!");
  }

try {
    
    await connection.query('SELECT * FROM externalUsers WHERE username = ?', [authenticatedUser], (error, results) => {
    if(error) {
    console.log(error);
    }
    if (results.length > 0){
     const sql = "SELECT * FROM clinics WHERE clinicID = ?";
    connection.query(sql, [clinicID], function (err,result){
        const name = results[0].fname;
        const lname = results[0].lastName;
        const email = results[0].username;
        const telephone = results[0].phoneNumber;
        const clname = result[0].clinicName;
        const clID = result[0].clinicID;
        console.log(time);
         console.log(docLName);

      res.render('reviewAppointmentPreferredDoctor.ejs',{clname,lname,name,email,telephone,clID,doctorID,time,date,docFName,docLName})
    });
    }
    else {
        console.log("User not authenticated")
    }
    
    });
    
    }
    catch (err) {
    console.log(err);
    }

  } else {
            res.redirect('login')

        }
});

//======================================= Insurance================================================================
app.get('/claimList', async(req, res)=>{
  if (req.isAuthenticated()) {
    let authenticatedUser = req.user.ID;
     let  sql = "select * from Claims";
    try {
    let query = await connection.query(sql, (err, rows) => {
        if(err) throw err;
        
        let clinica = rows[0].clinicID;
        
          res.render('insurancePortal.ejs',{Claims: rows});
        console.log(authenticatedUser);
        console.log(clinica);
        
        });
        } catch (err) {
            console.log(err)
        }
  } else 
{
    res.render('login.ejs');
}
 
})

app.get('/insuranceClaim', (req,res) => {
    res.render('insuranceClaim.ejs');

})

//=============================================Search Insurance =========================
app.get('/insuranceSearch', (req,res) => {
 if (req.isAuthenticated()) {

  const sql = "SELECT * FROM insurance";

        connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
         console.log(results);

         res.render('insuranceList.ejs', {appointment: results});
    });
   } else {

        res.redirect('login')
    }

})


// confirming that the server is running  on port 3000
app.listen(8000, () => {

console.log("Server running on port 8000");
});




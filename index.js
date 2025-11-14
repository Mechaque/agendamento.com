var createError = require('http-errors');
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
const multer = require('multer');
const bodyParser = require("body-parser");
const { fileURLToPath } = require("url");
const mysql = require("mysql");
const passport = require("passport");
const { request } = require("http");
const pkg = require('passport-local');
const { Strategy, strategy } = pkg;
const flash = require("connect-flash");
const i18n = require("i18n");  // ✅ i18n require

const app = express();

const claimsRouter = require('./routes/claims/claims.js');
app.use('/', claimsRouter);

// ===================== I18N CONFIGURATION =====================
i18n.configure({
    locales: ['en', 'fr', 'pt'],                  // Supported languages
    directory: path.join(__dirname, 'locales'),  // Translation files folder
    defaultLocale: 'en',                          // Default language
    cookie: 'lang',                               // Cookie name for language
    queryParameter: 'lang',                       // Optional: ?lang=fr
    autoReload: true,
    updateFiles: false,
    objectNotation: true
});

// ================== SESSION & AUTH ==================
app.use(cookieParser());
app.use(session({
  secret: 'SecretStringForCookies',
  resave: false,
  saveUninitialized: false,
  cookie: {}
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// ================== I18N MIDDLEWARE ==================
// Initialize i18n
app.use(i18n.init);

// ✅ Make translation helper `t()` available in all EJS views
// Make __ available in all EJS templates
app.use((req, res, next) => {
  res.locals.__ = res.__;
  next();
});


// ================== LANGUAGE SWITCH ROUTE ==================
app.get('/switch-lang/:lang', (req, res) => {
    const lang = req.params.lang;

    // Store chosen language in cookie
    res.cookie('lang', lang, { maxAge: 30*24*60*60*1000, httpOnly: false, sameSite: 'Lax' });

    // Set language for current request
    res.setLocale(lang);

    // Redirect back to previous page
    const backURL = req.get('Referer') || '/';
    res.redirect(backURL);
});

// ================== DATABASE ==================
var connection = mysql.createConnection({
  port: '3306',
  host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'xg5zu6ft9vcegj1i',
  password: 'u7ulq2hmz6797r5n',
  database: 'rkycf99cdfosu3q0',
  timeout: 10000
});

// ================== APP SETTINGS ===================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.set("view engine", "ejs");

// Flash messages globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Prevent browser caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Ensure Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// ================== ROUTES ==================
app.use('/', require('./routes/auth/auth'));

// ---------------- Main Page ----------------
app.get("/", (req, res) => {
  console.log("🌍 Active locale:", req.getLocale());
  res.render('front.ejs');
});


//================================================== Clinic per province==================================
  app.post('/provClinic', ensureAuthenticated,  async(req, res)=>{
    
    
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
     


    })
//==================================== View details of theSelected Clinic ==========================================

app.get('/viewCliList',ensureAuthenticated,  async(req,res) => {
    
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
});

//===================================Doctors of the selected doctors==========================================
app.get('/doctorsProfile', ensureAuthenticated, (req, res) => {
  var id = req.query.doctoreID;

  const today = new Date();
  const formattedDate = today.toISOString().substring(0, 10);

  const sql = "SELECT * FROM doctors WHERE doctoreID = ?";
  connection.query(sql, [id], function (err, results) {
    if (err) {
      console.error('Error executing query:', err);
      return res.sendStatus(500);
    }

    if (results.length === 0) {
      return res.send("No doctor found with that ID.");
    }

    var docFName = results[0].fname;
    var docLName = results[0].lname;
    var speciality = results[0].speciality;
    var email = results[0].email;
    var doctoreID = results[0].doctoreID;

    // Default date for first render
    var selectedDate = formattedDate;

    // ✅ Fetch available times for the default date
    const sqlTimes = "SELECT time FROM availableDays WHERE date = ? AND doctoreID = ?";
    connection.query(sqlTimes, [selectedDate, doctoreID], (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      const tempo = result.length > 0 ? result.map(r => r.time) : [];

      res.render('doctorsProfile.ejs', {
        docFName,
        docLName,
        speciality,
        email,
        doctoreID,
        date: selectedDate,
        tempo
      });
    });
  });
});

//=============================view doctors list from selected clinic===========================================

app.get("/viewDocList",ensureAuthenticated,  (req, res) =>{
    

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

})

//=================================================To view the Booking page==========================
app.get("/appointmentBooking",ensureAuthenticated,  async (req, res) => {

             const id = req.query.clinicID;
            let authenticatedUser = req.user.username;
            console.log("the ID is ", id);
    
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
    }
    
    });

 
//================================================Add Appointment============================================================
app.post("/makeAppointment", ensureAuthenticated, (req, res) => {
  const authenticatedUser = req.user.phoneNumber;
  const {
    numeroDaClinica,
    fname,
    email,
    phoneNumber,
    appointmentDate,
    appointmentTime,
    reasonForVisit
  } = req.body;

  // ✅ Ensure numeroDaClinica is defined
  const clinicPrefix = numeroDaClinica && numeroDaClinica.trim() !== "" ? numeroDaClinica.trim() : "CLIN";

  // Step 1: Check if patient exists
  connection.query(
    "SELECT patientID FROM patient WHERE phoneNumber = ?",
    [authenticatedUser],
    (error, results) => {
      if (error) {
        console.error("Error looking up patient:", error);
        return res.send("Error looking up patient");
      }

      const patientID = results.length > 0 ? results[0].patientID : "New Patient";

      // ✅ Step 2: Find last appointment ID for this clinic (safe numeric sort)
      const lookupQuery = `
        SELECT appointmentID 
        FROM appointment 
        WHERE appointmentID LIKE ? 
        ORDER BY CAST(SUBSTRING(appointmentID, LENGTH(?) + 1) AS UNSIGNED) DESC 
        LIMIT 1
      `;

      connection.query(
        lookupQuery,
        [clinicPrefix + "%", clinicPrefix],
        (err2, result) => {
          if (err2) {
            console.error("Error looking up last appointment:", err2);
            return res.send("Error looking up appointments");
          }

          let appointmentID;

          if (result.length > 0) {
            const lastAppointmentID = result[0].appointmentID;
            const prefix = clinicPrefix;
            const numericPart = lastAppointmentID.replace(prefix, "").trim();
            const lastNumber = Number.isInteger(parseInt(numericPart, 10))
              ? parseInt(numericPart, 10)
              : 0;
            const nextNumber = lastNumber + 1;
            const paddedNumber = String(nextNumber).padStart(9, "0");
            appointmentID = prefix + paddedNumber;
          } else {
            appointmentID = clinicPrefix + "000000001";
          }

          console.log(`✅ Generated AppointmentID: ${appointmentID} for patientID: ${patientID}`);

          // ✅ Step 3: Insert appointment with default status 'Pending'
          const sql = `
            INSERT INTO appointment (
              appointmentID,
              fname,
              lname,
              appointmentDate,
              appointmentTime,
              reasonForVisit,
              appointment_status,
              phoneNumber,
              patientID,
              userID,
              prefDocName,
              prefDocID,
              clinicID,
              email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          connection.query(
            sql,
            [
              appointmentID,
              fname,
              "",
              appointmentDate,
              appointmentTime,
              reasonForVisit,
              "Pending",
              phoneNumber,
              patientID,
              "",
              "",
              "",
              clinicPrefix,
              email
            ],
            (insertErr) => {
              if (insertErr) {
                console.error("Error inserting appointment:", insertErr);
                return res.send("Failed to save appointment");
              }

              console.log("✅ Appointment inserted successfully with status 'Pending'.");
              return res.redirect("/appointmentHistory");
            }
          );
        }
      );
    }
  );
});

//==================================================== Route to login page============================================================================
app.get("/login", (req, res) => {
   res.render("login", {
    success: req.flash("success"),
    error: req.flash("error"),
  });
});


//================================================Home page after successful login=====================================
app.get('/home',ensureAuthenticated,  (req,res) => {


         res.render('portal.ejs');
    
       
    });

//=====================================================================Users Profile Route==================================
app.get('/userProfile', ensureAuthenticated, (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).send('User not authenticated');
  }

  const phoneNumber = user.phoneNumber;

  const sql = 'SELECT * FROM externalUsers WHERE phoneNumber = ?';

  connection.query(sql, [phoneNumber], (err, results) => {
    if (err) {
      console.error('❌ DB Error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('No matching user found');
    }

    const userProfile = results[0];
    console.log(userProfile);
    res.render('userProfile.ejs', {
      user: userProfile
    });
  });
});
//-----------------------------------------Update profile------------------------------------------------------
app.post('/updateProfile', ensureAuthenticated, (req, res) => {
  const { fname, lname, username, phoneNumber, patientID, userID } = req.body;

  const sql = `
    UPDATE externalUsers
    SET fname = ?, lname = ?, username = ?, patientID = ?, userID = ?
    WHERE phoneNumber = ?
  `;

  const values = [fname, lname, username, patientID, userID, phoneNumber];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Update error:', err);
      return res.status(500).send('Update failed');
    }

    res.redirect('/userProfile');
  });
});



//=========================================Route to the insurance page ===============================================

app.get("/insurance", ensureAuthenticated, (req, res) =>{
 
     res.render('insurance1.ejs');

})

//========================================================Appointment Router=======================================
app.get("/appointment", ensureAuthenticated, (req, res) =>{

    res.render('appointments.ejs');
    

})

//============================================ laboratories route =============================================
app.get("/laboratory",ensureAuthenticated,  (req, res) =>{

     res.render('laboratories.ejs');
    
})
//==============================================appointment history route=====================================
app.get("/appointmentHistory",ensureAuthenticated, async (req, res) =>{
    
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

        
   

        const sql = "INSERT INTO externalUsers (fname, lname, phoneNumber, username, password) VALUES (?, ?, ?, ?, ?)";
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

app.get("/searchLab",ensureAuthenticated,  (req, res) => {
    

  const sql = "SELECT * FROM laboratories";

        connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
         console.log(results);

         res.render('labList.ejs', {appointment: results});
    });

})
//============================lab test history===========================
app.get("/appointmentHistory",ensureAuthenticated, async (req, res) =>{

        var authenticatedUser = req.user.phoneNumber;

        // console.log(model);

        try {
        await connection.query('SELECT * FROM appointment where phoneNumber = ?', [authenticatedUser] ,function(error, result){
            
            if (error) console.log(error);
        console.log(result);
        res.render('appointmentHistory.ejs', {appointment: result});
    });
     console.log(result);
    } catch (err) {
        console.log(err);
    }
    
    });
//============================================lab test request =====================================
app.get('/labTestRequest', ensureAuthenticated, (req, res) => {
    
    

    const phoneNumber = req.user.phoneNumber;

    // Query externalUsers first
    const sqlExternal = "SELECT * FROM externalUsers WHERE phoneNumber = ?";
    connection.query(sqlExternal, [phoneNumber], (errExt, extResults) => {
        if (errExt) {
            console.error("Error fetching externalUsers:", errExt);
            return res.send("Database error");
        }

        let extData = { fname: "", username: "", phoneNumber };
        if (extResults.length > 0) {
            extData = {
                fname: extResults[0].fname,
                username: extResults[0].username,
                phoneNumber: extResults[0].phoneNumber
            };
        }

        // Query patient table
        const sqlPatient = "SELECT * FROM patient WHERE phoneNumber = ?";
        connection.query(sqlPatient, [phoneNumber], (errPat, patResults) => {
            if (errPat) {
                console.error("Error fetching patient:", errPat);
                return res.send("Database error");
            }

            let patientData = { patientID: "New Patient", gender: "" };
            if (patResults.length > 0) {
                patientData = {
                    patientID: patResults[0].patientID,
                    age: patResults[0].age,
                    gender: patResults[0].gender
                };
            }

            // Merge and send to template
            const renderData = { ...extData, ...patientData };
            console.log("Render data:", renderData);

            res.render('labTestRequest.ejs', renderData);
        });
    });
});

//==============================================lab testing history====================================

app.get('/labHistory',ensureAuthenticated,  async(req, res)=> {

        var authenticatedUser = req.user.phoneNumber;

        console.log(authenticatedUser);

        try {
        await connection.query('SELECT * FROM labTests where phoneNumber = ?', [authenticatedUser] ,function(error, result){
            
            if (error) console.log(error);
        console.log(result);
      //   const date = result[0].requestDate;
      //   const formattedDate = date.toLocaleDateString();

      //   const resDate = result[0].requestDate;
      // const resultDate = resDate.toLocaleDateString();
      // console.log(resultDate)
      // console.log(formattedDate)
        res.render('labTestHistory.ejs', {appointment: result});
    });
    } catch (err) {
        console.log(err);
    }

        });
//==============================================Book Lab Test=====================================
    app.post('/labtestes', ensureAuthenticated, (req, res) => {
      
        const authenticatedUser = req.user.phoneNumber;
        const { fname, lname,appointmentID,patientID,phoneNumber,labID,testName} = req.body;
        const model1 = patientID.slice(0, 6);
            var today = new Date();
            var formattedDate = today.toLocaleDateString(); 
            var formatedData = dateString = formattedDate.toString();
            
            console.log(formatedData);
        try {
          // Step 2: Find last appointment for this clinic
        connection.query(
          "SELECT testID FROM labTests WHERE testID LIKE ? ORDER BY testID DESC LIMIT 1",
          ["%" + model1 + "%"],
          (error2, result) => {
            if (error2) {
              console.log(error2);
              return res.send("Error looking up appointments");
            }

            let lastID;
            
            if(result.length > 0 ) {
            var lastUser = result[0].testID;
            const model1 = lastUser.slice(0, 10);
            const str = parseInt(lastUser.substring(10), 10) + 1;
            console.log(lastUser);
            console.log(str);
            lastID = model1 + str;
             console.log(lastID);
            } else {
            var externuser = "externUse0";
            lastID = externuser + "000000001";
            console.log(lastID);
            }
            //  Step 3: Insert new appointment
            const sql = `
              INSERT INTO labTests 
              (testID, fname, requestDate, patientID, testName, labID, phoneNumber) 
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
              sql,
              [lastID, fname,formattedDate, patientID,testName,labID, phoneNumber],
              (insertErr) => {
                if (insertErr) {
                  console.log(insertErr);
                  return res.send("Failed to save appointment");
                }

                console.log("Appointment inserted successfully with patientID:");
                return res.redirect("/labHistory");
              }
            );
            })

        } catch {

          console.log("Error conecting to database");
        }

    } )


//==============================================appointment history route=====================================
app.get("/searchClinic", ensureAuthenticated,  (req, res) =>{
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
   
})
//==============================================Registration page=================================
app.get("/registration", (req, res) => {
  res.render("registration", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
});
//----------------------------------------------Another Router--------------------------------
app.get('/change-date', ensureAuthenticated, (req, res) => {
  const { date, userID, doctoID } = req.query;

  const selectedDate = date || new Date().toISOString().split('T')[0];
  const id = userID;
  const doctorID = doctoID;

  connection.query("SELECT * FROM doctors WHERE doctoreID = ?", [id], (error, results) => {
    if (error) return console.log(error);

    if (results.length === 0) return res.send("Doctor not found");

    const doctor = results[0];
    const { clinics: clinicID, fname: docFName, lname: docLName, speciality, email } = doctor;

    // Prepare available days (next 7 days)
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const availableDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const formatted = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      availableDays.push({ date: formatted, dayName });
    }

    // Get available times for the selected date
    const sql = "SELECT time FROM availableDays WHERE date = ? AND doctoreID = ?";
    connection.query(sql, [selectedDate, doctorID], (err, result) => {
      if (err) return console.log(err);

      const tempo = result && result.length > 0 ? result.map(r => r.time) : [];

      res.render("doctorAvaiability.ejs", {
        tempo,
        clinicID,
        docFName,
        docLName,
        speciality,
        email,
        id,
        data: selectedDate,
        message: tempo.length === 0 ? "No times available for this date." : null,
        doctorID,
        availableDays
      });
    });
  });
});
//====================================appointment booking  Router==============================================================
 
app.post("/book-time", ensureAuthenticated, async(req, res) => {

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
});

//======================================= Insurance================================================================
app.get('/claimList',ensureAuthenticated,  async(req, res)=>{

    let authenticatedUser = req.user.phoneNumber;
     let  sql = "select * from Claims where phoneNumber = ?";
    try {
    let query = await connection.query(sql,[authenticatedUser], (err, rows) => {
        if(err) throw err;
        
      //  let clinica = rows[0].submittedAT;
        
          res.render('insurancePortal.ejs',{Claims: rows});
        console.log(authenticatedUser);
        console.log(rows);
        
        });
        } catch (err) {
            console.log(err)
        }
 
})
//------------------------------------Insurance Claim--------------------------------------
app.get('/insuranceClaim', ensureAuthenticated, (req, res) => {
  const user = req.user; // Authenticated user's info

  const sql = `SELECT * FROM externalUsers WHERE phoneNumber = ?`; // Adjust to your schema
  const values = [user.phoneNumber]; // Or user.email, username, etc.

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('❌ Error fetching user externalUsers:', err);
      return res.status(500).send('Server error while retrieving externalUsers.');
    }
    console.log(results);
    var fname = results[0].fname;
  
    // Render the claims for this user
    res.render('insuranceClaim.ejs', {user,claims: results, fname });
    console.log(fname);
     
  });
});


//=============================================Search Insurance =========================
app.get('/insuranceSearch',ensureAuthenticated,  (req,res) => {


  const sql = "SELECT * FROM insurance";

        connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error executing multiple queries:', err);
            return;
        }
         console.log(results);

         res.render('insuranceList.ejs', {appointment: results});
    });

});

//-------------------------------------Edit claim--------------------------------------------
// GET route for editing a claim
app.get('/editClaim/:claimID', (req, res) => {
  const claimId = req.params.claimID;
  const sql = 'SELECT * FROM Claims WHERE claimID = ?';

  connection.query(sql, [claimId], (err, results) => {
    if (err) {
      console.error('Error loading claim:', err);
      return res.status(500).send('Server Error');
    }

    if (results.length === 0) {
      return res.status(404).send('Claim not found');
    }

    const claim = results[0];
    res.locals.__ = res.__; // make i18n function available
    res.render('insuranceClaimUpdate', { claim });
  });
});
//======================================
app.get('/insuranceClaimUpdate', (req, res)=>{

  res.render('insuranceClaimUpdate.ejs');
})
//==========================add appointment without favorite dr. -------------------------
app.post('/addAppointment', (req, res) => {
  const {

    numeroDaClinica,
    fname,
    email,
    phoneNumber,
    clinicName,
    appointmentDate,
    appointmentTime,
    reasonForVisit
  } = req.body;

  const authenticatedUser = req.user ? req.user.phoneNumber : null;

  if (!authenticatedUser) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  // Step 1: Try to find patientID
  connection.query(
    "SELECT patientID FROM patient WHERE phoneNumber = ?",
    [authenticatedUser],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error looking up patient", error });
      }

      const selectedUser = results.length > 0 ? results[0].patientID : "New Patient";

      // Step 2: Find last appointmentID for this clinic
      connection.query(
        'SELECT appointmentID FROM appointment WHERE appointmentID LIKE ? ORDER BY appointmentID DESC LIMIT 1',
        [`${numeroDaClinica}%`],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error looking up appointments", error: err });
          }

          let lastID;

          if (results.length > 0) {
            const lastAppointmentID = results[0].appointmentID;
            const prefix = lastAppointmentID.slice(0, 9);
            const number = parseInt(lastAppointmentID.slice(9)) + 1;
            const padded = String(number).padStart(9, '0');
            lastID = prefix + padded;
          } else {
            // No existing appointments for this clinic
            lastID = numeroDaClinica + "000000001";
          }

          console.log("Final Appointment ID:", lastID);

          // Step 3: Insert new appointment using selectedUser (patientID)
          const sql = `
  INSERT INTO appointment (
    appointmentID,
    fname,
    lname,
    appointmentDate,
    appointmentTime,
    reasonForVisit,
    appointment_status,
    phoneNumber,
    patientID,
    userID,
    prefDocName,
    prefDocID,
    clinicID,
    email
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

connection.query(
  sql,
  [
    lastID,
    fname,
    "",
    appointmentDate,
    appointmentTime,
    reasonForVisit,
    "Pending", // ✅ now goes into appointment_status
    phoneNumber,
    selectedUser,
    "",
    "",
    "",
    numeroDaClinica,
    email
  ],
  (insertErr) => {
    if (insertErr) {
      console.error("Error inserting appointment:", insertErr);
      return res.send("Failed to save appointment");
    }

    console.log("✅ Appointment inserted successfully with status 'Pending'.");
    return res.redirect("/appointmentHistory");
  }
);

        }
      );
    }
  );
});
//----------------------------------Clinic Details ----------------------------------------------
app.get('/clinicDetails',ensureAuthenticated,  async(req,res) => {
    
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

           

            
        res.render('clinicPage.ejs', {appointment:result,clname,claddress,provincia});

           console.log(id);

});} catch (err) {
    console.log(err);
}
});


// confirming that the server is running  on port 3000
app.listen(8000, () => {

console.log("Server running on port 8000")});
    




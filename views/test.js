//======================================================================Booking page==========================
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

 


    
app.post("/book-time", async(req, res) => {

 if (req.isAuthenticated()) {
 let authenticatedUser = req.user.username;
  const { doctorID, time, clinicID, } = req.body;  

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

      res.render('reviewAppointment.ejs',{clname,lname,name,email,telephone,clID,doctorID})
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


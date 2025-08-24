app.post('/addAppointment',
  
    async (req, res) =>{
        
        if (req.isAuthenticated()) {

            let authenticatedUser = req.user.phoneNumber;
    

            try {
        await connection.query('SELECT * FROM  patient where phoneNumber = ?',['%' + authenticatedUser + '%'], function  (error, results) {
            if(error) {
            console.log(error);
            }
            if (results.length > 0){
                let selectedUser = results[0].patientID;
                let model = authenticatedUser.slice(0, 6);
            
             const sql = "SELECT * FROM  appointment where appointmentID like ? = ?";
            connection.query(sql, [model], function (err,result){
             if(error) {
            console.log(error);
                       }
            
              let lastUser = results[results.length - 1];
                let userId2 = lastUser.appointmentID;
                let model1 = userId2.slice(0, 9);
                str = userId2.substring(9, userId2.length );
                let str1 = parseInt(str,10);
                str1 ++;
                let lastID = model1 + str1;   
                console.log(lastUser);
                // console.log(model1);
                // console.log(str1);
            var sql = "INSERT INTO appointment (appointmentID,fname,lname,reasonForVisit, phoneNumber) \
            VALUES ('"+lastID+"','"+ req.body.fname+"', '"+ req.body.lname+"', '"+ req.body.reasonForVisit+"','"+ req.body.phoneNumber+"')";
             connection.query(sql, function (err, rows, fields){
            
            if (err) console.log(err)
           // req.flash('user',successfullReg);
            console.log(rows);
           res.redirect('/appointmentHistory');
            });
            
            } )


            } else {
                  var q = "INSERT INTO appointment (fname,lname,reasonForVisit, phoneNumber) \
            VALUES ('"+ req.body.fname+"', '"+ req.body.lname+"', '"+ req.body.reasonForVisit+"','"+ req.body.phoneNumber+"')";
             connection.query(q, function (err, rows, fields){
            
            if (err) console.log(err);
           // req.flash('user',successfullReg);

           console.log(rows)
        //    res.redirect('/appointmentHistory');
            });
 
            }
            
            });
            } catch (err) {
                console.log(err);
            }
        } else {
            res.redirect('login')

        }
        
});

















ter.post('/addAppointment',
  
    async (req, res) =>{
        
        if (req.isAuthenticated()) {

            let authenticatedUser = req.user.ID;
            console.log(authenticatedUser);
           let model = authenticatedUser.slice(0, 6);
          console.log(model);
            try {
        
            } catch (err) {
                console.log(err);
            }
        } else {
            res.redirect('login')

        }
        
});
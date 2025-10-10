app.post('/addAppointment', async (req, res) => {
  if (req.isAuthenticated()) {
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

    // ✅ Validate required fields
    if (!appointmentDate || !appointmentTime) {
      console.log("❌ Missing date or time:", appointmentDate, appointmentTime);
      req.flash("error_msg", "Date and time are required to book an appointment.");
      return res.redirect("back"); // redirect to the form
    }

    try {
      connection.query(
        'SELECT patientID FROM patient WHERE phoneNumber = ?',
        [authenticatedUser],
        function (error, results) {
          if (error) {
            console.log(error);
            return res.status(500).send("DB Error");
          }

          if (results.length > 0) {
            const selectedUser = results[0].patientID;

            connection.query(
              'SELECT * FROM appointment WHERE appointmentID LIKE ?',
              ['%' + numeroDaClinica + '%'],
              function (error, result) {
                if (error) {
                  console.log(error);
                  return res.status(500).send("DB Error");
                }

                let lastID;
                if (result.length > 0) {
                  const lastUser = result[result.length - 1].appointmentID;
                  const model1 = lastUser.slice(0, 9);
                  let str = lastUser.substring(9);
                  let str1 = parseInt(str, 10) || 0;
                  str1++;
                  lastID = model1 + str1;
                } else {
                  // If no appointments yet, start fresh
                  lastID = numeroDaClinica + "0001";
                }

                console.log("Generated Appointment ID:", lastID);

                const sql =
                  "INSERT INTO appointment (appointmentID, fname, appointmentDate, appointmentTime, reasonForVisit, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)";

                connection.query(
                  sql,
                  [
                    lastID,
                    fname,
                    appointmentDate,
                    appointmentTime,
                    reasonForVisit,
                    phoneNumber
                  ],
                  function (err, rows) {
                    if (err) {
                      console.log(err);
                      return res.status(500).send("DB Insert Error");
                    }

                    console.log("✅ Inserted appointment:", rows);
                    req.flash("success_msg", "Appointment booked successfully!");
                    return res.redirect('/appointmentHistory');
                  }
                );
              }
            );
          } else {
            console.log("❌ User not found:", authenticatedUser);
            res.redirect('login');
          }
        }
      );
    } catch (err) {
      console.log("Server error:", err);
      res.status(500).send("Server Error");
    }
  } else {
    res.redirect('login');
  }
});

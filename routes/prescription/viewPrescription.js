router.get('/viewPrescription', async (req, res) => {
  try {
    const { patientID } = req.query;
    const sql = `
      SELECT medicationName, dosage, frequency, startDate, endDate
      FROM prescription
      WHERE patientID = ?;
    `;
    connection.query(sql, [patientID], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
      res.render('prescriptionDetails.ejs', { prescriptions: results, patientID });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal error");
  }
});

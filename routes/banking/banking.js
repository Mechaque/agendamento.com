const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MySQL Connection
const connection = mysql.createConnection({
  port: '3306',
  host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'xg5zu6ft9vcegj1i',
  password: 'u7ulq2hmz6797r5n',
  database: 'rkycf99cdfosu3q0',
  timeout: 10000
});




router.get('/banking', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  var authenticatedUser = req.user.phoneNumber;
  console.log(authenticatedUser);
  connection.query("SELECT * FROM banking", (err, result) => {
    if (err) return res.status(500).send("Database error");

    res.render("banking.ejs", { banks: result,authenticatedUser });
   
  });
});


//insert into database
router.post('/addBank', async (req, res) => {
  const { phoneNumber, bank_name, account_number, account_type, branch } = req.body;

  try {
    if (!phoneNumber || !bank_name || !account_number || !account_type || !branch) {
      return res.status(400).send('Missing required fields.');
    }

    await connection.query(
      `INSERT INTO banking 
        (phoneNumber, bank_name, account_number, account_type, branch)
       VALUES (?, ?, ?, ?, ?)`,
      [phoneNumber, bank_name, account_number, account_type, branch]
    );

    res.redirect('/banking'); // Or return a success message
  } catch (error) {
    console.error('Error inserting bank info:', error);
    res.status(500).send('Server error.');
  }
});

module.exports = router;



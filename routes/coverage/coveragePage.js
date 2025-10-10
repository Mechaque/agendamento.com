const express = require('express');
const router = express.Router();
const mysql = require('mysql');


// MySQL Connection
const connection = mysql.createConnection({
  port: '3306',
  host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'xg5zu6ft9vcegj1i',
  password: 'u7ulq2hmz6797r5n',
  database: 'rkycf99cdfosu3q0',
  timeout: 10000
});

router.get('/coverageInfo', (req, res) => {
  const sql = 'SELECT * FROM Coverage';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching coverage:', err);
      return res.status(500).send('Server Error');
    }
    res.render('coveragePage', { coverages: results });
  });
});


module.exports = router;
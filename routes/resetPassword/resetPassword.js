const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const mysql = require('mysql');

// MySQL connection (callback style)
const connection = mysql.createConnection({
  port: '3306',
  host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'xg5zu6ft9vcegj1i',
  password: 'u7ulq2hmz6797r5n',
  database: 'rkycf99cdfosu3q0',
  timeout: 10000
});

// GET reset password page
router.get('/resetPassword', (req, res) => {
  res.render('resetPassword', { error: null, success: null });
});

// POST reset password logic
router.post('/resetPassword', (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.username;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('resetPassword', {
      error: 'Please fill out all fields.',
      success: null,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('resetPassword', {
      error: 'New passwords do not match.',
      success: null,
    });
  }

  // Get user from DB
  connection.query('SELECT * FROM externalUsers WHERE username = ?', [userId], async (err, results) => {
    if (err) {
      console.error(err);
      return res.render('resetPassword', {
        error: 'Database error.',
        success: null,
      });
    }

    if (results.length === 0) {
      return res.render('resetPassword', {
        error: 'User not found.',
        success: null,
      });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.render('resetPassword', {
          error: 'Current password is incorrect.',
          success: null,
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
        (updateErr) => {
          if (updateErr) {
            console.error(updateErr);
            return res.render('resetPassword', {
              error: 'Error updating password.',
              success: null,
            });
          }

          return res.render('resetPassword', {
            success: 'Password updated successfully!',
            error: null,
          });
        }
      );
    } catch (bcryptErr) {
      console.error(bcryptErr);
      return res.render('resetPassword', {
        error: 'Error processing password.',
        success: null,
      });
    }
  });
});




module.exports = router;

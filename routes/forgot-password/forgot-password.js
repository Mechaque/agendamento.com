const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const mysql = require('mysql');
// GET forgot password page
router.get('/forgot-Password', (req, res) => {
  res.render('forgotPassword', { error: null, success: null });
});

// POST forgot password logic
router.post('/forgotPassword', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.render('forgotPassword', { error: 'Please enter your username.', success: null });
  }

  // Check if user exists
  connection.query('SELECT * FROM externalUsers WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('forgotPassword', { error: 'Database error.', success: null });
    }

    if (results.length === 0) {
      // For security, don't reveal user doesn't exist
      return res.render('forgotPassword', { success: 'If this email is registered, a reset link has been sent.', error: null });
    }

    const user = results[0];

    // Generate a token (usually you store this token in DB with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // TODO: Save this resetToken and its expiry time in the database for this user
    // Example: UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?

    const tokenExpiry = Date.now() + 3600000; // 1 hour expiry

    connection.query(
      'UPDATE externalUsers SET reset_token = ?, reset_token_expiry = ? WHERE username = ?',
      [resetToken, tokenExpiry, user.username],
      (err2) => {
        if (err2) {
          console.error(err2);
          return res.render('forgotPassword', { error: 'Database error.', success: null });
        }

        // Send email with reset link (replace with your SMTP config)
        const transporter = nodemailer.createTransport({
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: {
            user: 'your-email@example.com',
            pass: 'your-email-password',
          },
        });

        const resetURL = `http://${req.headers.host}/resetPassword?token=${resetToken}`;

        const mailOptions = {
          to: user.email,
          from: 'no-reply@example.com',
          subject: 'Password Reset',
          text: `You requested a password reset. Click here to reset: ${resetURL}\n\nIf you did not request, ignore this email.`,
        };

        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) {
            console.error(emailErr);
            return res.render('forgotPassword', { error: 'Error sending email.', success: null });
          }

          res.render('forgotPassword', {
            success: 'If this email is registered, a reset link has been sent.',
            error: null,
          });
        });
      }
    );
  });
});


module.exports = router;

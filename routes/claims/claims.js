const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// MySQL Connection

// Middleware to make __ available in all templates rendered from this router
router.use((req, res, next) => {
  res.locals.__ = res.__; // ✅ important: makes __('...') work in EJS
  next();
});


//-----------------
const connection = mysql.createConnection({
  port: '3306',
  host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'xg5zu6ft9vcegj1i',
  password: 'u7ulq2hmz6797r5n',
  database: 'rkycf99cdfosu3q0',
  timeout: 10000
});

// Ensure 'uploads' folder exists at project root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // upload destination
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Optional: validate file types (PDF, JPG, PNG, DOCX)
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only PDF, JPG, PNG, or DOCX files are allowed'), false);
  }
  cb(null, true);
};

// Initialize Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: fileFilter
});

// POST /claimForm – Handles form submission with file upload
router.post('/claimForm', upload.single('document'), (req, res) => {
  console.log('🟢 /claimForm route hit');
  console.log('📨 Body:', req.body);
  console.log('📎 File:', req.file);

  if (!req.file) {
    return res.status(400).send('❌ File not received or invalid type');
  }

  const {
    fname,
    clinicID,
    policeNumber,
    typeOfPolice,
    claimTotal,
    description
  } = req.body;

  // ✅ Get phone number from the authenticated user
  const phoneNumber = req.user?.phoneNumber || null;

  if (!phoneNumber) {
    return res.status(400).send('❌ Authenticated user phone number missing');
  }

  const documentPath = req.file.filename;

  // Validate required fields
  if (!fname || !claimTotal || !clinicID || !policeNumber || !typeOfPolice || !description) {
    return res.status(400).send('❌ Missing required fields');
  }

  const patientID = req.user?.ID || '12345'; // Replace with real user ID
  const appointmentID = '67890'; // Replace with logic if needed

  const claimID = `CLM-${policeNumber}-PAT${patientID}-APT${appointmentID}-CLN${clinicID}`;
  const submittedAt = new Date().toISOString().split('T')[0];

  // ✅ Update SQL to include phone number
  const sql = `
    INSERT INTO Claims (
      claimID,
      fullName,
      claimTotal,
      policeNumber,
      typeOfPolice,
      description,
      documents,
      clinicID,
      submittedAt,
      phoneNumber,
      status

    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    claimID,
    fname,
    claimTotal,
    policeNumber,
    typeOfPolice,
    description,
    documentPath,
    clinicID,
    submittedAt,
    phoneNumber,
    "Pending"
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error inserting claim into database:', err);
      return res.status(500).send('❌ Database error');
    }

    console.log('✅ Claim inserted:', claimID);
    res.redirect('/claimList');
  });
});

//-------------------------------------------edit claim------------------------------------------------


//------------------------------------------Update claim --------------------------------------
router.post('/updateClaim', upload.single('document'), (req, res) => {
  const {
    claimID,
    fname,
    claimTotal,
    status,
    submittedAT,
    typeOfPolice,
    description
  } = req.body;

  // Start with base SQL and values
  let sql = `
    UPDATE Claims 
    SET fullName = ?, claimTotal = ?, status = ?, submittedAt = ?, typeOfPolice = ?, description = ?
  `;
  const values = [fname, claimTotal, status, submittedAT, typeOfPolice, description];

  // If a file was uploaded, include it in the update
  if (req.file) {
    sql += `, documents = ?`;
    values.push(req.file.filename);
  }

  // Finalize the WHERE clause
  sql += ` WHERE claimID = ?`;
  values.push(claimID);

  // Run the update query
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error updating claim:', err);
      return res.status(500).send('Error updating claim');
    }

    console.log('✅ Claim updated successfully:', result);
    res.redirect('/claimList'); // Change if needed
  });
});


//------------------------------------------Delete Claim----------------------------------------

// DELETE claim by ID
router.get('/deleteClaim/:id', (req, res) => {
  const claimId = req.params.claimID;

  const sql = 'DELETE FROM Claims WHERE id = ?';
  connection.query(sql, [claimId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting claim:', err);
      return res.status(500).send('Error deleting claim');
    }
    res.redirect('/insurancePortal'); // Redirect back to the claim list
  });
});







module.exports = router;

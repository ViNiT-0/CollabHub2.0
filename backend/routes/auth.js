const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const path = require('path');
const multer = require("multer");
const fs = require('fs');


// Set up multer for file handling (storing image in memory as Buffer)
const eventUploadDir = path.join(__dirname, '../uploads/user');
if (!fs.existsSync(eventUploadDir)) {
  fs.mkdirSync(eventUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, eventUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });


// Signup Route
// routes/register.js


// Register Route (POST request)
router.post('/register', upload.single('profilePic'), async (req, res) => {
  const { name, email, password, role } = req.body;
  const profilePic = req.file ? `user/${req.file.filename}` : null; // Get the profile picture as a Buffer

  // Validate form fields
  if (!name || !email || !password || !role || !profilePic) {
    return res.status(400).json({ message: 'Please fill out all fields and upload a profile picture.' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User document
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      role,
      profilePic,
    });

    // Save the user to the database
    await newUser.save();

    // Send a response back
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});



//login route
// POST /api/auth/login
// Route to handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
console.log("check");
  // Check if email or password is missing
  if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  try {
      // Find user by email
      const user = await User.findOne({ email });

      // If user not found, return error
      if (!user) {
          // Use 401 so SOC platform can detect web_login_attempt / bruteforce properly
          return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      }

      // Check if the password matches 
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // Use 401 so SOC platform can detect web_login_attempt / bruteforce properly
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
console.log("check");
      // Login success
      res.status(200).json({
          success: true,
          message: 'Login successful',
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              profilePic: user.profilePic 
          }
      });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
});

module.exports = router;
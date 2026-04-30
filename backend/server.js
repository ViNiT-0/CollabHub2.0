const express = require('express');
const cors = require('cors'); // Fixed typo
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const eventRoutes = require('./routes/event');
const collabRoutes = require('./routes/collab');
const qnaRoutes = require('./routes/qna');
const registrationRoutes1 = require('./routes/Eventregistration');
const registrationRoutes2 = require('./routes/Collabregistration');
const facultyRoutes = require('./routes/faculty');
const certificateRoutes = require('./routes/certificate');
const userRoutes = require('./routes/user');
const path = require('path');
const { sendToSoc } = require('./utils/socIngest');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1); // Exit process with failure
  });

// Middleware
app.use(cors());
app.use(express.json()); // Simplified, no need for body-parser
app.use(express.urlencoded({ extended: true }));

// Ship request metadata to SOC ingest API (non-blocking).
// Configure via env: SOC_INGEST_URL, SOC_API_KEY, SOC_SITE
app.use((req, res, next) => {
  res.on('finish', () => {
    // fire-and-forget
    sendToSoc({ req, statusCode: res.statusCode });
  });
  next();
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/event', eventRoutes);
app.use('/api/collab', collabRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/Eventregister-event', registrationRoutes1);
app.use('/api/Collabregister-event', registrationRoutes2);
app.use('/api/faculty', facultyRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/user', userRoutes);

// Serve CollabHub frontend (HTML/CSS/JS) from the repo's `frontend/` folder.
// This makes URLs like `/pages/home.html` work without a separate web server.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve static files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  // Redirect (not sendFile) so the browser URL base stays `/pages/...`,
  // keeping relative links inside `home.html` working.
  res.redirect('/pages/home.html');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port:${PORT}`));

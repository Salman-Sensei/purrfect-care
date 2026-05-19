const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. LOAD DOTENV FIRST (Before any other local imports)
dotenv.config();

const connectDB = require('./config/db');

const app = express();

// 2. DATABASE CONNECTION
// Ensure your MONGO_URI is in Render's Environment tab
connectDB();

// 3. MIDDLEWARE
app.use(cors({
  // Ensure this matches your Vercel URL exactly (no trailing slash)
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cats', require('./routes/catRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/vet', require('./routes/vetRoutes'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '🐱 Purrfect Care API is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server active on port ${PORT}`);
  console.log(`📡 Allowing requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);

  // ── Daily email digest cron — runs every day at 8:00 AM ──────────────────
  if (process.env.RESEND_API_KEY) {
    const cron = require('node-cron');
    const { sendDailyDigestToAll } = require('./services/emailService');
    cron.schedule('0 8 * * *', () => {
      console.log('⏰ Running daily email digest...');
      sendDailyDigestToAll().catch(err => console.error('Digest error:', err.message));
    });
    console.log('📧 Daily email digest scheduled for 8:00 AM');
  }
});
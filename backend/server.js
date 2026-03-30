const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  if (!process.env.MONGO_URI) {
    console.log('Seeding in-memory DB...');
    const seed = require('./utils/seed');
    await seed();
  }
  app.listen(PORT, () => {
    console.log(`🚀 CampusHub API running on http://localhost:${PORT}`);
  });
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded posters)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/events',     require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/analytics',  require('./routes/analytics'));
app.use('/api/qr',         require('./routes/qr'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusHub API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// End

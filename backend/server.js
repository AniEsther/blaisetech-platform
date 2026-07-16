// server.js — the entry point. This starts the web server, connects to the
// database, and wires up every route/module of the platform.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/db');
require('./models'); // loads all models + their relationships

const errorHandler = require('./middleware/errorHandler');

// Route modules — one per feature area of the platform
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const projectRoutes = require('./routes/projectRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded photos/CVs

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ message: 'Blaisetech Global Resources API is running.' });
});

// --- Feature routes ---
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// --- 404 handler for unknown routes ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// --- Central error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to the database, sync the tables, then start listening
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database.');
    // { alter: true } auto-updates tables to match the models — great for
    // development. In production you would use proper migrations instead.
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err.message);
  });

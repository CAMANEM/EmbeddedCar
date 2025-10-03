require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
//const endpointRoutes = require('./src/endpoint_route/endpoint');
const securityRoutes = require('./src/endpoint_security/security');
const carRoutes = require('./src/endpoint_car/car');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', securityRoutes);
app.use('/api', carRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Express API Template is running!',
    version: '1.0.0',
    endpoints: {
      '/api/endpoint': 'GET, POST - Main endpoint'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at: http://localhost:${PORT}`);
});

module.exports = app;

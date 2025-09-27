const express = require('express');
const router = express.Router();

// Import controllers
const {
  getEndpoint,
  postEndpoint,
  putEndpoint,
  deleteEndpoint
} = require('./endpoint_controller');

// Define routes

// GET /api/endpoint
router.get('/endpoint', getEndpoint);

// POST /api/endpoint
router.post('/endpoint', postEndpoint);

// PUT /api/endpoint/:id
router.put('/endpoint/:id', putEndpoint);

// DELETE /api/endpoint/:id
router.delete('/endpoint/:id', deleteEndpoint);

// Additional example routes
router.get('/endpoint/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `GET request for ID: ${id}`,
    timestamp: new Date().toISOString(),
    data: {
      id: id,
      name: `Item ${id}`,
      description: `Details for item with ID ${id}`
    }
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

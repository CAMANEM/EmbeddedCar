const express = require('express');
const router = express.Router();

// Import controllers
const {
  requestLogin
} = require('./security_controller');

// Define routes

router.post('/security/login', requestLogin);

router.get('/security/?', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Security API is running.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

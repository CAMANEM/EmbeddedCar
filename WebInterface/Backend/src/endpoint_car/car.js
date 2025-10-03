const express = require('express');
const router = express.Router();

// Import controllers
const {
  request_connect,
  request_move_forward,
  requestmove_backwards,
  request_brake,
  request_move_left,
  request_move_right
} = require('./car_controller');

// Define routes

router.post('/car/connect', request_connect);

router.post('/car/move_forward', request_move_forward);

router.post('/car/move_backwards', requestmove_backwards);

router.post('/car/brake', request_brake);

router.post('/car/move_left', request_move_left);

router.post('/car/move_right', request_move_right);

router.get('/car/?', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Car API is running.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
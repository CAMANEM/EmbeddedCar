const express = require('express');
const router = express.Router();

// Import controllers
const {
  request_connect,
  request_move_forward,
  requestmove_backwards,
  request_brake,
  request_move_left,
  request_move_right,
  request_car_movement,
  update_car_movement
} = require('./car_controller');

// Variables
let carConnected = false;
let car_movement = 'none'; // Possible values: 'none', 'forward', 'backward'
let car_speed = 0; // Speed percentage (0-100)
let car_direction = 'none'; // Possible values: 'none', 'left', 'right'


// Define routes

router.post('/car/connect', request_connect);

router.post('/car/move_forward', request_move_forward);

router.post('/car/move_backwards', requestmove_backwards);

router.post('/car/brake', request_brake);

router.post('/car/move_left', request_move_left);

router.post('/car/move_right', request_move_right);

router.post('/car/update_movement', update_car_movement);

router.get('/car/movement', request_car_movement);

router.get('/car/?', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Car API is running.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
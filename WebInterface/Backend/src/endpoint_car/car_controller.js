/*===================================           CONTROLLER FOR CAR REQUESTS           ===================================*/

/*
Function: request_connect
Description: Establishes connection with the embedded car system.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const request_connect = (req, res) => {
  try {
    // TODO: Implement car connection logic
    
    const response = {
      status: 'Connected.',
      message: 'Successfully connected to car.',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Connection failed.',
      message: 'Unable to connect to car.',
      details: error.message
    });
  }
};

/*
Function: request_move_forward
Description: Sends command to move the car forward.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const request_move_forward = (req, res) => {
  try {
    const { speed, duration } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    }

    // TODO: Implement forward movement logic to send to RBPI API.

    const response = {
      status: 'Moving.',
      direction: 'Forward.',
      speed: speed || 50,
      duration: duration || null,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Movement failed.',
      message: 'Unable to move car forward.',
      details: error.message
    });
  }
};

/*
Function: requestmove_backwards
Description: Sends command to move the car backwards.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const requestmove_backwards = (req, res) => {
  try {
    const { speed, duration } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    }

    // TODO: Implement actual backward movement logic to send to RBPI API.

    const response = {
      status: 'Moving.',
      direction: 'Backwards.',
      speed: speed || 50,
      duration: duration || null,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Movement failed.',
      message: 'Unable to move car backwards.',
      details: error.message
    });
  }
};

/*
Function: request_brake
Description: Sends command to brake/stop the car.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const request_brake = (req, res) => {
  try {
    // TODO: Implement actual brake logic

    const response = {
      status: 'Stopped.',
      message: 'Car has been stopped successfully.',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Brake failed.',
      message: 'Unable to stop the car.',
      details: error.message
    });
  }
};

/*
Function: request_move_left
Description: Sends command to turn the car left.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const request_move_left = (req, res) => {
  try {
    const { angle, speed } = req.body;
    
    // Validate inputs
    if (angle && (angle < 0 || angle > 90)) {
      return res.status(400).json({
        error: 'Invalid angle.',
        message: 'Turn angle must be between 0 and 90 degrees.'
      });
    }

    // TODO: Implement actual left turn logic

    const response = {
      status: 'Turning.',
      direction: 'Left.',
      angle: angle || 45,
      speed: speed || 30,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Turn failed.',
      message: 'Unable to turn car left.',
      details: error.message
    });
  }
};

/*
Function: request_move_right
Description: Sends command to turn the car right.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by: car.js
Last modified by:
  Andres Rodriguez Rojas on 02/10/2025
*/
const request_move_right = (req, res) => {
    try {
    const { angle, speed } = req.body;
    
    // Validate inputs
    if (angle && (angle < 0 || angle > 90)) {
      return res.status(400).json({
        error: 'Invalid angle.',
        message: 'Turn angle must be between 0 and 90 degrees.'
      });
    }

    // TODO: Implement actual right turn logic

    const response = {
      status: 'Turning.',
      direction: 'Right.',
      angle: angle || 45,
      speed: speed || 30,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Turn failed.',
      message: 'Unable to turn car right.',
      details: error.message
    });
  }
};

module.exports = {
  request_connect,
  request_move_forward,
  requestmove_backwards,
  request_brake,
  request_move_left,
  request_move_right
};

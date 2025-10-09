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

const update_car_movement = (req, res) => {
  try {
    const { movement, speed, direction } = req.body;
    // Validate inputs
    const validMovements = ['none', 'forward', 'backward'];
    const validDirections = ['none', 'left', 'right'];

    if (movement && !validMovements.includes(movement)) {
      return res.status(400).json({
        error: 'Invalid movement.',
        message: `Movement must be one of: ${validMovements.join(', ')}.`
      });
    }

    if (direction && !validDirections.includes(direction)) {
      return res.status(400).json({
        error: 'Invalid direction.',
        message: `Direction must be one of: ${validDirections.join(', ')}.`
      });
    }

    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    }

    // Update car state
    if (movement) car_movement = movement;
    if (speed !== undefined) car_speed = speed;
    if (direction) car_direction = direction;

    const response = {
      status: 'Updated.',
      movement: car_movement,
      speed: car_speed,
      direction: car_direction
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Update failed.',
      message: 'Unable to update car state.',
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
    const { speed } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    } else {
      // Update car state
      car_movement = 'forward';
      car_speed = speed || 50;

      const response = {
        status: 'Moving.',
        direction: 'Forward.',
        speed: speed || 50,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    }

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
    const { speed } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    } else {
      // Update car state
      car_movement = 'backward';
      car_speed = speed || 50;

      const response = {
        status: 'Moving.',
        direction: 'Backwards.',
        speed: speed || 50,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    }
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
    // Update car state
    car_movement = 'none';
    car_speed = 0;
    car_direction = 'none';

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
    const { speed } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    } else {
      // Update car state
      car_direction = 'left';
      car_speed = speed || 30;

      const response = {
        status: 'Turning.',
        direction: 'Left.',
        speed: speed || 30,
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        status: 'Turning.',
        direction: 'Left.',
        speed: speed || 30,
        timestamp: new Date().toISOString()
      });
    }
    
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
    const { speed } = req.body;
    
    // Validate inputs
    if (speed && (speed < 0 || speed > 100)) {
      return res.status(400).json({
        error: 'Invalid speed.',
        message: 'Speed must be between 0 and 100.'
      });
    } else {
      // Update car state
      car_direction = 'right';
      car_speed = speed || 30;

      const response = {
        status: 'Turning.',
        direction: 'Right.',
        speed: speed || 30,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    }
  } catch (error) {
    res.status(400).json({
      error: 'Turn failed.',
      message: 'Unable to turn car right.',
      details: error.message
    });
  }
};

const request_car_movement = (req, res) => {
  try {
    const response = {
      movement: car_movement,
      speed: car_speed,
      direction: car_direction
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get car movement.',
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
  request_move_right,
  request_car_movement,
  update_car_movement
};

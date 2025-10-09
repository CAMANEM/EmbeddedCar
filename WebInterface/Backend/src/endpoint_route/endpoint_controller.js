// Endpoint Controller
// This file contains the business logic for the endpoints

// GET endpoint controller
const getEndpoint = (req, res) => {
  try {
    const data = {
      message: 'GET request successful',
      timestamp: new Date().toISOString(),
      data: {
        id: 1,
        name: 'Sample Data',
        description: 'This is a sample response from the GET endpoint'
      }
    };
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

// POST endpoint controller
const postEndpoint = (req, res) => {
  try {
    const { body } = req;
    
    // Basic validation
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body is required'
      });
    }
    
    const response = {
      message: 'POST request successful',
      timestamp: new Date().toISOString(),
      receivedData: body,
      processedData: {
        id: Math.floor(Math.random() * 1000),
        ...body,
        createdAt: new Date().toISOString()
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

// PUT endpoint controller
const putEndpoint = (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID parameter is required'
      });
    }
    
    const response = {
      message: 'PUT request successful',
      timestamp: new Date().toISOString(),
      updatedId: id,
      updatedData: {
        id: id,
        ...body,
        updatedAt: new Date().toISOString()
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

// DELETE endpoint controller
const deleteEndpoint = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID parameter is required'
      });
    }
    
    const response = {
      message: 'DELETE request successful',
      timestamp: new Date().toISOString(),
      deletedId: id
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

module.exports = {
  getEndpoint,
  postEndpoint,
  putEndpoint,
  deleteEndpoint
};

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Store the latest frame in memory with optimization
let latestFrame = null;
let frameTimestamp = null;
let clients = []; // WebSocket clients
let frameStats = {
  totalFrames: 0,
  totalSize: 0,
  avgFps: 0,
  lastFpsCalculation: Date.now()
};

// Function to notify all connected clients with throttling
const notifyClients = (frame) => {
  if (global.io) {
    // Convertir a base64 una sola vez para todos los clientes
    const base64Frame = frame.toString('base64');
    
    // Enviar de forma no bloqueante
    setImmediate(() => {
      global.io.emit('video-frame', {
        frame: base64Frame,
        timestamp: new Date().toISOString(),
        frameNumber: frameStats.totalFrames
      });
    });
  }
};

// Upload video frame endpoint
const uploadFrame = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please send a JPEG image file'
      });
    }

    // Store the latest frame
    latestFrame = req.file.buffer;
    frameTimestamp = new Date();

    // Notify all connected WebSocket clients
    notifyClients(latestFrame);

    res.status(200).json({
      status: 'success',
      message: 'Frame received successfully',
      timestamp: frameTimestamp.toISOString(),
      size: req.file.size
    });

  } catch (error) {
    console.error('Error processing frame:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get latest frame endpoint
const getLatestFrame = (req, res) => {
  try {
    if (!latestFrame) {
      return res.status(404).json({
        error: 'No frame available',
        message: 'No video frame has been received yet'
      });
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(latestFrame);

  } catch (error) {
    console.error('Error sending frame:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get video stream info
const getStreamInfo = (req, res) => {
  try {
    res.status(200).json({
      status: 'active',
      hasFrame: latestFrame !== null,
      lastUpdate: frameTimestamp ? frameTimestamp.toISOString() : null,
      frameSize: latestFrame ? latestFrame.length : 0,
      connectedClients: global.io ? global.io.engine.clientsCount : 0
    });
  } catch (error) {
    console.error('Error getting stream info:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Upload video frame endpoint (raw data for wget compatibility)
const uploadFrameRaw = async (req, res) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({
        error: 'No image data provided',
        message: 'Please send JPEG image data in the request body'
      });
    }

    // Store the latest frame
    latestFrame = Buffer.from(req.body);
    frameTimestamp = new Date();

    // Update statistics
    frameStats.totalFrames++;
    frameStats.totalSize += latestFrame.length;
    
    // Calculate FPS every second
    const now = Date.now();
    if (now - frameStats.lastFpsCalculation > 1000) {
      frameStats.avgFps = frameStats.totalFrames / ((now - frameStats.lastFpsCalculation) / 1000);
      frameStats.lastFpsCalculation = now;
    }

    // Notify all connected WebSocket clients (non-blocking)
    notifyClients(latestFrame);

    // Send minimal response for speed
    res.status(200).json({
      status: 'ok',
      frame: frameStats.totalFrames,
      size: latestFrame.length
    });

  } catch (error) {
    console.error('Error processing raw frame:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  uploadFrame: [upload.single('frame'), uploadFrame],
  uploadFrameRaw,
  getLatestFrame,
  getStreamInfo
};
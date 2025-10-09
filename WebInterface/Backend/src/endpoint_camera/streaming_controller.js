const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuración de streaming MJPEG
let streamingDevices = new Map(); // Para rastrear dispositivos activos
let streamStats = {
  activeStreams: 0,
  totalConnections: 0,
  startTime: Date.now()
};

// Registrar un dispositivo de streaming
const registerStreamingDevice = (req, res) => {
  try {
    const { deviceId, ip, port, resolution, quality } = req.body;
    
    if (!deviceId || !ip || !port) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['deviceId', 'ip', 'port']
      });
    }

    const streamInfo = {
      deviceId,
      ip,
      port: parseInt(port),
      resolution: resolution || '320x240',
      quality: quality || 'fast',
      registeredAt: new Date(),
      lastSeen: new Date(),
      streamUrl: `http://${ip}:${port}`,
      proxyPath: `/api/camera/stream/${deviceId}`
    };

    streamingDevices.set(deviceId, streamInfo);
    streamStats.activeStreams = streamingDevices.size;

    console.log(`📹 Registered streaming device: ${deviceId} at ${ip}:${port}`);

    res.status(200).json({
      status: 'success',
      message: 'Streaming device registered',
      streamInfo,
      proxyUrl: `http://${req.get('host')}/api/camera/stream/${deviceId}`
    });

  } catch (error) {
    console.error('Error registering streaming device:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Obtener información de streams activos
const getStreamInfo = (req, res) => {
  try {
    const devices = Array.from(streamingDevices.values()).map(device => ({
      ...device,
      isActive: (Date.now() - device.lastSeen.getTime()) < 30000 // Activo si se vio en últimos 30s
    }));

    res.status(200).json({
      status: 'active',
      stats: {
        ...streamStats,
        uptime: Date.now() - streamStats.startTime
      },
      devices,
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.isActive).length
    });

  } catch (error) {
    console.error('Error getting stream info:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Middleware para proxy del stream MJPEG
const createStreamProxy = (deviceId) => {
  const device = streamingDevices.get(deviceId);
  
  if (!device) {
    return (req, res) => {
      res.status(404).json({
        error: 'Device not found',
        message: `Streaming device '${deviceId}' not registered`
      });
    };
  }

  // Actualizar última vez visto
  device.lastSeen = new Date();
  streamStats.totalConnections++;

  console.log(`🎥 Proxying stream for device: ${deviceId} to ${device.streamUrl}`);

  return createProxyMiddleware({
    target: device.streamUrl,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error(`Stream proxy error for ${deviceId}:`, err.message);
      res.status(502).json({
        error: 'Stream unavailable',
        message: `Cannot connect to streaming device: ${err.message}`
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`📡 Streaming request for ${deviceId}: ${req.method} ${req.url}`);
    }
  });
};

// Endpoint dinámico para streams
const handleStreamRequest = (req, res, next) => {
  const deviceId = req.params.deviceId;
  
  if (!deviceId) {
    return res.status(400).json({
      error: 'Device ID required',
      message: 'Specify device ID in URL: /api/camera/stream/{deviceId}'
    });
  }

  const proxyMiddleware = createStreamProxy(deviceId);
  proxyMiddleware(req, res, next);
};

// Heartbeat para mantener dispositivos activos
const deviceHeartbeat = (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = streamingDevices.get(deviceId);

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device '${deviceId}' not registered`
      });
    }

    device.lastSeen = new Date();

    res.status(200).json({
      status: 'ok',
      deviceId,
      lastSeen: device.lastSeen
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Cleanup de dispositivos inactivos
setInterval(() => {
  const now = Date.now();
  const timeout = 60000; // 1 minuto

  for (const [deviceId, device] of streamingDevices.entries()) {
    if (now - device.lastSeen.getTime() > timeout) {
      console.log(`🗑️ Removing inactive device: ${deviceId}`);
      streamingDevices.delete(deviceId);
    }
  }

  streamStats.activeStreams = streamingDevices.size;
}, 30000); // Cleanup cada 30 segundos

module.exports = {
  registerStreamingDevice,
  getStreamInfo,
  handleStreamRequest,
  deviceHeartbeat
};
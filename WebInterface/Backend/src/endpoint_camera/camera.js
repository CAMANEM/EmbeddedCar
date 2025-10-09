const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Import controllers
const {
  uploadFrame,
  uploadFrameRaw,
  getLatestFrame,
  getStreamInfo
} = require('./camera_controller');

const {
  registerStreamingDevice,
  getStreamInfo: getStreamingInfo,
  handleStreamRequest,
  deviceHeartbeat
} = require('./streaming_controller');

// Define routes

// Upload frame from Raspberry Pi (multipart/form-data)
router.post('/camera/upload', uploadFrame);

// Upload frame from Raspberry Pi (raw data for wget)
router.post('/camera/upload-raw', uploadFrameRaw);

// Recibir video stream continuo desde video_streamer.c
router.post('/video/stream', (req, res) => {
    console.log('📹 Receiving video stream from video_streamer.c');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Frame-Source:', req.headers['x-frame-source']);
    console.log('Frame-Number:', req.headers['x-frame-number']);
    
    // Headers de respuesta inmediata
    res.status(200).json({
        status: 'receiving',
        message: 'Video stream accepted',
        timestamp: new Date().toISOString()
    });
    
    // Para frames individuales (video_streamer_simple)
    if (req.headers['x-frame-number']) {
        const frameNumber = parseInt(req.headers['x-frame-number']) || 0;
        const frameFile = path.join(__dirname, '../../temp/latest_stream_frame.jpg');
        
        // Crear directorio si no existe
        const tempDir = path.dirname(frameFile);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Guardar frame directamente
        if (req.body && req.body.length > 0) {
            fs.writeFileSync(frameFile, req.body);
            
            // Notificar via WebSocket
            if (global.io) {
                global.io.emit('new-stream-frame', {
                    frameNumber: frameNumber,
                    timestamp: new Date().toISOString(),
                    size: req.body.length,
                    source: req.headers['x-frame-source'] || 'video_streamer'
                });
            }
            
            if (frameNumber % 10 === 0) {
                console.log(`📹 Individual frame ${frameNumber} saved (${req.body.length} bytes)`);
            }
        }
        return;
    }
    
    // Procesar el stream continuo (modo original)
    let frameCount = 0;
    let lastFrame = null;
    
    req.on('data', (chunk) => {
        frameCount++;
        lastFrame = chunk;
        
        // Guardar último frame para la web
        const frameFile = path.join(__dirname, '../../temp/latest_stream_frame.jpg');
        
        // Crear directorio si no existe
        const tempDir = path.dirname(frameFile);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Intentar extraer JPEG del chunk
        try {
            // Buscar inicio de JPEG (FF D8)
            const jpegStart = chunk.indexOf(Buffer.from([0xFF, 0xD8]));
            // Buscar fin de JPEG (FF D9)
            const jpegEnd = chunk.indexOf(Buffer.from([0xFF, 0xD9]));
            
            if (jpegStart !== -1 && jpegEnd !== -1 && jpegEnd > jpegStart) {
                const jpegData = chunk.slice(jpegStart, jpegEnd + 2);
                fs.writeFileSync(frameFile, jpegData);
                
                // Notificar via WebSocket
                if (global.io) {
                    global.io.emit('new-stream-frame', {
                        frameNumber: frameCount,
                        timestamp: new Date().toISOString(),
                        size: jpegData.length,
                        source: 'video_streamer'
                    });
                }
                
                if (frameCount % 30 === 0) {
                    console.log(`📹 Stream frames received: ${frameCount}`);
                }
            }
        } catch (error) {
            // Si no es un JPEG válido, guardar el chunk completo
            fs.writeFileSync(frameFile, chunk);
        }
    });
    
    req.on('end', () => {
        console.log(`📹 Stream ended. Total frames: ${frameCount}`);
    });
    
    req.on('error', (error) => {
        console.error('📹 Stream error:', error);
    });
});

// MJPEG Streaming endpoints
router.post('/camera/register-stream', registerStreamingDevice);
router.get('/camera/stream/:deviceId', handleStreamRequest);
router.post('/camera/heartbeat/:deviceId', deviceHeartbeat);
router.get('/camera/streaming-info', getStreamingInfo);

// Get latest frame as JPEG
router.get('/camera/frame', getLatestFrame);

// Obtener último frame del video stream
router.get('/video/latest-frame', (req, res) => {
    const frameFile = path.join(__dirname, '../../temp/latest_stream_frame.jpg');
    
    if (fs.existsSync(frameFile)) {
        const stats = fs.statSync(frameFile);
        const frameAge = Date.now() - stats.mtime.getTime();
        
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Frame-Age': frameAge,
            'X-Frame-Size': stats.size
        });
        
        res.sendFile(frameFile);
    } else {
        res.status(404).json({
            error: 'No stream frame available',
            message: 'Start video_streamer.c to receive frames'
        });
    }
});

// Get stream information
router.get('/camera/info', getStreamInfo);

// Servir archivos Simple Stream estáticos
router.use('/simple', express.static('/tmp/simple_stream', {
    setHeaders: (res, path) => {
        if (path.endsWith('.m3u8')) {
            res.set({
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*'
            });
        } else if (path.endsWith('.jpg')) {
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
        }
    }
}));

// Servir archivos HLS estáticos
router.use('/hls', express.static('/tmp/hls_stream', {
    setHeaders: (res, path) => {
        if (path.endsWith('.m3u8')) {
            res.set({
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*'
            });
        } else if (path.endsWith('.ts')) {
            res.set({
                'Content-Type': 'video/mp2t',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
        }
    }
}));

// Proxy HLS stream desde Raspberry Pi
router.get('/camera/hls-proxy/:file', (req, res) => {
    const rpi_ip = req.query.ip || '192.168.0.111';
    const file = req.params.file;
    const hls_url = `http://${rpi_ip}:3000/hls/${file}`;
    
    console.log(`📹 Proxying HLS file: ${hls_url}`);
    
    try {
        const url = new URL(hls_url);
        const proxyRequest = http.get({
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            headers: {
                'User-Agent': 'Node.js-HLS-Proxy/1.0'
            }
        }, (proxyRes) => {
            // Set appropriate headers for HLS content
            if (file.endsWith('.m3u8')) {
                res.set({
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Access-Control-Allow-Origin': '*'
                });
            } else if (file.endsWith('.ts')) {
                res.set({
                    'Content-Type': 'video/mp2t',
                    'Cache-Control': 'public, max-age=60',
                    'Access-Control-Allow-Origin': '*'
                });
            }
            
            // Pipe the content
            proxyRes.pipe(res);
            
            proxyRes.on('error', (err) => {
                console.error('❌ HLS proxy error:', err.message);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'HLS content error' });
                }
            });
            
        });
        
        proxyRequest.on('error', (err) => {
            console.error('❌ Cannot connect to HLS source:', err.message);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Cannot connect to HLS source' });
            }
        });
        
    } catch (error) {
        console.error('❌ Invalid HLS URL:', error.message);
        return res.status(400).json({ error: 'Invalid HLS URL' });
    }
});

// Proxy GStreamer TCP MJPEG stream (método más simple)
router.get('/camera/gstreamer-stream', (req, res) => {
    const rpi_ip = req.query.ip || '192.168.0.117';
    const rpi_port = req.query.port || '8080';
    
    console.log(`📹 Connecting to GStreamer TCP stream: ${rpi_ip}:${rpi_port}`);
    
    try {
        const net = require('net');
        const socket = new net.Socket();
        
        socket.connect(rpi_port, rpi_ip, () => {
            console.log('✅ Connected to GStreamer TCP stream');
            
            // Establecer headers para MJPEG stream
            res.set({
                'Content-Type': 'multipart/x-mixed-replace; boundary=--videoboundary',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Connection': 'keep-alive'
            });
            
            // Pipe the TCP stream directly to HTTP response
            socket.pipe(res);
        });
        
        socket.on('error', (err) => {
            console.error('❌ TCP stream error:', err.message);
            if (!res.headersSent) {
                res.status(502).json({
                    error: 'Cannot connect to GStreamer stream',
                    details: err.message,
                    target: `${rpi_ip}:${rpi_port}`,
                    suggestion: 'Make sure GStreamer TCP server is running on Raspberry Pi'
                });
            }
        });
        
        socket.on('close', () => {
            console.log('📹 GStreamer TCP stream closed');
            if (!res.headersSent) {
                res.end();
            }
        });
        
        // Cleanup when client disconnects
        req.on('close', () => {
            console.log('📱 Client disconnected from GStreamer stream');
            socket.destroy();
        });
        
        req.on('error', (err) => {
            console.error('❌ Client request error:', err.message);
            socket.destroy();
        });
        
    } catch (error) {
        console.error('❌ GStreamer stream setup error:', error.message);
        return res.status(500).json({
            error: 'Stream setup failed',
            details: error.message
        });
    }
});

// Proxy stream directo desde MJPEG streamer del Raspberry Pi
router.get('/camera/mjpeg-stream', (req, res) => {
    const rpi_ip = req.query.ip || '192.168.0.111';
    const rpi_port = req.query.port || '8080';
    const mjpeg_url = `http://${rpi_ip}:${rpi_port}/stream`;
    
    console.log(`📹 Proxying MJPEG stream from: ${mjpeg_url}`);
    
    try {
        const url = new URL(mjpeg_url);
        const proxyRequest = http.get({
            hostname: url.hostname,
            port: url.port || 8080,
            path: '/stream',
            headers: {
                'User-Agent': 'Node.js-MJPEG-Proxy/1.0',
                'Connection': 'keep-alive'
            }
        }, (proxyRes) => {
            // Verificar que es un stream MJPEG válido
            const contentType = proxyRes.headers['content-type'];
            if (!contentType || !contentType.includes('multipart/x-mixed-replace')) {
                console.error('❌ Invalid MJPEG stream content type:', contentType);
                return res.status(502).json({ 
                    error: 'Invalid stream format',
                    expected: 'multipart/x-mixed-replace',
                    received: contentType
                });
            }
            
            // Establecer headers para MJPEG con CORS
            res.set({
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Connection': 'keep-alive'
            });
            
            console.log('✅ MJPEG stream connected, proxying...');
            
            // Pipear el stream directamente
            proxyRes.pipe(res);
            
            proxyRes.on('error', (err) => {
                console.error('❌ MJPEG stream error:', err.message);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Stream error', details: err.message });
                }
            });
            
            proxyRes.on('end', () => {
                console.log('📹 MJPEG stream ended');
            });
        });
        
        proxyRequest.on('error', (err) => {
            console.error('❌ Cannot connect to MJPEG streamer:', err.message);
            if (!res.headersSent) {
                res.status(502).json({ 
                    error: 'Cannot connect to MJPEG streamer',
                    details: err.message,
                    url: mjpeg_url,
                    suggestion: 'Make sure mjpeg_streamer is running on Raspberry Pi'
                });
            }
        });
        
        proxyRequest.setTimeout(5000, () => {
            console.error('❌ MJPEG connection timeout');
            proxyRequest.destroy();
            if (!res.headersSent) {
                res.status(504).json({ error: 'Connection timeout', url: mjpeg_url });
            }
        });
        
        // Cleanup cuando el cliente se desconecta
        req.on('close', () => {
            console.log('📱 Client disconnected from MJPEG stream');
            proxyRequest.destroy();
        });
        
        req.on('error', (err) => {
            console.error('❌ Client request error:', err.message);
            proxyRequest.destroy();
        });
        
    } catch (error) {
        console.error('❌ Invalid MJPEG URL:', error.message);
        return res.status(400).json({ 
            error: 'Invalid URL format', 
            url: mjpeg_url,
            details: error.message
        });
    }
});

// Proxy stream directo (para casos donde CORS es un problema)
router.get('/camera/proxy-stream', (req, res) => {
    const targetUrl = req.query.target;
    
    if (!targetUrl) {
        return res.status(400).json({ error: 'Target URL is required' });
    }
    
    console.log('Proxying stream to:', targetUrl);
    
    try {
        const url = new URL(targetUrl);
        const proxyRequest = http.get({
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            headers: {
                'User-Agent': 'Node.js-Stream-Proxy/1.0'
            }
        }, (proxyRes) => {
            // Establecer headers apropiados para MJPEG
            res.set({
                'Content-Type': proxyRes.headers['content-type'] || 'multipart/x-mixed-replace; boundary=--boundary',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            
            // Pipear el stream
            proxyRes.pipe(res);
            
            proxyRes.on('error', (err) => {
                console.error('Proxy response error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Stream error' });
                }
            });
        });
        
        proxyRequest.on('error', (err) => {
            console.error('Proxy request error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Cannot connect to stream' });
            }
        });
        
        // Cleanup cuando el cliente se desconecta
        req.on('close', () => {
            proxyRequest.destroy();
        });
        
    } catch (error) {
        console.error('Invalid target URL:', error);
        return res.status(400).json({ error: 'Invalid target URL' });
    }
});

// UDP Video Streaming endpoints
router.post('/camera/udp/start', (req, res) => {
    const port = req.body.port || 5000;
    
    try {
        const started = startUDPReceiver(port);
        if (started) {
            res.json({
                success: true,
                message: `UDP Video Receiver started on port ${port}`,
                port: port,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'UDP receiver already running or failed to start'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting UDP receiver',
            error: error.message
        });
    }
});

router.post('/camera/udp/stop', (req, res) => {
    try {
        const stopped = stopUDPReceiver();
        res.json({
            success: stopped,
            message: stopped ? 'UDP receiver stopped' : 'UDP receiver was not running',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error stopping UDP receiver',
            error: error.message
        });
    }
});

router.get('/camera/udp/stats', (req, res) => {
    try {
        const stats = getUDPStats();
        res.json({
            success: true,
            stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting UDP stats',
            error: error.message
        });
    }
});

router.get('/camera/udp/frame', (req, res) => {
    try {
        const frameInfo = getLatestUDPFrame();
        
        if (frameInfo.exists) {
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Frame-Age': frameInfo.age,
                'X-Frame-Size': frameInfo.size
            });
            
            res.sendFile(frameInfo.file);
        } else {
            res.status(404).json({
                success: false,
                message: frameInfo.message || 'No UDP frame available'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting UDP frame',
            error: error.message
        });
    }
});

// Health check
router.get('/camera/?', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Camera API is running.',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/camera/upload': 'Upload video frame from Raspberry Pi (multipart)',
      'POST /api/camera/upload-raw': 'Upload video frame from Raspberry Pi (raw)',
      'GET /api/camera/frame': 'Get latest video frame as JPEG',
      'GET /api/camera/info': 'Get frame-based streaming information',
      'GET /api/camera/mjpeg-stream?ip=192.168.0.111&port=8080': 'Proxy MJPEG stream from Raspberry Pi',
      'GET /api/camera/gstreamer-stream?ip=192.168.0.117&port=8080': 'Proxy GStreamer TCP MJPEG stream (recommended)',
      'GET /api/camera/hls-proxy/{file}?ip=192.168.0.111': 'Proxy HLS files (.m3u8, .ts) from Raspberry Pi',
      'GET /hls/{file}': 'Serve HLS files directly from /tmp/hls_stream',
      'POST /api/camera/register-stream': 'Register MJPEG streaming device',
      'GET /api/camera/stream/{deviceId}': 'Proxy MJPEG stream from device',
      'GET /api/camera/proxy-stream?target={url}': 'Proxy direct MJPEG stream',
      'GET /api/camera/streaming-info': 'Get MJPEG streaming information',
      'POST /api/camera/heartbeat/{deviceId}': 'Device heartbeat',
      'POST /api/video/stream': 'Receive continuous video stream from video_streamer.c',
      'GET /api/video/latest-frame': 'Get latest frame from video stream',
      'POST /api/camera/udp/start': 'Start UDP video receiver (high-speed)',
      'POST /api/camera/udp/stop': 'Stop UDP video receiver',
      'GET /api/camera/udp/stats': 'Get UDP receiver statistics',
      'GET /api/camera/udp/frame': 'Get latest UDP frame as JPEG'
    }
  });
});

module.exports = router;
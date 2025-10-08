# 🎥 GStreamer Video Streaming - Receta Yocto

## 📋 Descripción

Esta receta Yocto integra completamente el sistema de video streaming GStreamer en tu imagen de Raspberry Pi 4, proporcionando:

- ✅ **Servicio systemd** automático al arranque
- ✅ **Script de control** bash completo
- ✅ **Aplicación C++** de control avanzado
- ✅ **Configuración** centralizada
- ✅ **Logging** y monitoreo

## 📁 Estructura de la Receta

```
meta-embeddedcar/recipes-video/gstreamer-video-streaming/
├── gstreamer-video-streaming_1.0.0.bb     # Receta principal
└── files/
    ├── gstreamer-video-streaming           # Script bash principal
    ├── gstreamer-video.conf               # Archivo de configuración
    ├── gstreamer-video-streaming.service  # Servicio systemd
    ├── gstreamer_controller.cpp           # Controlador C++
    └── CMakeLists.txt                     # Build system
```

## 🚀 Instalación en Yocto

### 1. **La receta ya está incluida en tu imagen:**

```bitbake
# En: meta-embeddedcar/recipes-core/images/rpi4-embeddedcar-image.bb
IMAGE_INSTALL += "gstreamer-video-streaming"
```

### 2. **Construir la imagen:**

```bash
cd /home/camanem/EmbeddedCar/Embedded
source oe-init-build-env rpi4
bitbake rpi4-embeddedcar-image
```

### 3. **La imagen incluirá automáticamente:**

- `/usr/bin/gstreamer-video-streaming` - Script principal
- `/usr/bin/gstreamer_controller` - Controlador C++
- `/etc/gstreamer-video.conf` - Configuración
- `/lib/systemd/system/gstreamer-video-streaming.service` - Servicio
- Todas las dependencias GStreamer necesarias

## 🔧 Uso en Raspberry Pi

### **Servicio SystemD (Automático)**

```bash
# El servicio inicia automáticamente al arrancar
systemctl status gstreamer-video-streaming

# Control manual
systemctl start gstreamer-video-streaming
systemctl stop gstreamer-video-streaming
systemctl restart gstreamer-video-streaming

# Ver logs
journalctl -u gstreamer-video-streaming -f
```

### **Script Bash**

```bash
# Control directo
gstreamer-video-streaming start
gstreamer-video-streaming stop
gstreamer-video-streaming status
gstreamer-video-streaming config

# Con variables de entorno
VIDEO_PORT=8090 gstreamer-video-streaming start
VIDEO_WIDTH=1280 VIDEO_HEIGHT=720 gstreamer-video-streaming start
```

### **Controlador C++**

```bash
# Control desde aplicación C++
gstreamer_controller start
gstreamer_controller stop
gstreamer_controller status

# Con parámetros
gstreamer_controller start --port=8090 --quality=95
gstreamer_controller start --width=1280 --height=720
```

## ⚙️ Configuración

### **Archivo: `/etc/gstreamer-video.conf`**

```bash
# Video Device
VIDEO_DEVICE="/dev/video0"

# Resolution  
VIDEO_WIDTH="640"
VIDEO_HEIGHT="480"
VIDEO_FRAMERATE="30"

# Network
VIDEO_HOST="0.0.0.0"
VIDEO_PORT="8080"

# Quality
VIDEO_QUALITY="85"

# Auto-start
AUTO_START="true"
```

### **Variables de Entorno Soportadas:**

- `VIDEO_DEVICE` - Dispositivo de video
- `VIDEO_WIDTH` / `VIDEO_HEIGHT` - Resolución
- `VIDEO_FRAMERATE` - FPS
- `VIDEO_PORT` - Puerto TCP
- `VIDEO_QUALITY` - Calidad JPEG (1-100)
- `VIDEO_HOST` - Host bind

## 📊 Dependencias Incluidas

### **Runtime (RDEPENDS):**

- `gstreamer1.0` - Core GStreamer
- `gstreamer1.0-plugins-base` - Plugins básicos
- `gstreamer1.0-plugins-good` - Plugins estables
- `gstreamer1.0-plugins-bad` - Plugins experimentales
- `v4l-utils` - Video4Linux utils
- `systemd` - Service management
- `bash` - Script execution

### **Recomendadas (RRECOMMENDS):**

- `gstreamer1.0-plugins-ugly` - Plugins adicionales
- `gstreamer1.0-libav` - Codecs FFmpeg
- `gstreamer1.0-omx` - Hardware acceleration
- `kernel-module-uvcvideo` - USB camera support

## 🔍 Debugging y Logs

### **Logs del Sistema:**

```bash
# SystemD logs
journalctl -u gstreamer-video-streaming -f

# Archivo de log directo
tail -f /var/log/gstreamer-video.log

# Estado del servicio
systemctl status gstreamer-video-streaming
```

### **Verificación Manual:**

```bash
# Verificar dispositivo de video
ls -la /dev/video*

# Verificar puerto
netstat -tlpn | grep :8080

# Test GStreamer manual
gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink
```

## 🌐 Integración Web

### **Tu servidor Node.js puede consumir el stream:**

```javascript
// Endpoint ya implementado:
GET /api/camera/gstreamer-stream?ip=192.168.0.106&port=8080
```

### **Interfaz web disponible:**

```
http://localhost:3000/gstreamer_video.html
```

## 🎯 Ventajas de esta Implementación

### ✅ **Integración Completa**
- Automáticamente incluido en imagen Yocto
- Servicio systemd nativo
- Configuración centralizada

### ✅ **Producción Ready**
- Auto-start en arranque
- Logging completo
- Monitoreo systemd
- Configuración segura

### ✅ **Flexible**
- Control via systemd, bash script, o C++
- Configuración por archivo o variables
- Parámetros runtime ajustables

### ✅ **Mantenible**
- Código fuente en receta
- Versionado con imagen
- Dependencias gestionadas automáticamente

## 🔄 Proceso de Build

```bash
# 1. La receta se procesa durante bitbake
bitbake gstreamer-video-streaming

# 2. Se incluye automáticamente en la imagen
bitbake rpi4-embeddedcar-image

# 3. Al flashear e iniciar RPi4:
#    - Servicio se instala
#    - Se habilita automáticamente  
#    - Inicia en boot
#    - Stream disponible en puerto 8080
```

## ✨ **¡Completamente Automatizado!**

Con esta receta, tu Raspberry Pi 4:

1. **🚀 Arranca** con video streaming automático
2. **📡 Expone** TCP stream en puerto 8080  
3. **🔧 Permite** control completo via systemd/scripts
4. **📋 Registra** todo en logs sistemd
5. **🌐 Integra** perfectamente con tu API Node.js

**¡Tu solución de video streaming está lista para producción!** 🎬
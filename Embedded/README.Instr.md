Instructions for Building and Deploying Embedded Linux Image for Raspberry Pi 4
====


## Compilacion de imagen

Abrir entorno de desarrollo:

```bash
source oe-init-build-env rpi4
```

Compilar imagen para raspberry pi 4:

```bash
bitbake rpi4-embeddedcar-image
```

## Carga de la imagen a la microSD

Mostrar dispositivos conectados para ubicar la microSD de la raspberry pi (en este caso sdc), para cargar la imagen:

```bash
lsblk
```

Se debe desmontar la unidad para poder cargar la imagen:

```bash
sudo umount /dev/sdc*
```

Desde el directorio rpi4 con el entorno abierto; ir al directorio donde se generó la imagen:

```bash
cd tmp/deploy/images/raspberrypi4
```

Copiar la imagen en la raspberry pi 4:

```bash
sudo bmaptool copy rpi4-embeddedcar-image-raspberrypi4.rootfs.wic.bz2 /dev/sdc
```


## Conexion SSH

1. Encontrar la dirección de nuestra red para saber donde buscar la rasberry:


```bash
ip route | grep default
> default via 192.168.0.1 dev wlx28ee521c080c proto dhcp metric 600
# de la salida se tiene que la ip es 192.168.0.x

```

2. Ahora vamos a escanear los dispositivos WiFi segun la ip obtenida:

```bash 
nmap -sn 192.168.0.0/24
> Starting Nmap 7.80 ( https://nmap.org ) at 2025-09-30 11:54 CST
Nmap scan report for _gateway (192.168.0.1)
Host is up (0.0016s latency).
Nmap scan report for 192.168.0.105
Host is up (0.041s latency).
Nmap scan report for 192.168.0.108
Host is up (0.061s latency).
Nmap scan report for 192.168.0.111
Host is up (0.023s latency).
Nmap scan report for 192.168.0.112
Host is up (0.0044s latency).
Nmap scan report for camanem-H310M-S2H (192.168.0.122)
Host is up (0.000081s latency).
Nmap done: 256 IP addresses (6 hosts up) scanned in 3.33 seconds
```

3. Identificar cuál de estos dispositivos ip obtenidos es tu Raspberry Pi usando las direcciones MAC:

```bash
sudo nmap -sn 192.168.0.{105,108,111,112}
> Starting Nmap 7.80 ( https://nmap.org ) at 2025-09-30 11:57 CST
Nmap scan report for 192.168.0.105
Host is up (0.18s latency).
MAC Address: 4E:86:C7:E3:69:1D (Unknown)
Nmap scan report for 192.168.0.108
Host is up (0.071s latency).
MAC Address: C2:15:70:D9:E4:8B (Unknown)
Nmap scan report for 192.168.0.111
Host is up (0.053s latency).
MAC Address: DC:A6:32:BE:0C:7A (Raspberry Pi Trading)
Nmap scan report for 192.168.0.112
Host is up (0.16s latency).
MAC Address: 5A:41:3B:82:A9:A6 (Unknown)
Nmap done: 4 IP addresses (4 hosts up) scanned in 1.95 seconds
```

4. Con lo que se puede ver que la ip de rpi es 192.168.0.111
Finalmente se establece conexion ssh con la rpi con su ip:

```bash
ssh root@192.168.0.111
```

Nota: En algunos casos en los que se haya conectado ya desde una misma ip y se desea reconectar, puede que se encuentre un error porque cambió la key. Para solucionarlo se debe borrar la key almacenada en el pc para esa ip (cambiar camanem por su nombre de usuario):

```bash
ssh-keygen -f "/home/camanem/.ssh/known_hosts" -R "192.168.0.111"
```

## Probar la bliblioteca cargada automáticamente

Entrar al directorio root:

```bash
cd /
```

Ir a la ubicación:

```bash
cd usr/bin
```

Ejecutar la aplicación:

```bash
./video_streamer http://192.168.0.122:3000 10
```


# Test directo sin programa
```bash
# Test directo sin programa
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,format=YUY2,width=640,height=480,framerate=30/1 ! videoconvert ! videoscale ! video/x-raw,width=320,height=240 ! jpegenc quality=20 ! multipartmux boundary="--videoboundary" ! curlhttpsink location="http://192.168.0.122:3000/api/video/stream"
```


# Stream directo al API
./video_streamer http://192.168.0.122:3000/api/video/stream fast 320x240

# O para frames individuales
./video_streamer http://192.168.0.122:3000/api/video/frame fast 320x240


./video_streamer_simple http://192.168.0.122:3000/api/video/stream fast 5
./video_streamer_simple http://192.168.0.122:3000/api/video/stream fast 20

./video_streamer_simple http://192.168.0.122:3000/api/video/stream medium 10

./mjpeg_streamer 8080 50 15

http://192.168.0.122:3000/mjpeg_direct.html

./mjpeg_streamer 8080 50 15


curl -X POST http://localhost:3000/api/camera/udp/start -H "Content-Type: application/json" -d '{"port": 5000}'

curl -X POST http://localhost:3000/api/camera/udp/start

curl -X POST http://localhost:3000/api/camera/udp/start


http://localhost:3000/gstreamer_video.html


Pendiente:
* Hacer commit de seguridad
* Revisar que todo se instale desde la imagen y no se necesite sh.
* Mejorar comentarios 
* Mejorar detension forzada de streaming desde rpi ssh para desarrollo.


Dormir
Hacer lo del codigo de arqui y commit
Hacer commit del RC

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

1. Encontrar la dirección IP de tu RPi4:


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

## Probar la bliblioteca cargada automáticamente

Ir a la ubicación:

```bash
cd usr/bin
```

Ejecutar la aplicación:

```bash
./gpio_controller
```

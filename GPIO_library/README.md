# Biblioteca GPIO para Raspberry Pi usando raspi-gpio

Este directorio se utiliza principalmente para pruebas, compilando manual y unicamente las bilbiotecas y copiandolas a la microSD. 
La imagen de yocto ya compila e instala las bibliotecas automaticamente en la imagen.

## Estructura del Proyecto

```
GPIO_library/
├── include/
│   └── gpio_lib.h          # Archivo de cabecera
├── lib/
│   └── gpio_lib.c          # Implementación de la biblioteca
├── build/                  # Archivos compilados
├── gpio_controller.c          # Ejemplo de uso
├── Makefile               # Sistema de compilación
└── README.md              # Este archivo
```

## Funciones Disponibles

### `pinMode(int pin, Mode_t mode)`
Configura el modo de un pin GPIO.

**Modos disponibles:**
- `INPUT` - Entrada
- `OUTPUT` - Salida

### `digitalWrite(int pin, state_t state)`
Escribe un valor a un pin configurado como salida.

**Estados:**
- `LOW` - Nivel bajo (0V)
- `HIGH` - Nivel alto (3.3V)

### `digitalRead(int pin)`
Lee el estado actual de un pin.

**Retorna:**
- `HIGH` (1) - Pin en nivel alto
- `LOW` (0) - Pin en nivel bajo
- `-1` - Error


## Compilación y en instalación

### Compilación:

1. Se debe estar en el directorio principal de la biblioteca:
```bash
cd GPIO_library/ 
```

2.  Iniciar ambiente de compilación en el directorio, utilizando el toolchain:
```bash
source /opt/poky/5.0.10/environment-setup-cortexa7t2hf-neon-vfpv4-poky-linux-gnueabi
```

3. Crear los directorios necesarios y moverse al directorio build:

```bash
mkdir build && cd build && mkdir usr
```
4. Indicar la ruta de instalación personalizada (asegurarse de adaptar a la ruta de su pc):

```bash
cmake ../ -DCMAKE_INSTALL_PREFIX:PATH=/home/camanem/EmbeddedCar/GPIO_library/build/usr
```

5. Realizar la compilación para la rpi mediante los make:

```bash
make
```
```bash
make install
```

### Instalar en la raspberry pi 4

Para realizar la instalación se debe copiar el directorio usr donde se realizó la compilación, en la rpi. Se recomienda cambiarle el nombre al directorio a usr para poder pegarla en el directorio root solo por simplicidad de acceso y para que no haya problema con el directorio usr propio de rpi. Para el siguiente comando se cambió el nombre del directorio a usr_gpiolib

El comando para copiar archivo a la microSD de rpi que ya tiene la imagen cargada sería en siguiente (modificar el path segun su sistema):

```bash
sudo cp -r "/home/camanem/EmbeddedCar/GPIO_library/build/usr_gpiolib" /media/camanem/root/ 
```

Ahora se debe insertar la microSD en la rpi, encenderla y correr el siguiente comando en la rpi para dar a acceso a la biblioteca dinámica:

```bash
export LD_LIBRARY_PATH=/usr_gpiolib/lib
```

### Alternativa Opcional
una alternativa al comando export anterior es copiar el .so en una ubicacion del sistema de la rpi (modificar path):

```bash
sudo cp "/home/camanem/EmbeddedCar/GPIO_library/build/usr/build/usr_gpiolib/lib/gpiolib.so" /media/camanem/root/usr/lib/
```

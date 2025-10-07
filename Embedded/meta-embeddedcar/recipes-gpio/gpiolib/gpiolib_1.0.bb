SUMMARY = "GPIO Library for Raspberry Pi 4"
DESCRIPTION = "Custom GPIO control library using raspi-gpio for embedded car project"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# Version information
PV = "2.0"
PR = "r1"

# Source location - usando archivos locales
SRC_URI = "file://gpio_controller.c \
           file://CMakeLists.txt \
           file://lib/gpio_lib.c \
           file://lib/CMakeLists.txt \
           file://include/gpio_lib.h"

# No verificar checksums para archivos locales
SRC_URI[md5sum] = ""
SRC_URI[sha256sum] = ""

# Directorios de trabajo
S = "${WORKDIR}"
B = "${WORKDIR}/build"

# Dependencias
DEPENDS = "cmake-native json-c"
RDEPENDS:${PN} = "raspi-gpio json-c wget"

# Herramientas de build
inherit cmake

# Configuración de instalación
FILES:${PN} = "${bindir}/gpio_controller ${libdir}/libgpiolib.so*"
FILES:${PN}-dev = "${includedir}/gpio_lib.h ${libdir}/pkgconfig/*"
FILES:${PN}-staticdev = "${libdir}/libgpiolib.a"

# Paquetes generados
PACKAGES = "${PN} ${PN}-dev ${PN}-staticdev ${PN}-dbg"

# Corregir dependencias de paquetes
RDEPENDS:${PN}-dev = "${PN} (= ${EXTENDPKGV})"

# Configuración adicional para el build
EXTRA_OECMAKE = ""

# Desactivar verificaciones QA problemáticas para bibliotecas pequeñas
INSANE_SKIP:${PN} = "dev-so"

# Instalación personalizada si es necesaria
do_install:append() {
    # Crear directorios si no existen
    install -d ${D}${bindir}
    install -d ${D}${libdir}
    install -d ${D}${includedir}
    
    # Los archivos deberían instalarse automáticamente por CMake
    # pero podemos forzar la instalación si es necesario
}
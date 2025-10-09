FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

# Force WiFi kernel configuration
SRC_URI += "file://wifi.cfg"

# Force PWM kernel configuration - CRÍTICO para habilitar PWM
SRC_URI += "file://pwm.cfg"

# Comentado temporalmente para evitar errores de compilación
# SRC_URI += "file://embeddedcar-pwm.dts"

# Compilar el overlay
# do_compile:append() {
#     # Compilar el device tree overlay
#     ${STAGING_BINDIR_NATIVE}/dtc -@ -I dts -O dtb -o ${B}/embeddedcar-pwm.dtbo ${WORKDIR}/embeddedcar-pwm.dts
# }

# Instalar el overlay en la imagen
# do_install:append() {
#     install -d ${D}/boot/overlays
#     install -m 0644 ${B}/embeddedcar-pwm.dtbo ${D}/boot/overlays/
# }

# Agregar archivos al paquete
# FILES:${PN} += "/boot/overlays/embeddedcar-pwm.dtbo"

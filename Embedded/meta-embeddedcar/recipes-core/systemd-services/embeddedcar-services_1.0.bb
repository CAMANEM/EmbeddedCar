SUMMARY = "EmbeddedCar SystemD Services"
DESCRIPTION = "Auto-start services for GPIO and GStreamer controllers"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# Version information  
PV = "1.0"
PR = "r1"

SRC_URI = " \
    file://gpio-controller.service \
    file://gstreamer-controller.service \
"

S = "${WORKDIR}"

inherit systemd

SYSTEMD_PACKAGES = "${PN}"
SYSTEMD_SERVICE:${PN} = " \
    gpio-controller.service \
    gstreamer-controller.service \
"

SYSTEMD_AUTO_ENABLE = "enable"

do_install() {
    # Install systemd service files
    install -d ${D}${systemd_unitdir}/system
    install -m 0644 ${WORKDIR}/gpio-controller.service ${D}${systemd_unitdir}/system/
    install -m 0644 ${WORKDIR}/gstreamer-controller.service ${D}${systemd_unitdir}/system/
}

FILES:${PN} += " \
    ${systemd_unitdir}/system/gpio-controller.service \
    ${systemd_unitdir}/system/gstreamer-controller.service \
"

# Asegurar que se ejecute después de que la red esté disponible
RDEPENDS:${PN} += "systemd"
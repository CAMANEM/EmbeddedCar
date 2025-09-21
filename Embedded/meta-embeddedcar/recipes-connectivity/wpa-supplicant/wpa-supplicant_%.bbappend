FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI += "file://wpa_supplicant-wlan0.conf"

do_install:append() {
    # Instalar configuración WiFi para systemd
    install -d ${D}${sysconfdir}/wpa_supplicant
    install -m 600 ${WORKDIR}/wpa_supplicant-wlan0.conf ${D}${sysconfdir}/wpa_supplicant/wpa_supplicant-wlan0.conf
    
    # Crear enlace simbólico para autostart
    install -d ${D}${sysconfdir}/systemd/system/multi-user.target.wants
    ln -sf /lib/systemd/system/wpa_supplicant@.service \
        ${D}${sysconfdir}/systemd/system/multi-user.target.wants/wpa_supplicant@wlan0.service
}

FILES:${PN} += "${sysconfdir}/wpa_supplicant/wpa_supplicant-wlan0.conf"
FILES:${PN} += "${sysconfdir}/systemd/system/multi-user.target.wants/wpa_supplicant@wlan0.service"

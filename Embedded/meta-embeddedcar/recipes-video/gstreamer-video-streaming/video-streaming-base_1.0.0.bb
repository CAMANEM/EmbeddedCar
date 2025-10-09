SUMMARY = "Video Streaming Service for Embedded Car (Ultra Minimal)"
DESCRIPTION = "Basic video streaming script that works without GStreamer dependencies for testing"

LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# Version and revision
PV = "1.0.0"
PR = "r3"

# Source files (script, config, and installer)
SRC_URI = "file://gstreamer-video-streaming \
           file://gstreamer-video.conf \
           file://install-gstreamer.sh"

# Working directories
S = "${WORKDIR}"

# Ultra minimal dependencies - only bash
RDEPENDS:${PN} = "bash"

# Package configuration
PACKAGES = "${PN}"

# File installation paths
FILES:${PN} = "\
    ${bindir}/gstreamer-video-streaming \
    ${bindir}/install-gstreamer.sh \
    ${sysconfdir}/gstreamer-video.conf \
    ${localstatedir}/log \
"

# Manual installation
do_install() {
    # Create directories
    install -d ${D}${bindir}
    install -d ${D}${sysconfdir}
    install -d ${D}${localstatedir}/log
    
    # Install script and config
    install -m 755 ${WORKDIR}/gstreamer-video-streaming ${D}${bindir}/
    install -m 755 ${WORKDIR}/install-gstreamer.sh ${D}${bindir}/
    install -m 644 ${WORKDIR}/gstreamer-video.conf ${D}${sysconfdir}/
}

# Post-installation message
pkg_postinst:${PN}() {
    #!/bin/sh
    if [ -n "$D" ]; then
        exit 0
    fi
    
    echo "🎥 Video Streaming Service installed"
    echo "📋 Configuration: /etc/gstreamer-video.conf"
    echo "🎯 Usage: gstreamer-video-streaming [start|stop|status]"
    echo ""
    echo "⚡ Quick setup:"
    echo "   install-gstreamer.sh    # Install GStreamer packages"
    echo "   gstreamer-video-streaming start    # Start streaming"
    echo ""
    echo "🌐 Your API can then connect to: tcp://192.168.0.106:8080"
}

# Architecture compatibility
COMPATIBLE_MACHINE = "raspberrypi4"
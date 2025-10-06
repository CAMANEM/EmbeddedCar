SUMMARY = "GStreamer Video Streaming Service for Embedded Car (Minimal)"
DESCRIPTION = "Minimal GStreamer-based video streaming solution for testing"

LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# Version and revision
PV = "1.0.0"
PR = "r2"

# Source files (minimal set)
SRC_URI = "file://gstreamer-video-streaming \
           file://gstreamer-video.conf"

# Working directories
S = "${WORKDIR}"

# Minimal dependencies only
RDEPENDS:${PN} = "bash"

# Build system - no inheritance to avoid dependency issues
# inherit 

# Package configuration
PACKAGES = "${PN}"

# File installation paths (minimal)
FILES:${PN} = "\
    ${bindir}/gstreamer-video-streaming \
    ${sysconfdir}/gstreamer-video.conf \
"

# Manual installation without cmake
do_install() {
    # Create directories
    install -d ${D}${bindir}
    install -d ${D}${sysconfdir}
    
    # Install script and config
    install -m 755 ${WORKDIR}/gstreamer-video-streaming ${D}${bindir}/
    install -m 644 ${WORKDIR}/gstreamer-video.conf ${D}${sysconfdir}/
}

# Simple post-installation
pkg_postinst:${PN}() {
    #!/bin/sh
    if [ -n "$D" ]; then
        exit 0
    fi
    
    echo "🎥 GStreamer Video Streaming installed"
    echo "📋 Configuration: /etc/gstreamer-video.conf"
    echo "🎯 Usage: gstreamer-video-streaming [start|stop|status]"
}

# Architecture compatibility
COMPATIBLE_MACHINE = "raspberrypi4"
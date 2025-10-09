SUMMARY = "GStreamer Video Streaming Service for Embedded Car"
DESCRIPTION = "Complete GStreamer-based video streaming solution with TCP MJPEG output, \
systemd service, and C++ controller application for Raspberry Pi 4 embedded car project."

LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# Version and revision
PV = "1.0.0"
PR = "r3"

# Source files
SRC_URI = "file://gstreamer-video-streaming \
           file://gstreamer-video.conf \
           file://gstreamer-video-streaming.service \
           file://gstreamer_controller.cpp \
           file://CMakeLists.txt"

# Working directories
S = "${WORKDIR}"
B = "${WORKDIR}/build"

# Build dependencies (minimal)
DEPENDS = "cmake-native"

# Runtime dependencies (now available from meta-multimedia)
RDEPENDS:${PN} = "\
    gstreamer1.0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    bash \
"

# Optional systemd support
RDEPENDS:${PN} += "\
    ${@bb.utils.contains('DISTRO_FEATURES', 'systemd', 'systemd', '', d)} \
"

# Recommended packages (optional)
RRECOMMENDS:${PN} = "\
    gstreamer1.0-plugins-bad \
    kernel-module-uvcvideo \
    v4l-utils \
"

# Build system
inherit cmake

# SystemD configuration (conditional)
inherit ${@bb.utils.contains('DISTRO_FEATURES', 'systemd', 'systemd', '', d)}

# Feature requirements
inherit features_check

# SystemD configuration
SYSTEMD_SERVICE:${PN} = "${@bb.utils.contains('DISTRO_FEATURES', 'systemd', 'gstreamer-video-streaming.service', '', d)}"
SYSTEMD_AUTO_ENABLE:${PN} = "${@bb.utils.contains('DISTRO_FEATURES', 'systemd', 'enable', '', d)}"

# Package configuration
PACKAGES = "${PN} ${PN}-dev ${PN}-dbg"

# File installation paths
FILES:${PN} = "\
    ${bindir}/gstreamer-video-streaming \
    ${bindir}/gstreamer_controller \
    ${sysconfdir}/gstreamer-video.conf \
"

# Add systemd service file only if systemd is enabled
FILES:${PN} += "\
    ${@bb.utils.contains('DISTRO_FEATURES', 'systemd', '${systemd_system_unitdir}/gstreamer-video-streaming.service', '', d)} \
"

FILES:${PN}-dev = "\
    ${includedir} \
"

FILES:${PN}-dbg = "\
    ${bindir}/.debug \
    ${libdir}/.debug \
    /usr/lib/debug \
    /usr/src/debug \
"

# Configuration
CONFFILES:${PN} = "${sysconfdir}/gstreamer-video.conf"

# CMake configuration
EXTRA_OECMAKE = "\
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=${prefix} \
    -DCMAKE_SKIP_RPATH=ON \
    -DCMAKE_INSTALL_SYSCONFDIR=${sysconfdir} \
"

# Post-installation tasks
do_install:append() {
    # Set correct permissions for scripts
    chmod 755 ${D}${bindir}/gstreamer-video-streaming
    
    # Install systemd service file only if systemd is enabled
    if ${@bb.utils.contains('DISTRO_FEATURES', 'systemd', 'true', 'false', d)}; then
        install -d ${D}${systemd_system_unitdir}
        install -m 644 ${WORKDIR}/gstreamer-video-streaming.service ${D}${systemd_system_unitdir}/
    fi
    
    # Note: CMake will handle the main installation via do_install
}

# Package installation hooks
pkg_postinst:${PN}() {
    #!/bin/sh
    
    # Add user to video group if not already
    if [ -n "$D" ]; then
        # Cross-compilation - defer to first boot
        exit 0
    fi
    
    # Native installation
    echo "🎥 Setting up GStreamer Video Streaming Service..."
    
    # Create log directory with correct permissions
    mkdir -p /var/log
    chmod 755 /var/log
    
    # Create run directory
    mkdir -p /var/run
    chmod 755 /var/run
    
    # Add root to video group (for device access)
    if getent group video >/dev/null 2>&1; then
        usermod -a -G video root 2>/dev/null || true
    fi
    
    # Reload systemd and enable service (only if systemd is available)
    if command -v systemctl >/dev/null 2>&1; then
        systemctl daemon-reload
        systemctl enable gstreamer-video-streaming.service
        echo "✅ SystemD service enabled - will start on boot"
        echo "🔧 Manual control:"
        echo "   systemctl start gstreamer-video-streaming"
        echo "   systemctl stop gstreamer-video-streaming"
        echo "   systemctl status gstreamer-video-streaming"
    else
        echo "ℹ️  SystemD not available - use manual script control"
    fi
    
    echo "📋 Configuration file: /etc/gstreamer-video.conf"
    echo "🎯 Command line: gstreamer-video-streaming [start|stop|status]"
    echo "🎮 C++ controller: gstreamer_controller [start|stop|status]"
}

pkg_prerm:${PN}() {
    #!/bin/sh
    
    if [ -n "$D" ]; then
        exit 0
    fi
    
    # Stop service before removal
    if command -v systemctl >/dev/null 2>&1; then
        systemctl stop gstreamer-video-streaming.service 2>/dev/null || true
        systemctl disable gstreamer-video-streaming.service 2>/dev/null || true
    fi
}

# Development and debugging information
PACKAGE_DEBUG_SPLIT_STYLE = "debug-file-directory"

# Package metadata
HOMEPAGE = "https://github.com/camanem/EmbeddedCar"
BUGTRACKER = "https://github.com/camanem/EmbeddedCar/issues"

# Architecture compatibility
COMPATIBLE_MACHINE = "raspberrypi4"

# Performance and resource settings
PARALLEL_MAKE = "-j ${@oe.utils.cpu_count()}"
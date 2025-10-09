# Version information
PV = "1.0"
PR = "r10"

SUMMARY = "Custom embedded car image for Raspberry Pi 4"
DESCRIPTION = "Raspberry Pi 4 image with WiFi auto-connect and embedded car applications"

inherit core-image

# Compatible only with raspberrypi4
COMPATIBLE_MACHINE = "raspberrypi4"

# Base on core-image-minimal but with our WiFi configuration
IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"

# WiFi packages - FORCED inclusion
IMAGE_INSTALL += " \
    wpa-supplicant \
    linux-firmware-rpidistro-bcm43430 \
    linux-firmware-rpidistro-bcm43455 \
    iw \
    "

# Network tools
IMAGE_INSTALL += " \
    dhcpcd \
    iw \
    wget \
    "

# GStreamer packages for video streaming (now available from meta-multimedia)
IMAGE_INSTALL += " \
    gstreamer1.0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    "

# Essential packages only
# Basic tools and our packages
IMAGE_INSTALL += " \
    raspi-gpio \
    wget \
    json-c \
    gpiolib \
    gstreamer-video-streaming \
    embeddedcar-services \
    "

# PWM Hardware Support - Include device tree overlays
IMAGE_INSTALL += " \
    kernel-devicetree \
    kernel-modules \
    "

# Enable SSH and debugging
EXTRA_IMAGE_FEATURES += "ssh-server-openssh debug-tweaks tools-debug"

# SSH configuration for development
ROOTFS_POSTPROCESS_COMMAND += "setup_ssh_access; setup_wifi_services; "

setup_ssh_access() {
    # Allow root login without password for development
    echo "PermitRootLogin yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config
    echo "PasswordAuthentication yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config
    echo "PermitEmptyPasswords yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config
    
    # Set empty password for root (debug-tweaks should handle this, but ensure it)
    sed -i 's/^root:[^:]*:/root::/' ${IMAGE_ROOTFS}/etc/passwd
}

setup_wifi_services() {
    # Enable dhcpcd for wlan0
    if [ -d ${IMAGE_ROOTFS}/etc/systemd/system/multi-user.target.wants ]; then
        ln -sf /lib/systemd/system/dhcpcd@.service \
            ${IMAGE_ROOTFS}/etc/systemd/system/multi-user.target.wants/dhcpcd@wlan0.service
    fi
}

# Ensure WiFi firmware is included
RDEPENDS:${PN} += " \
    linux-firmware-rpidistro-bcm43430 \
    linux-firmware-rpidistro-bcm43455 \
    "

IMAGE_ROOTFS_SIZE ?= "1536"

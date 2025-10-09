SUMMARY = "PWM hardware configuration for EmbeddedCar"
DESCRIPTION = "Enable PWM hardware support using built-in Raspberry Pi overlays"
SECTION = "kernel"

LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

# No files needed - we'll use built-in overlays
SRC_URI = ""

inherit allarch

# This package just configures the boot config
do_install() {
    # Nothing to install - configuration is handled in postinst
    :
}

# Add PWM configuration to /boot/config.txt
pkg_postinst:${PN}() {
    if [ -n "$D" ]; then
        # Running in build environment
        CONFIG_FILE="$D/boot/config.txt"
    else
        # Running on target
        CONFIG_FILE="/boot/config.txt"
    fi
    
    if [ -f "$CONFIG_FILE" ]; then
        # Check if PWM config already exists
        if ! grep -q "dtoverlay=pwm-2chan" "$CONFIG_FILE"; then
            echo "" >> "$CONFIG_FILE"
            echo "# PWM Hardware Support for EmbeddedCar" >> "$CONFIG_FILE"
            echo "dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4" >> "$CONFIG_FILE"
            echo "dtparam=pwm=on" >> "$CONFIG_FILE"
            echo "# Enable sysfs PWM interface" >> "$CONFIG_FILE"
            echo "dtoverlay=pwm" >> "$CONFIG_FILE"
        fi
    fi
}
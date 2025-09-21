FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

# Force WiFi kernel configuration
SRC_URI += "file://wifi.cfg"

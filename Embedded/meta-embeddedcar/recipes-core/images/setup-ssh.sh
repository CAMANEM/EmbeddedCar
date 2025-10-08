#!/bin/bash

# Enable SSH without password for development
echo "PermitRootLogin yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config
echo "PasswordAuthentication yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config
echo "PermitEmptyPasswords yes" >> ${IMAGE_ROOTFS}/etc/ssh/sshd_config

# Set empty password for root
echo "root::0:0:root:/root:/bin/bash" > ${IMAGE_ROOTFS}/etc/passwd.tmp
echo "root:*:19729:0:99999:7:::" > ${IMAGE_ROOTFS}/etc/shadow.tmp

# Ensure SSH starts on boot
systemctl --root=${IMAGE_ROOTFS} enable ssh

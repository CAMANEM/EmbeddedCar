#!/bin/bash

# GStreamer Installation Script for Raspberry Pi
# Installs GStreamer packages via opkg after first boot

set -e

echo "🎥 Installing GStreamer packages for video streaming..."

# Update package database
echo "📦 Updating package database..."
opkg update

# Install GStreamer core
echo "🔧 Installing GStreamer core..."
opkg install gstreamer1.0

# Install basic plugins
echo "🔌 Installing GStreamer plugins..."
opkg install gstreamer1.0-plugins-base || echo "⚠️ gstreamer1.0-plugins-base not available"
opkg install gstreamer1.0-plugins-good || echo "⚠️ gstreamer1.0-plugins-good not available"

# Try to install additional useful plugins
echo "🎯 Installing additional plugins (optional)..."
opkg install gstreamer1.0-plugins-bad || echo "ℹ️ gstreamer1.0-plugins-bad not available (ok)"
opkg install kernel-module-uvcvideo || echo "ℹ️ kernel-module-uvcvideo not available (ok)"

# Test GStreamer installation
echo "🧪 Testing GStreamer installation..."
if command -v gst-launch-1.0 >/dev/null 2>&1; then
    echo "✅ GStreamer installed successfully"
    
    # Test basic pipeline
    echo "🔍 Testing basic pipeline..."
    timeout 2 gst-launch-1.0 videotestsrc ! fakesink >/dev/null 2>&1 && \
        echo "✅ GStreamer pipeline test passed" || \
        echo "⚠️ GStreamer pipeline test failed (may be ok without camera)"
    
    # Check for video devices
    echo "📹 Checking for video devices..."
    if ls /dev/video* >/dev/null 2>&1; then
        echo "✅ Video devices found:"
        ls -la /dev/video*
        
        # Test camera access
        echo "📷 Testing camera access..."
        timeout 2 gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink >/dev/null 2>&1 && \
            echo "✅ Camera test passed" || \
            echo "⚠️ Camera test failed (check camera connection)"
    else
        echo "ℹ️ No video devices found (connect camera and reboot)"
    fi
    
    echo ""
    echo "🎉 GStreamer setup complete!"
    echo "🚀 You can now start video streaming:"
    echo "   gstreamer-video-streaming start"
    echo ""
    echo "🔧 Configuration file: /etc/gstreamer-video.conf"
    echo "📋 Service logs: /var/log/gstreamer-video.log"
    
else
    echo "❌ GStreamer installation failed"
    exit 1
fi
cmake_minimum_required(VERSION 3.5)
project(GStreamerVideoStreaming VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Compiler flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -O2")

# Build GStreamer controller executable (standalone, no GStreamer linking needed)
add_executable(gstreamer_controller gstreamer_controller.cpp)

# Installation
install(TARGETS gstreamer_controller 
        RUNTIME DESTINATION bin)

# Install scripts and configuration files
install(PROGRAMS gstreamer-video-streaming 
        DESTINATION bin)

# Use sysconfdir if defined, otherwise use etc
if(DEFINED CMAKE_INSTALL_SYSCONFDIR)
    install(FILES gstreamer-video.conf 
            DESTINATION ${CMAKE_INSTALL_SYSCONFDIR})
else()
    install(FILES gstreamer-video.conf 
            DESTINATION etc)
endif()

# Install systemd service file if systemd is available
if(DEFINED ENV{systemd_system_unitdir})
    install(FILES gstreamer-video-streaming.service 
            DESTINATION $ENV{systemd_system_unitdir})
endif()

# Print configuration summary
message(STATUS "")
message(STATUS "GStreamer Video Streaming Configuration:")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  Install prefix: ${CMAKE_INSTALL_PREFIX}")
message(STATUS "  C++ compiler: ${CMAKE_CXX_COMPILER}")
message(STATUS "  C++ flags: ${CMAKE_CXX_FLAGS}")
message(STATUS "  Note: GStreamer is a runtime dependency only")
message(STATUS "")
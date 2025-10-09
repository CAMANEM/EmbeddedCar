/*
 * GStreamer Video Streaming Controller
 * C++ application for controlling video streaming via GStreamer
 * Part of Embedded Car project
 */

#include <iostream>
#include <string>
#include <cstdlib>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>
#include <fstream>

class VideoStreamController {
private:
    std::string device = "/dev/video0";
    int width = 640;
    int height = 480;
    int framerate = 30;
    int port = 8080;
    int quality = 85;
    std::string host = "0.0.0.0";
    pid_t gstreamer_pid = -1;
    
public:
    VideoStreamController() = default;
    
    void setDevice(const std::string& dev) { device = dev; }
    void setResolution(int w, int h) { width = w; height = h; }
    void setFramerate(int fps) { framerate = fps; }
    void setPort(int p) { port = p; }
    void setQuality(int q) { quality = q; }
    void setHost(const std::string& h) { host = h; }
    
    bool startStreaming() {
        if (isStreaming()) {
            std::cout << "Streaming already active" << std::endl;
            return true;
        }
        /*
        std::cout << "Starting GStreamer video streaming..." << std::endl;
        std::cout << "Device: " << device << std::endl;
        std::cout << "Resolution: " << width << "x" << height << "@" << framerate << "fps" << std::endl;
        std::cout << "Endpoint: " << host << ":" << port << std::endl;
        std::cout << "Quality: " << quality << "%" << std::endl;
        */
        // Build GStreamer command
        std::string command = "gst-launch-1.0 v4l2src device=" + device +
                             " ! video/x-raw,width=" + std::to_string(width) +
                             ",height=" + std::to_string(height) +
                             ",framerate=" + std::to_string(framerate) + "/1" +
                             " ! videoconvert ! jpegenc quality=" + std::to_string(quality) +
                             " ! multipartmux boundary=--videoboundary" +
                             " ! tcpserversink host=" + host +
                             " port=" + std::to_string(port) + " sync=false";
        
        
        // Fork and exec GStreamer
        gstreamer_pid = fork();
        if (gstreamer_pid == 0) {
            // Child process - execute GStreamer
            execl("/bin/sh", "sh", "-c", command.c_str(), nullptr);
            std::cerr << "❌ Failed to execute GStreamer" << std::endl;
            exit(1);
        } else if (gstreamer_pid > 0) {
            // Parent process
            //std::cout << "GStreamer started with PID: " << gstreamer_pid << std::endl;
            
            // Save PID to file
            std::ofstream pidFile("/tmp/gstreamer_video.pid");
            if (pidFile.is_open()) {
                pidFile << gstreamer_pid << std::endl;
                pidFile.close();
            }
            
            return true;
        } else {
            std::cerr << "❌ Failed to fork process" << std::endl;
            return false;
        }
    }
    
    bool stopStreaming() {
        if (!isStreaming()) {
            //std::cout << "Streaming not active" << std::endl;
            return true;
        }
        
        //std::cout << "Stopping GStreamer video streaming..." << std::endl;
        
        if (gstreamer_pid > 0) {
            // Send SIGTERM for graceful shutdown
            if (kill(gstreamer_pid, SIGTERM) == 0) {
                //std::cout << "Sent SIGTERM to PID " << gstreamer_pid << std::endl;
                
                // Wait for process to terminate
                int status;
                int wait_count = 0;
                while (wait_count < 50) { // Wait up to 5 seconds
                    if (waitpid(gstreamer_pid, &status, WNOHANG) > 0) {
                        break;
                    }
                    usleep(100000); // 100ms
                    wait_count++;
                }
                
                // Force kill if still running
                if (kill(gstreamer_pid, 0) == 0) {
                    std::cout << "⚡ Force killing PID " << gstreamer_pid << std::endl;
                    kill(gstreamer_pid, SIGKILL);
                }
                
                gstreamer_pid = -1;
                std::cout << "Streaming stopped" << std::endl;
                
                // Remove PID file
                unlink("/tmp/gstreamer_video.pid");
                
                return true;
            } else {
                std::cerr << "❌ Failed to stop process" << std::endl;
                return false;
            }
        }
        
        return false;
    }
    
    bool isStreaming() {
        if (gstreamer_pid <= 0) {
            // Try to read PID from file
            std::ifstream pidFile("/tmp/gstreamer_video.pid");
            if (pidFile.is_open()) {
                pidFile >> gstreamer_pid;
                pidFile.close();
            }
        }
        
        if (gstreamer_pid > 0) {
            // Check if process is still running
            if (kill(gstreamer_pid, 0) == 0) {
                return true;
            } else {
                gstreamer_pid = -1;
                unlink("/tmp/gstreamer_video.pid");
            }
        }
        
        return false;
    }
    
    void getStatus() {
        std::cout << "GStreamer Video Streaming Status" << std::endl;
        std::cout << "================================" << std::endl;
        
        if (isStreaming()) {
            std::cout << "Status: RUNNING (PID: " << gstreamer_pid << ")" << std::endl;
            std::cout << "Endpoint: tcp://" << host << ":" << port << std::endl;
            std::cout << "Device: " << device << std::endl;
            std::cout << "Resolution: " << width << "x" << height << "@" << framerate << "fps" << std::endl;
            std::cout << "Quality: " << quality << "%" << std::endl;
        } else {
            std::cout << "Status: ❌ STOPPED" << std::endl;
        }
    }
};

void showUsage(const char* program) {
    std::cout << "GStreamer Video Streaming Controller" << std::endl;
    std::cout << "Usage: " << program << " [command] [options]" << std::endl;
    std::cout << std::endl;
    std::cout << "Commands:" << std::endl;
    std::cout << "  start     Start video streaming" << std::endl;
    std::cout << "  stop      Stop video streaming" << std::endl;
    std::cout << "  restart   Restart video streaming" << std::endl;
    std::cout << "  status    Show streaming status" << std::endl;
    std::cout << std::endl;
    std::cout << "Options:" << std::endl;
    std::cout << "  --device=DEVICE     Video device (default: /dev/video0)" << std::endl;
    std::cout << "  --width=WIDTH       Video width (default: 640)" << std::endl;
    std::cout << "  --height=HEIGHT     Video height (default: 480)" << std::endl;
    std::cout << "  --fps=FPS          Frame rate (default: 30)" << std::endl;
    std::cout << "  --port=PORT        TCP port (default: 8080)" << std::endl;
    std::cout << "  --quality=QUALITY  JPEG quality 1-100 (default: 85)" << std::endl;
    std::cout << "  --host=HOST        Bind host (default: 0.0.0.0)" << std::endl;
    std::cout << std::endl;
    std::cout << "Examples:" << std::endl;
    std::cout << "  " << program << " start" << std::endl;
    std::cout << "  " << program << " start --port=8090 --quality=95" << std::endl;
    std::cout << "  " << program << " start --width=1280 --height=720" << std::endl;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        showUsage(argv[0]);
        return 1;
    }
    
    VideoStreamController controller;
    std::string command = argv[1];
    
    // Parse options
    for (int i = 2; i < argc; i++) {
        std::string arg = argv[i];
        
        if (arg.substr(0, 9) == "--device=") {
            controller.setDevice(arg.substr(9));
        } else if (arg.substr(0, 8) == "--width=") {
            controller.setResolution(std::stoi(arg.substr(8)), 480);
        } else if (arg.substr(0, 9) == "--height=") {
            controller.setResolution(640, std::stoi(arg.substr(9)));
        } else if (arg.substr(0, 6) == "--fps=") {
            controller.setFramerate(std::stoi(arg.substr(6)));
        } else if (arg.substr(0, 7) == "--port=") {
            controller.setPort(std::stoi(arg.substr(7)));
        } else if (arg.substr(0, 10) == "--quality=") {
            controller.setQuality(std::stoi(arg.substr(10)));
        } else if (arg.substr(0, 7) == "--host=") {
            controller.setHost(arg.substr(7));
        }
    }
    
    // Execute command
    if (command == "start") {
        return controller.startStreaming() ? 0 : 1;
    } else if (command == "stop") {
        return controller.stopStreaming() ? 0 : 1;
    } else if (command == "restart") {
        controller.stopStreaming();
        sleep(1);
        return controller.startStreaming() ? 0 : 1;
    } else if (command == "status") {
        controller.getStatus();
        return 0;
    } else {
        std::cerr << "❌ Unknown command: " << command << std::endl;
        showUsage(argv[0]);
        return 1;
    }
}
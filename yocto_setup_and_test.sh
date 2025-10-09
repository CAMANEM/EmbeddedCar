#!/usr/bin/bash

# Complete Yocto Project Setup and Test Script
# Downloads dependencies, sets up Yocto 5.0.10 LTS, and tests with busybox build
# Works from any directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
YOCTO_VERSION="5.0.10"
YOCTO_CODENAME="scarthgap"
YOCTO_DIR="poky-${YOCTO_CODENAME}-${YOCTO_VERSION}"
BUILD_DIR="test_build"
DOWNLOAD_DIR="downloads"
TEST_PACKAGE="busybox"

# Get script directory for consistent operation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE} Yocto Project Setup & Test${NC}"
    echo -e "${BLUE} Version: ${YOCTO_VERSION} LTS (${YOCTO_CODENAME})${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo "Working directory: $SCRIPT_DIR"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_system() {
    print_step "Checking system requirements..."
    
    # Check OS
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        echo "Detected OS: $NAME $VERSION"
        print_success "Linux distribution detected"
    fi
    
    # Check disk space (need at least 20GB for basic test)
    available_space=$(df "$SCRIPT_DIR" | tail -1 | awk '{print $4}')
    available_gb=$((available_space / 1024 / 1024))
    
    if [[ $available_gb -lt 20 ]]; then
        print_error "Not enough disk space. Need at least 20GB, have ${available_gb}GB"
        exit 1
    else
        print_success "Sufficient disk space: ${available_gb}GB"
    fi
    
    # Check required tools
    for tool in python3 git wget tar; do
        if command -v $tool &> /dev/null; then
            version=$($tool --version 2>/dev/null | head -1 || echo "version unknown")
            print_success "$tool found"
        else
            print_error "$tool not found - required for Yocto"
            exit 1
        fi
    done
}

install_dependencies() {
    print_step "Installing Yocto dependencies..."
    
    if command -v apt-get &> /dev/null; then
        echo "Updating package lists..."
        sudo apt-get update
        
        echo "Installing Yocto dependencies..."
        sudo apt-get install -y \
            gawk wget git diffstat unzip texinfo gcc-multilib \
            build-essential chrpath socat cpio python3 python3-pip \
            python3-pexpect xz-utils debianutils iputils-ping \
            python3-git python3-jinja2 python3-subunit zstd \
            liblz4-tool file locales libacl1 bc
        
        # Generate locale if possible
        sudo locale-gen en_US.UTF-8 2>/dev/null || echo "Could not generate en_US.UTF-8 locale"
        
        print_success "Dependencies installed successfully"
        
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y \
            gawk make wget tar bzip2 gzip python3 unzip perl patch \
            diffutils diffstat git cpp gcc gcc-c++ glibc-devel \
            texinfo chrpath ccache perl-Data-Dumper perl-Text-ParseWords \
            perl-Thread-Queue perl-bignum xz SDL-devel socat \
            python3-pexpect findutils which file cpio python3-pip \
            python3-pexpect python3-GitPython python3-jinja2 \
            rpcgen make python3-distutils-extra python3-setuptools \
            zstd lz4 hostname bc
        print_success "Fedora dependencies installed"
        
    else
        print_error "Unsupported package manager. Please install dependencies manually:"
        echo "Required packages: gawk wget git diffstat unzip texinfo gcc-multilib"
        echo "build-essential chrpath socat cpio python3 python3-pip python3-pexpect"
        echo "xz-utils debianutils iputils-ping python3-git python3-jinja2 python3-subunit"
        echo "zstd liblz4-tool file locales libacl1 bc"
        exit 1
    fi
}

setup_locale() {
    # Set up locale for Yocto (with fallback)
    if locale -a | grep -q "en_US.utf8\|en_US.UTF-8"; then
        export LANG=en_US.UTF-8
        export LC_ALL=en_US.UTF-8
        print_success "Using en_US.UTF-8 locale"
    else
        export LANG=C.UTF-8
        export LC_ALL=C.UTF-8
        print_success "Using C.UTF-8 locale (en_US.UTF-8 not available)"
    fi
}

download_yocto() {
    print_step "Setting up Yocto Project ${YOCTO_VERSION}..."
    
    cd "$SCRIPT_DIR"
    
    # Download if needed
    TARBALL_NAME="poky-ac257900c33754957b2696529682029d997a8f28.tar.bz2"
    DOWNLOAD_URL="https://downloads.yoctoproject.org/releases/yocto/yocto-${YOCTO_VERSION}/${TARBALL_NAME}"
    
    if [[ ! -f "$TARBALL_NAME" ]]; then
        echo "Downloading Yocto ${YOCTO_VERSION} (15MB)..."
        wget "$DOWNLOAD_URL"
        print_success "Yocto tarball downloaded"
    else
        print_success "Yocto tarball already exists"
    fi
    
    # Extract if needed
    if [[ ! -d "$YOCTO_DIR" ]]; then
        print_step "Extracting Yocto Project..."
        tar -xjf "$TARBALL_NAME"
        rm -rf "$TARBALL_NAME"

        # Rename extracted directory
        if [[ -d "poky" ]]; then
            mv "poky" "$YOCTO_DIR"
            print_success "Yocto extracted to $YOCTO_DIR"
        else
            print_error "Unexpected directory structure after extraction"
            exit 1
        fi
    else
        print_success "Yocto directory already exists"
    fi
}

setup_build_environment() {
    print_step "Setting up build environment..."
    
    cd "$SCRIPT_DIR/$YOCTO_DIR"
    
    # Create downloads directory
    if [[ ! -d "$DOWNLOAD_DIR" ]]; then
        mkdir -p "$DOWNLOAD_DIR"
        print_success "Downloads directory created"
    fi
    
    # Initialize build environment
    print_step "Initializing Yocto build environment..."
    source oe-init-build-env "$BUILD_DIR"
    
    # Configure local.conf
    print_step "Configuring build settings..."
    cat >> conf/local.conf << EOF

# Yocto test configuration
DL_DIR ?= "\${TOPDIR}/../${DOWNLOAD_DIR}"
INHERIT += "rm_work"
MACHINE ?= "qemuarm"

# Optimized settings for test build
BB_NUMBER_THREADS ?= "4"
PARALLEL_MAKE ?= "-j 4"
INHERIT += "buildhistory"
BUILDHISTORY_COMMIT = "1"
EOF
    
    print_success "Build environment configured"
    echo "Build directory: $(pwd)"
}

test_busybox_build() {
    print_step "Testing Yocto with ${TEST_PACKAGE} build..."
    
    cd "$SCRIPT_DIR/$YOCTO_DIR/$BUILD_DIR"
    
    # Set up environment
    setup_locale
    source ../oe-init-build-env .
    
    print_step "Building ${TEST_PACKAGE} (this may take 15-30 minutes)..."
    echo "Build started at: $(date)"
    echo "Current directory: $(pwd)"
    
    # Build the test package
    if bitbake $TEST_PACKAGE; then
        print_success "Successfully built ${TEST_PACKAGE}!"
        echo "Build completed at: $(date)"
        
        # Show build information
        print_step "Build summary:"
        echo "Package: $TEST_PACKAGE"
        echo "Machine: qemuarm"
        echo "Build directory: $(pwd)"
        
        if [[ -d "tmp/deploy" ]]; then
            echo ""
            echo "Deploy directory contents:"
            find tmp/deploy -name "*busybox*" 2>/dev/null | head -5 || echo "No busybox files found in deploy"
        fi
        
        return 0
    else
        print_error "Failed to build ${TEST_PACKAGE}"
        echo "Check error messages above for troubleshooting information"
        return 1
    fi
}

show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Yocto Project setup and test completed successfully!${NC}"
    echo ""
    echo "Your environment is ready for embedded Linux development:"
    echo ""
    echo "📁 Location: $SCRIPT_DIR/$YOCTO_DIR/$BUILD_DIR"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Navigate to build directory:"
    echo "     cd $SCRIPT_DIR/$YOCTO_DIR/$BUILD_DIR"
    echo ""
    echo "  2. Source the environment:"
    echo "     source ../oe-init-build-env ."
    echo ""
    echo "  3. Build a complete minimal image (1-3 hours):"
    echo "     bitbake core-image-minimal"
    echo ""
    echo "  4. Run in QEMU emulator:"
    echo "     runqemu qemuarm"
    echo ""
    echo "📚 For advanced usage, see Workshop 6.5 on layers and custom recipes!"
}

# Main execution
main() {
    print_header
    
    # Parse command line options
    SKIP_PACKAGES=false
    SKIP_CONFIGURE=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-packages)
                SKIP_PACKAGES=true
                shift
                ;;
            --skip-configure)
                SKIP_CONFIGURE=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --download-only)
                SKIP_PACKAGES=true
                SKIP_CONFIGURE=true
                SKIP_BUILD=true
                shift
                ;;
            --help|-h)
                echo "Yocto Project Complete Setup and Test Script"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-packages    Skip system package installation"
                echo "  --skip-configure   Skip build environment configuration"
                echo "  --skip-build       Skip the busybox test build"
                echo "  --download-only    Only download Yocto (skip packages, config, build)"
                echo "  --help, -h         Show this help message"
                echo ""
                echo "This script will:"
                echo "1. Check system requirements"
                echo "2. Install required packages (Ubuntu/Fedora)"
                echo "3. Download and extract Yocto Project 5.0.10 LTS"
                echo "4. Set up build environment"
                echo "5. Build and test with busybox package"
                echo ""
                echo "Examples:"
                echo "  $0                    # Full setup and test"
                echo "  $0 --download-only    # Just download Yocto"
                echo "  $0 --skip-packages    # Skip package install (if already done)"
                echo "  $0 --skip-build       # Setup only, no test build"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Execute setup steps
    check_system
    
    if [[ "$SKIP_PACKAGES" == false ]]; then
        install_dependencies
    else
        echo "Skipping package installation..."
    fi
    
    download_yocto
    
    if [[ "$SKIP_CONFIGURE" == false ]]; then
        setup_build_environment
        
        if [[ "$SKIP_BUILD" == false ]]; then
            if test_busybox_build; then
                show_next_steps
            else
                echo ""
                echo -e "${RED}Build test failed. Environment is set up but test build did not complete.${NC}"
                echo "You can try building manually or check the error messages above."
                exit 1
            fi
        else
            echo ""
            echo "Build test skipped. Environment is ready for manual testing."
            echo "To test manually: cd $SCRIPT_DIR/$YOCTO_DIR/$BUILD_DIR && source ../oe-init-build-env . && bitbake busybox"
        fi
    else
        echo ""
        echo "Build environment configuration skipped."
        echo "Yocto Project downloaded to: $SCRIPT_DIR/$YOCTO_DIR"
        echo ""
        echo "To configure manually:"
        echo "1. cd $SCRIPT_DIR/$YOCTO_DIR"
        echo "2. source oe-init-build-env <build-directory-name>"
        echo "3. Configure conf/local.conf as needed"
        echo "4. bitbake <target>"
    fi
}

# Run main function
main "$@"
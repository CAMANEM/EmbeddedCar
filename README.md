# EmbeddedCar Project

This project contains the development environment for an embedded car system, organized in a clean and modular structure.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites Installation](#prerequisites-installation)
    - [Yocto Prerequisites](#yocto-prerequisites)
    - [Web Development Prerequisites](#web-development-prerequisites)
- [Project Instructions](#project-instructions)
    - [Embedded Development (Yocto)](#embedded-development-yocto)
    - [Web Development](#web-development)
- [Setup Instructions for New Developers](#setup-instructions-for-new-developers)
    - [1. Prerequisites Installation](#1-prerequisites-installation)
    - [2. Configure Git with Your GitLab Credentials](#2-configure-git-with-your-gitlab-credentials)
    - [3. Authentication Setup](#3-authentication-setup)
    - [4. Clone and Setup Repository](#4-clone-and-setup-repository)
    - [5. Configure VS Code for GitLab](#5-configure-vs-code-for-gitlab)
    - [6. Development Workflow](#6-development-workflow)
    - [7. Important Configuration Notes](#7-important-configuration-notes)
    - [8. Troubleshooting](#8-troubleshooting)
- [Version Information](#version-information)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
EmbeddedCar/
├── .gitignore          # Git ignore rules for both embedded and web development
├── README.md           # This file - project overview
└── Embedded/           # Yocto/Embedded system development
    ├── bitbake/        # BitBake build system
    ├── meta/           # Core OpenEmbedded metadata
    ├── meta-poky/      # Poky distribution metadata
    ├── meta-yocto-bsp/ # BSP layers for supported hardware
    ├── scripts/        # Build and utility scripts
    ├── oe-init-build-env # Environment setup script
    └── ...             # Other Yocto components
```

## Prerequisites Installation

### Yocto Prerequisites

Make sure you have the following packages installed on your system (example for Ubuntu/Debian):

```bash
sudo apt-get install gawk wget git diffstat unzip texinfo gcc-multilib
build-essential chrpath socat cpio python3 python3-pip python3-pexpect
xz-utils debianutils iputils-ping python3-git python3-jinja2 python3-subunit
zstd liblz4-tool file locales libacl1
```

Refer to the [official Yocto documentation](https://docs.yoctoproject.org/current/brief-yoctoprojectqs/index.html#packages) for more details and supported operating systems.

### Web Development Prerequisites

For the web part, ensure you have:

- [Node.js](https://nodejs.org/) (recommended version: 18.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

To install on Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

Then, inside your web frontend directory (e.g., `WebInterface/`):

```bash
cd WebInterface/
npm install
```

This will install all necessary dependencies for web development.

## Project Instructions

### Embedded Development (Yocto)

To set up the embedded development environment:

1. Navigate to the embedded directory:
   ```bash
   cd Embedded/
   ```

2. Source the build environment:
   ```bash
   source oe-init-build-env
   ```

3. Configure your build in the `conf/` directory that gets created

4. Start building:
   ```bash
   bitbake core-image-minimal
   ```
### Web Development

## Setup Instructions for New Developers

This repository is hosted on both GitLab and GitHub:
- **Primary repository**: GitLab (for development)
- **Mirror repository**: GitHub (automatically synced)

**Due to the mirroring it is to make sure to commit the changes in the GitLab repository**, so follow these steps to clone the repository and configure it properly for GitLab development:

### 1. Prerequisites Installation

#### Install Git
Ensure Git is installed on your system:
```bash
git --version
```
If not installed, install it:
- **Ubuntu/Debian**: `sudo apt install git`

#### Install Visual Studio Code
Download and install VS Code from [https://code.visualstudio.com/](https://code.visualstudio.com/) or from Ubuntu Software.


### 2. Configure Git with Your GitLab Credentials

Set your GitLab username and email globally:
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

### 3. Authentication Setup

#### Option A: SSH Key (Recommended)

1. **Generate SSH key** (if you don't have one):
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```
Press Enter to accept defaults (saves to `~/.ssh/id_ed25519`)

2. **Add SSH key to ssh-agent**:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

3. **Copy public key**:
```bash
cat ~/.ssh/id_ed25519.pub
```

4. **Add to GitLab**:
   - Go to GitLab.com → Avatar → **Preferences**
   - Left sidebar: **SSH Keys**
   - Paste your public key and click **Add key**

5. **Test connection**:
```bash
ssh -T git@gitlab.com
```

#### Option B: Personal Access Token

1. **Generate token in GitLab**:
   - Go to GitLab.com → Avatar → **Preferences**
   - Left sidebar: **Access Tokens**
   - Click **Add new token**
   - Set scopes: `api`, `read_repository`, `write_repository`, `read_user`, Set GitLab as default remote:
```
git config remote.pushdefault gitlab
```
   - Copy the generated token

2. **Store credentials** (Git will prompt when needed):
```bash
git config --global credential.helper store
```

### 4. Clone and Setup Repository

1. **Clone the repository**:
```bash
# Using SSH (recommended if you set up SSH key)
git clone git@gitlab.com:camanem/EmbeddedCar.git

# OR using HTTPS (if using Personal Access Token)
git clone https://gitlab.com/camanem/EmbeddedCar.git
```

2. **Navigate to project directory**:
```bash
cd EmbeddedCar
```

3. **Set up remotes properly**:
```bash
# Verify current remotes
git remote -v

# Add GitLab as primary remote (if not already set)
git remote add gitlab git@gitlab.com:camanem/EmbeddedCar.git

# Set GitLab as default push remote
git config remote.pushdefault gitlab
git config push.default current
```

4. **Switch to development branch**:
```bash
git checkout development
```

### 5. Configure VS Code for GitLab

1. **Open project in VS Code**:
```bash
code .
```

2. **Install recommended extensions**:
   - **GitLab Workflow**: `GitLab.gitlab-workflow`
   - **Git Graph**: `mhutchie.git-graph`
   - **Git Lens**: `eamodio.gitlens`

3. **Configure GitLab Workflow extension**:
   - Press `Ctrl+Shift+P` → type "GitLab: Add Account"
   - Enter GitLab instance URL: `https://gitlab.com`
   - Use your Personal Access Token if prompted

4. **Verify Source Control setup**:
   - Open Source Control panel (`Ctrl+Shift+G`)
   - Check that remote shows as GitLab
   - Make a test change and commit to verify it goes to GitLab

### 6. Development Workflow

#### Creating and Working on Branches

1. **Always branch from development**:
```bash
git checkout development
git pull gitlab development
git checkout -b your_new_branch_name
```

2. **Make changes and commit**:
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to GitLab
git push gitlab your_new_branch_name
```

3. **Create Merge Request**:
   - Go to GitLab project page
   - Create Merge Request from your branch to `development`
   - Add description and assign reviewers

#### VS Code Source Control Usage

- **Stage files**: Click `+` next to files in Source Control panel
- **Commit**: Type message and press `Ctrl+Enter`
- **Push**: Click `...` → Push (or `Ctrl+Shift+P` → "Git: Push")
- **Pull**: Click `...` → Pull (or `Ctrl+Shift+P` → "Git: Pull")

### 7. Important Configuration Notes

- **Never push directly to `main` or `master`**
- **Always create branches from `development`**
- **Commits automatically sync from GitLab to GitHub** (mirroring is configured)
- **Use GitLab for all development work**, GitHub is read-only mirror

### 8. Troubleshooting

#### If commits go to GitHub instead of GitLab:
```bash
git remote set-url origin git@gitlab.com:camanem/EmbeddedCar.git
git config remote.pushdefault origin
```

#### If authentication fails:
```bash
# For SSH
ssh -T git@gitlab.com

# For HTTPS, clear and re-enter credentials
git config --global --unset credential.helper
git config --global credential.helper store
```

#### To verify remote configuration:
```bash
git remote -v
git config --list | grep remote
```


## Version Information

- **Yocto Version**: Scarthgap (5.0.10)
- **Build System**: BitBake
- **Architecture**: Multi-platform embedded systems

## Contributing

Please make sure to:
1. Test your changes in a clean build environment
2. Update documentation when adding new features
3. Follow the existing code structure and naming conventions

## License

This project inherits the licenses from the Yocto Project:
- MIT License (see `Embedded/LICENSE.MIT`)
- GPL v2.0 (see `Embedded/LICENSE.GPL-2.0-only`)

For more information about the embedded components, see the documentation in `Embedded/documentation/`.

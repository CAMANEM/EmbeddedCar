# EmbeddedCar Project

This project contains the development environment for an embedded car system, organized in a clean and modular structure.

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

## Getting Started

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

## Development Workflow

This repository is hosted on both GitLab and GitHub:
- **Primary repository**: GitLab (for development)
- **Mirror repository**: GitHub (automatically synced)

### Making Changes

1. Work on your changes locally
2. Commit to your branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. Push to GitLab:
   ```bash
   git push gitlab your-branch-name
   ```
4. Changes will automatically sync to GitHub via mirroring

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

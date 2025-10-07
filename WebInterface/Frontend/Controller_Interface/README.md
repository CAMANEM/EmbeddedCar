# EmbeddedCar - Controller Interface 

This is the web application for remotely controlling an integrated autonomous vehicle. This interface offers real-time control, video streaming, and monitoring via a responsive web dashboard.

![Angular](https://img.shields.io/badge/Angular-20.2.1-red)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## Features

### **Vehicle Control**
- **Interactive D-pad**: Touch-friendly directional control
- **Global Keyboard Control**: Arrow keys work from any section
- **Speed Control**: Adjustable velocity slider (0-100%)
- **Real-time Status**: Live vehicle state indicators

### **Video System**
- **Live Streaming**: GStreamer and MJPEG support
- **FPV Mode**: First-person view with gaming-like controls
- **Screenshot Capture**: Save video frames as PNG files
- **Configurable Streaming**: Adjustable IP and port settings

###  **User Interface**
- **Multi-section Layout**: Manual, Sensors, Cameras, FPV, Configuration
- **Real-time Feedback**: Instant visual response to commands

### **Authentication & Security**
- **Login Component**: Dedicated login form with username/password validation
- **Session Management**: JWT token storage and automatic renewal
- **Route Protection**: AuthGuard prevents unauthorized access to dashboard
- **Secure Logout**: Complete session cleanup and redirection
- **Input Validation**: Client-side and server-side parameter validation
- **Error Handling**: User-friendly authentication error messages

## Technologies Used

- **Framework**: Angular 20.2.1
- **Language**: TypeScript
- **Styling**: CSS3 with Flexbox/Grid
- **Forms**: Angular Reactive Forms
- **HTTP Client**: Angular HttpClient for API communication
- **Routing**: Angular Router for navigation
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## Prerequisites

Before running this application, ensure you have:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Angular CLI**: Version 20.x
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Installation of Prerequisites

```bash
# Install Node.js (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Install Angular CLI globally
npm install -g @angular/cli

# Verify installations
node --version
npm --version
ng version
```

##  Installation

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd EmbeddedCar/WebInterface/Frontend/Controller_Interface
```

2. **Install dependencies**:
```bash
npm install
```

3. **Verify installation**:
```bash
npm list --depth=0
```

## Configuration

### Environment Configuration

Create or modify environment files for different deployment scenarios:

**src/environments/environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  raspberryPiDefaultIp: '192.168.0.117',
  streamPort: 8080,
  enableLogging: true
};
```

**src/environments/environment.prod.ts** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://your-raspberry-pi-ip:3000/api',
  raspberryPiDefaultIp: 'your-raspberry-pi-ip',
  streamPort: 8080,
  enableLogging: false
};
```

### Backend Connection

Make sure your backend API is running and accessible:
- **Development**: Backend should be running on `http://localhost:3000`
- **Production**: Update the API URL to match your Raspberry Pi's IP address

##  Development

### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Hot Reload Development

The development server supports hot reload, meaning:
- Changes to TypeScript files trigger automatic recompilation
- CSS changes are applied instantly without page refresh
- Template changes update the DOM automatically
- The browser automatically refreshes when needed

### Development Tools

Recommended browser extensions for development:
- **Angular DevTools**: For debugging Angular applications
- **Redux DevTools**: If using state management
- **JSON Formatter**: For API response debugging

##  Project Structure

```
src/
├── app/
│   ├── login/                    
│   │   ├── login.ts              
│   │   ├── login.html            
│   │   └── login.css             
│   ├── dashboard/               
│   │   ├── dashboard.ts          
│   │   ├── dashboard.html        
│   │   └── dashboard.css         
│   ├── services/                 
│   │   ├── auth.service.ts       
│   │   └── movement.service.ts   
│   ├── guards/                   
│   │   └── auth.guard.ts         
│   ├── models/                   
│   │   ├── user.model.ts        
│   │   └── api-response.model.ts 
│   ├── app.routes.ts             
│   ├── app.component.ts         
│   ├── app.component.html        
│   └── app.component.css         
├── assets/                       
│   ├── images/                   
│   └── icons/                   
├── environments/                 
│   ├── environment.ts            
│   └── environment.prod.ts       
└── styles.css                   
```

### Key Components

#### **Components**
- **LoginComponent**: User authentication interface with form validation
- **DashboardComponent**: Main control interface with all vehicle control sections
- **AppComponent**: Root component handling routing and global layout

#### **Services**
- **AuthService**: Handles user authentication, session management, and token storage
- **MovementService**: Manages all vehicle control API calls and responses

#### **Guards & Security**
- **AuthGuard**: Protects routes requiring authentication
- **Route Protection**: Prevents unauthorized access to dashboard

#### **Models & Interfaces**
- **User Model**: TypeScript interface for user data structure
- **API Response Models**: Interfaces for backend response handling

##  API Integration

The frontend communicates with the backend through HTTP requests:

### Service Configuration

```typescript
// movement.service.ts example
@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private apiUrl = environment.apiUrl;
  
  moveForward(speed: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/move/forward`, { speed });
  }
}
```

### Error Handling

The application includes robust error handling:
- Network connectivity issues
- API server unavailability
- Invalid response formats
- Authentication failures

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

##  Troubleshooting

### Common Issues and Solutions

#### **Issue**: Application won't start
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **Issue**: Cannot connect to backend API
- Verify backend server is running on correct port
- Check CORS configuration in backend
- Confirm API URL in environment files
- Check API endpoints with browser developer tools

#### **Issue**: Video streaming not working
- Verify Raspberry Pi IP address and port
- Check network connectivity to Raspberry Pi
- Ensure GStreamer is properly configured on Pi
- Try MJPEG fallback option

#### **Issue**: Keyboard controls not responding
- Check browser console for JavaScript errors
- Verify event listeners are properly attached
- Ensure no other elements are capturing key events
- Try refreshing the browser or clearing cache

#### **Issue**: Build failures
```bash
# Update Angular CLI and dependencies
npm update -g @angular/cli
npm update
ng update
```


### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

##  Additional Resources

### Angular Documentation
- [Angular Official Documentation](https://angular.dev)
- [Angular CLI Command Reference](https://angular.dev/tools/cli)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project-Specific Resources
- [Backend API Documentation](../../../Backend/README.md)
- [Embedded System Documentation](../../../Embedded/README.md)
- [Main Project README](../../../README.md)

### Development Tools
- [Angular DevTools](https://angular.dev/tools/devtools)
- [VS Code Angular Extensions](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)


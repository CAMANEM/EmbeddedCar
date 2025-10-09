# Angular Services Implementation Guide

## 🎯 Services Overview

This implementation provides two main services for your car controller application:

### 1. AuthService (`auth.service.ts`)
Handles all authentication-related operations:
- **Login/Logout**: User authentication with JWT tokens
- **Token Management**: Automatic token storage and validation
- **Session Management**: Persistent login state across browser sessions
- **Permission System**: Role-based access control
- **Auto-redirect**: Automatic navigation on auth state changes

### 2. CarApiService (`car-api.service.ts`)
Handles all car control and monitoring operations:
- **Connection Management**: Connect/disconnect from the car
- **Movement Control**: Forward, backward, left, right, stop commands
- **Motor Control**: Individual motor speed and direction control
- **Servo Control**: Steering and camera positioning
- **Sensor Monitoring**: Real-time sensor data (ultrasonic, temperature, etc.)
- **Emergency Stop**: Safety override for immediate halt
- **Status Polling**: Automatic updates of car status

## 🔧 Key Features Implemented

### Authentication Features
- ✅ JWT token authentication
- ✅ Automatic token refresh
- ✅ Role and permission-based access
- ✅ Secure token storage
- ✅ Auto-logout on token expiration
- ✅ Demo login for testing

### Car Control Features
- ✅ Real-time status monitoring
- ✅ Connection status tracking
- ✅ Movement commands with speed control
- ✅ Servo positioning (0-180 degrees)
- ✅ Emergency stop functionality
- ✅ Sensor data streaming
- ✅ Error handling and retry logic
- ✅ Loading states for UI feedback

## 🚀 How to Use

### 1. Backend API Requirements

Your backend API should implement these endpoints:

#### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/verify
```

#### Car Control Endpoints
```
POST /api/car/connect
POST /api/car/disconnect
GET  /api/car/status
GET  /api/car/connection-status
POST /api/car/movement
POST /api/car/motors
POST /api/car/servo
POST /api/car/emergency-stop
POST /api/car/speed
GET  /api/car/sensors
POST /api/car/camera
GET  /api/car/config
PUT  /api/car/config
```

### 2. Component Integration

#### Login Component
```typescript
// Already integrated with:
- Reactive forms with validation
- AuthService for authentication
- Error handling and loading states
- Demo login for testing
```

#### Dashboard Component
```typescript
// Already integrated with:
- Real-time car status monitoring
- Movement controls with speed adjustment
- Servo positioning controls
- Connection management
- Emergency stop functionality
- Battery and sensor monitoring
```

### 3. Configuration

Update the API URLs in both services:

```typescript
// In auth.service.ts
private readonly API_BASE_URL = 'http://your-api-url:port/api/auth';

// In car-api.service.ts
private readonly API_BASE_URL = 'http://your-api-url:port/api/car';
```

## 🔒 Security Features

### Token Management
- JWT tokens stored in localStorage
- Automatic token validation
- Token refresh before expiration
- Secure HTTP headers with Bearer tokens

### Error Handling
- Network error detection
- Authentication failure handling
- Service unavailable fallbacks
- User-friendly error messages

## 📡 Real-time Features

### Status Monitoring
```typescript
// Automatic polling every 1-2 seconds
this.carApiService.carStatus$.subscribe(status => {
  // React to status changes
});
```

### Connection Tracking
```typescript
// Monitor connection state
this.carApiService.connectionStatus$.subscribe(connected => {
  // Handle connection changes
});
```

### Emergency Mode
```typescript
// Emergency stop monitoring
this.carApiService.emergencyMode$.subscribe(emergency => {
  // Handle emergency state
});
```

## 🎮 Available Controls

### Movement Controls
- `moveForward(speed, duration?)` - Move forward at specified speed
- `moveBackward(speed, duration?)` - Move backward at specified speed  
- `turnLeft(speed, duration?)` - Turn left at specified speed
- `turnRight(speed, duration?)` - Turn right at specified speed
- `stopCar()` - Stop all movement
- `emergencyStop()` - Emergency halt

### Servo Controls
- `controlServo({angle, speed?})` - Set servo to specific angle
- `setServoPosition('left'|'center'|'right')` - Predefined positions

### Status Monitoring
- `getCarStatus()` - Get current car status
- `getSensorData()` - Get sensor readings
- `checkConnection()` - Check connection quality

## 🧪 Testing

### Demo Mode
The login component includes a demo mode for testing:
- Username: `admin`
- Password: `admin`
- Creates demo session without backend

### Development Tips
1. Start with demo mode to test UI
2. Implement backend endpoints incrementally
3. Use browser dev tools to monitor API calls
4. Check console for service logs

## 🚨 Error Handling

The services include comprehensive error handling:
- Network connectivity issues
- Authentication failures
- Car communication errors
- Emergency stop scenarios
- Token expiration

All errors are logged and provide user-friendly feedback through the UI.

## 🔄 Next Steps

1. **Implement Backend API**: Create the corresponding endpoints
2. **Test Integration**: Use demo mode first, then connect to real API
3. **Add Features**: Extend services for additional car functionality
4. **Security**: Implement proper authentication on your backend
5. **Real Hardware**: Connect to actual embedded car hardware

The services are designed to be modular and extensible, making it easy to add new features as your car controller evolves!
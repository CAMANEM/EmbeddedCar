# Express API Template

A comprehensive Express.js API template with routing, CORS support, and structured organization.

## 📁 Project Structure

```
Express_API_Template/
├── src/
│   └── endpoint_route/
│       ├── endpoint_controller.js    # Business logic for endpoints
│       └── endpoint.js              # Route definitions
├── assets/                          # Static assets (images, files, etc.)
├── server.js                       # Main server file
├── package.json                    # Dependencies and scripts
├── .env                           # Environment variables (create this)
└── initialization.md              # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Setup Steps

1. **Clone or download** this template to your desired directory

2. **Navigate** to the project directory:
   ```bash
   cd Express_API_Template
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create environment file** (optional):
   ```bash
   # Create .env file in root directory
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run tests (placeholder)

## 🛠 API Endpoints

### Base URL
```
http://localhost:3000
```

### Available Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint with API info |
| GET | `/api/health` | Health check endpoint |
| GET | `/api/endpoint` | Get sample data |
| POST | `/api/endpoint` | Create new data |
| GET | `/api/endpoint/:id` | Get data by ID |
| PUT | `/api/endpoint/:id` | Update data by ID |
| DELETE | `/api/endpoint/:id` | Delete data by ID |

### Example Requests

#### GET Request
```bash
curl -X GET http://localhost:3000/api/endpoint
```

#### POST Request
```bash
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test item"}'
```

#### PUT Request
```bash
curl -X PUT http://localhost:3000/api/endpoint/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated description"}'
```

#### DELETE Request
```bash
curl -X DELETE http://localhost:3000/api/endpoint/123
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
# Add your custom environment variables here
```

### CORS Configuration
CORS is enabled by default for all origins. To customize CORS settings, modify the CORS middleware in `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📝 Adding New Endpoints

1. **Create controller functions** in `src/endpoint_route/endpoint_controller.js`
2. **Define routes** in `src/endpoint_route/endpoint.js`
3. **Import and use** the routes in `server.js`

### Example: Adding a new endpoint

**In endpoint_controller.js:**
```javascript
const newEndpoint = (req, res) => {
  res.json({ message: 'New endpoint response' });
};

module.exports = {
  // ... existing exports
  newEndpoint
};
```

**In endpoint.js:**
```javascript
const { newEndpoint } = require('./endpoint_controller');

router.get('/new-endpoint', newEndpoint);
```

## 🏗 Architecture

- **server.js**: Main application entry point with middleware setup
- **src/endpoint_route/**: Contains all route definitions and controllers
- **assets/**: Static files and resources
- **Modular design**: Easy to extend and maintain

## 📦 Dependencies

### Production Dependencies
- **express**: Web framework for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable loader

### Development Dependencies
- **nodemon**: Development server with auto-restart

## 🚨 Error Handling

The template includes:
- Global error handling middleware
- 404 route handler
- Consistent error response format
- Try-catch blocks in controllers

## 📈 Performance Tips

1. Use environment variables for configuration
2. Implement proper logging (consider adding Winston or Morgan)
3. Add input validation (consider using Joi or express-validator)
4. Implement rate limiting for production
5. Use compression middleware for better performance

## 🔒 Security Considerations

For production deployment, consider adding:
- **Helmet.js**: Security headers
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation
- **JWT authentication**: User authentication
- **HTTPS**: Secure connections

## 📄 License

MIT License - feel free to use this template for your projects!

---

**Happy coding! 🎉**

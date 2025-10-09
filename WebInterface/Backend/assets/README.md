# Assets Directory

This directory is intended for static assets such as:

- Images (logos, icons, etc.)
- CSS files
- JavaScript files for frontend
- Documents
- Other static resources

## Usage

You can serve static assets from this directory by adding the following middleware to your `server.js`:

```javascript
// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));
```

Then access files at: `http://localhost:3000/assets/filename.ext`

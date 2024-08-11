// app.js
const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
require('./config/mqtt');  // Initialize MQTT client

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',  // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow cookies and authorization headers
}));

// Create an HTTP server and integrate with socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',  // Replace with your frontend's origin
        methods: ['GET', 'POST']
    }
});

// Handle socket.io connections
io.on('connection', (socket) => {
    console.log('Client connected via socket.io');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api', dataRoutes);
app.use('/api/session', sessionRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

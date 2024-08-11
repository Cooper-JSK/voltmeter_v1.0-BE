// app.js
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');
const connectDB = require('./config/db');
const dataRoutes = require('./routes/dataRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
require('./config/mqtt');  // Initialize MQTT client


// CORS configuration
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data)
    })
})



const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());




// Routes
app.use('/api', dataRoutes);
app.use('/api/session', sessionRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

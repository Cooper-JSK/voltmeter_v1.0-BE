// config/socket.js
const cors = require('cors');
const { Server } = require('socket.io');


let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',  // Replace with your frontend's origin
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected via ${socket.conn.transport.name}`);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

const getIoInstance = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIoInstance };

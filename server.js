const app = require("./app");
const port = 8000 || process.env.PORT;
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

require("dotenv").config();


io.on('connection', (socket) => {
    console.log('user connected');

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); // Broadcast message to all connected clients
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(port, () => {
    console.log("server is running at port: " + port);
})
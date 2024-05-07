const database = require("../model/index");

const {
    Sequelize,
    QueryTypes
} = require("sequelize");

exports.checkTicket = async (req, res) => {
    const {
        bus,
        seat
    } = req.params;

    const tableName = "2024-04-10".replaceAll("-", "_") + "_" + bus.toLowerCase().replaceAll("-", "_");
    const selectData = await database.sequelize.query(`UPDATE ${tableName} SET isTicketChecked = 1 WHERE seatNo = '${seat}' `, {
        type: QueryTypes.UPDATE,
    })

    res.redirect("/");
}


const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Handle socket connections outside of route handlers
io.on('connection', (socket) => {
    console.log('A user connected');

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

exports.currentBusLocations = async (req, res) => {
    const PORT =  3000;
    http.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        res.render("./Conductor/host_location.pug", {
            title: "Get Location"
        })
    });
}

exports.getCurrentBusPosition = async (req, res) => {
    io.on('connection', (socket) => {
        console.log('users is reciving location');

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

    res.render("./Conductor/host_location.pug", {
        title: "Get Location"
    })
}
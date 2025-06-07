function handleSocketError(socket, error) {
    console.error("Socket error:", error);

    // Optional: send error back to client
    if (socket && socket.emit) {
        socket.emit("socket_error", {
            message: error.message || "An unexpected socket error occurred.",
        });
    }
}

module.exports = handleSocketError;

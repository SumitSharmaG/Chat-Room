const Message = require("../models/Message");

// Global state
const onlineUsers = new Map(); 

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("New Socket ID:", socket.id);

        // --- USER ENTERS ---
        socket.on("userJoined", (username) => {
            if(!username) return;
            const name = username.toLowerCase();
            socket.username = name;

            if (!onlineUsers.has(name)) {
                onlineUsers.set(name, new Set());
            }
            onlineUsers.get(name).add(socket.id);

            console.log(`Active: ${name} (${onlineUsers.get(name).size} tabs)`);
            broadcastUsers(io);
        });

        socket.on("requestOnlineUsers", () => {
            broadcastUsers(io);
        });

        // --- PRIVATE CHAT ROUTING ---
        socket.on("sendMessage", async (data) => {
            try {
                // Save to DB (Optional but recommended for history)
                const msg = await Message.create(data);
                
                const rec = data.receiver.toLowerCase();
                const sen = data.sender.toLowerCase();

                // Send to all tabs of the receiver
                if (onlineUsers.has(rec)) {
                    onlineUsers.get(rec).forEach(id => io.to(id).emit("receiveMessage", msg));
                }
                // Send back to all tabs of the sender
                if (onlineUsers.has(sen)) {
                    onlineUsers.get(sen).forEach(id => io.to(id).emit("receiveMessage", msg));
                }
            } catch (e) { console.log("Msg Error:", e); }
        });

        // --- HANDSHAKE LOGIC ---
        socket.on("connectRequest", ({ from, to }) => {
            const target = to.toLowerCase();
            if(onlineUsers.has(target)) {
                onlineUsers.get(target).forEach(id => io.to(id).emit("connectRequest", { from }));
            }
        });

        socket.on("connectResponse", ({ from, to, accepted }) => {
            const target = to.toLowerCase();
            if(onlineUsers.has(target)) {
                onlineUsers.get(target).forEach(id => io.to(id).emit("connectResponse", { from, accepted }));
            }
        });

        // --- CLEANUP ---
        socket.on("disconnect", () => {
            const name = socket.username;
            if (name && onlineUsers.has(name)) {
                onlineUsers.get(name).delete(socket.id);
                if (onlineUsers.get(name).size === 0) {
                    onlineUsers.delete(name);
                }
            }
            broadcastUsers(io);
            console.log("Socket disconnected:", socket.id);
        });
    });
};

function broadcastUsers(io) {
    const list = Array.from(onlineUsers.keys());
    io.emit("onlineUsers", list);
}

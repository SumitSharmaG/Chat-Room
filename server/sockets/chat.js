const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

// 🔥 UNIQUE USERS TRACK
const onlineUsers = new Map();

// 🔥 TRACK TYPING USERS
const typingUsers = new Set();

module.exports = (io) => {

  io.use((socket, next) => {

  try {

    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No Token"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();

  } catch (err) {

    return next(
      new Error("Invalid Token")
    );

  }

});

  io.on("connection", (socket) => {

  console.log(
    "✅ JWT User Connected:",
    socket.user.username
  );

    // ================== TYPING ==================

    socket.on("typing", (username) => {

      if (!typingUsers.has(username)) {

        typingUsers.add(username);

        socket.broadcast.emit(
          "userTyping",
          username
        );
      }
    });

    socket.on("stopTyping", (username) => {

      typingUsers.delete(username);

      socket.broadcast.emit(
        "userStopTyping",
        username
      );
    });



    // ================== SEEN ==================

    socket.on(
      "messageSeen",
      async ({ messageId, username }) => {

        try {

          const msg =
            await Message.findById(messageId);

          if (!msg) return;

          if (!msg.seenBy) {

            msg.seenBy = [];
          }

          if (!msg.seenBy.includes(username)) {

            msg.seenBy.push(username);

            await msg.save();
          }

          io.emit("updateSeen", {

            messageId,

            seenBy: msg.seenBy

          });

        } catch (err) {

          console.error(
            "Seen error:",
            err
          );
        }
      }
    );



    // ================== USER JOIN ==================

    socket.on("userJoined", () => {
      console.log(
  "🔥 userJoined:",
  socket.user.username
);

  const username = socket.user.username;

  socket.username = username;

  if (onlineUsers.has(username)) {

    onlineUsers
      .get(username)
      .add(socket.id);

  } else {

    onlineUsers.set(
      username,
      new Set([socket.id])
    );
  }

  console.log(
    "🔥 Online Users:",
    onlineUsers
  );

  io.emit(
    "updateUserCount",
    onlineUsers.size
  );

});
          



    // ================== WORLD CHAT ==================

    socket.on(
  "sendMessage",
  async (data) => {

    try {

      // 🔐 Username JWT se force
      data.username =
        socket.user.username;

      const msg =
        await Message.create(data);

      io.emit(
        "receiveMessage",
        msg
      );

    } catch (err) {

      console.error(
        "Message error:",
        err
      );
    }
  }
);



    // ================== PRIVATE CHAT ==================

    socket.on(
      "private_message",
      (data) => {

        // 🔐 Sender JWT se force
    data.sender =
      socket.user.username;

        // REMOVE @ IF EXISTS

        data.sender =
          data.sender.replace("@", "");

        data.receiver =
          data.receiver.replace("@", "");

        console.log(
          "🔥 Private Msg:",
          data
        );



        // SEND ONLY TO SENDER + RECEIVER

        for (
          const [username, sockets]
          of onlineUsers
        ) {

          if (

            username === data.receiver

            ||

            username === data.sender

          ) {

            sockets.forEach((socketId) => {

              io.to(socketId).emit(
                "receive_private_message",
                data
              );

            });

          }
        }
      }
    );



    // ================== CLEAR CHAT ==================

    socket.on(
      "clearAllChat",
      async () => {

        try {

          await Message.deleteMany({});

          io.emit("chatCleared");

        } catch (err) {

          console.error(
            "Clear error:",
            err
          );
        }
      }
    );



    // ================== DISCONNECT ==================

    socket.on("disconnect", () => {

      console.log(
        "User disconnected:",
        socket.id
      );

      const username =
        socket.username;

      // REMOVE FROM ONLINE USERS

      if (
        username &&
        onlineUsers.has(username)
      ) {

        const userSockets =
          onlineUsers.get(username);

        userSockets.delete(socket.id);

        if (userSockets.size === 0) {

          onlineUsers.delete(username);
        }
      }


      // REMOVE FROM TYPING USERS

      if (
        username &&
        typingUsers.has(username)
      ) {

        typingUsers.delete(username);

        socket.broadcast.emit(
          "userStopTyping",
          username
        );
      }

      console.log(
        "🔥 After Disconnect:",
        onlineUsers
      );

      io.emit(
        "updateUserCount",
        onlineUsers.size
      );
    });

  });

};

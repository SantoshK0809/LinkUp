import { Server } from "socket.io";

let messages = {}; // room -> messages[]
let timeOnline = {}; // socketId -> time

let userNames = {}; // socketId -> userName

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // JOIN ROOM
    socket.on("join-call", (roomId, userName) => {
      socket.join(roomId);
      socket.room = roomId;
      userNames[socket.id] = userName || "User";
      timeOnline[socket.id] = new Date();

      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

      // Send existing users to new user
      const existingUsers = clients
        .filter((id) => id !== socket.id)
        .map((id) => ({
          socketId: id,
          userName: userNames[id],
        }));

      socket.emit("existing-users", existingUsers);

      // Notify others
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userName: userNames[socket.id],
      });

      // Send old messages (if any)
      if (messages[roomId]) {
        messages[roomId].forEach((msg) => {
          socket.emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    // SIGNALING
    socket.on("signal", (toId, data) => {
      io.to(toId).emit("signal", socket.id, data);
    });

    // CHAT
    socket.on("chat-message", (data, sender) => {
      const roomId = socket.room;
      if (!roomId) return;

      if (!messages[roomId]) {
        messages[roomId] = [];
      }

      const msgObj = {
        sender,
        data,
        "socket-id-sender": socket.id,
      };

      messages[roomId].push(msgObj);

      // broadcast to room
      io.to(roomId).emit("chat-message", data, sender, socket.id);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);

      const roomId = socket.room;

      if (roomId) {
        socket.to(roomId).emit("user-left", socket.id);
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
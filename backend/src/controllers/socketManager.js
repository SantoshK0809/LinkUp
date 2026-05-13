import { Server } from "socket.io";
import Schedule from "../models/schedule.model.js";
import getJoinState from "../utils/join.meeting.js";

let messages = {}; // room -> messages[]
let timeOnline = {}; // socketId -> time

let userNames = {}; // socketId -> userName

export const connectToSocket = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //     allowedHeaders: ["*"],
  //     credentials: true,
  //   },
  // });

  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://linkup-frontend.netlify.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // JOIN ROOM
    // socket.on("join-call", (roomId, userName) => {
    //   socket.join(roomId);
    //   socket.room = roomId;
    //   userNames[socket.id] = userName || "User";
    //   timeOnline[socket.id] = new Date();

    //   const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    //   // Send existing users to new user
    //   const existingUsers = clients
    //     .filter((id) => id !== socket.id)
    //     .map((id) => ({
    //       socketId: id,
    //       userName: userNames[id],
    //     }));

    //   socket.emit("existing-users", existingUsers);

    //   // Notify others
    //   socket.to(roomId).emit("user-joined", {
    //     socketId: socket.id,
    //     userName: userNames[socket.id],
    //   });

    //   // Send old messages (if any)
    //   if (messages[roomId]) {
    //     messages[roomId].forEach((msg) => {
    //       socket.emit(
    //         "chat-message",
    //         msg.data,
    //         msg.sender,
    //         msg["socket-id-sender"],
    //       );
    //     });
    //   }
    // });

    socket.on("join-call", async ({ roomId, userName }) => {
      try {
        const meeting = await Schedule.findOne({ meetingCode: roomId });

        if (!meeting) {
          return socket.emit("join-error", "Meeting not found");
        }

        const state = getJoinState(meeting);

        // // 🚨 Always communicate via emit
        // if (state === "CANCELLED") {
        //   return socket.emit("join-error", "Meeting cancelled");
        // }

        // if (state === "TOO_EARLY") {
        //   return socket.emit("join-error", "Too early to join");
        // }

        // if (state === "ENDED") {
        //   return socket.emit("join-error", "Meeting ended");
        // }

        // if (state === "LOBBY") {
        //   socket.emit("lobby", { roomId });
        // }

        // if (state === "JOIN") {
        //   socket.emit("join-approved", { roomId });
        // }

        // // ✅ Now actually join room
        // socket.join(roomId);
        // socket.room = roomId;

        if (state === "CANCELLED") {
          return socket.emit("join-error", "Meeting cancelled");
        }

        if (state === "TOO_EARLY") {
          return socket.emit("join-error", "Too early to join");
        }

        if (state === "ENDED") {
          return socket.emit("join-error", "Meeting ended");
        }

        if (state !== "LOBBY" && state !== "JOIN") {
          return socket.emit("join-error", "Invalid meeting state");
        }

        // ONLY NOW allow room join
        socket.join(roomId);
        socket.room = roomId;
        console.log(`[Socket ${socket.id}] Joined room: ${roomId}`);

        if (state === "LOBBY") {
          socket.emit("lobby", { roomId });
        }

        if (state === "JOIN") {
          socket.emit("join-approved", { roomId });
        }

        userNames[socket.id] = userName || "User";
        timeOnline[socket.id] = new Date();

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log(`[Room ${roomId}] Current clients:`, clients);

        const existingUsers = clients
          .filter((id) => id !== socket.id)
          .map((id) => ({
            socketId: id,
            userName: userNames[id],
          }));

        console.log(
          `[Socket ${socket.id}] Sending existing-users:`,
          existingUsers,
        );
        socket.emit("existing-users", existingUsers);

        console.log(
          `[Room ${roomId}] Broadcasting user-joined for ${socket.id}`,
        );
        socket.to(roomId).emit("user-joined", {
          socketId: socket.id,
          userName: userNames[socket.id],
        });
      } catch (err) {
        console.error("join-call error:", err);
        socket.emit("join-error", "Internal server error");
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

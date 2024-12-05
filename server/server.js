require("dotenv").config();
const express = require("express");
const connectDb = require("./utils/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./router/auth-router.js");
const roomModel = require("./models/room-model.js")
const messageModel = require("./models/message-model.js")
const userModel = require("./models/user-model.js")


const http = require("http");
const socketIo = require("socket.io");

const app = express();


const server = http.createServer(app);
const io = socketIo(server);

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions)); 
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);

connectDb().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

const userSockets = {};

io.on("connection", (socket) => {
  console.log("An user connected with user Id", socket.id);

  socket.on("register", (data) => {
    userSockets[data.userId] = socket.id;

    console.log(userSockets);
  });

  socket.on("connection_request", ({ userProfile, recieverId, roomId }) => {
    console.log(
      `User with id ${userProfile} want to connect to user with id ${recieverId} in a room with id ${roomId}`
    );

    if (userSockets[recieverId]) {
      console.log("Id beheteko xa k re heram k hunxa");
      console.log(userSockets[recieverId]);
      io.to(userSockets[recieverId]).emit("connection_notification", {
        from: userProfile,
        roomId,
        message: "Request aaxa hai",
      });

      socket.emit("connection_request_response", {
        status: "success",
        message: "Successfully sent the request",
      });
    } else {
      socket.emit("connection_request_response", {
        status: "failure",
        message: "Failed  to send the request",
      });
    }
  });
  socket.on("connection_accepted", ({ from, roomId, userProfile, status }) => {
    console.log("YO chalexa hai");
    console.log(
      `The request to join room ${roomId} has been approvaed by ${userProfile}`
    );

    if (userSockets[from]) {
      console.log(userSockets[from]);
      io.to(userSockets[from]).emit("connection_accepted_info", {
        userProfile,
        roomId,
        status,
        message: "Your request has been accepted",
      });
    }
  });

  socket.on("join_room", ({ roomId, userIds }) => {
    userIds.forEach((userId) => {
      socket.join(roomId);
      console.log(`${userId} has joined the room ${roomId}`);
    });

    io.to(roomId).emit("room_joined", {
      roomId,
      message: "User has joined the room",
    });
  });

  socket.on("send_message", (data) => {
    const { roomId, sender, content, image } = data;

    io.to(roomId).emit("message_received", { sender, content, image });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");

    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log("User removed with id", userId);
        break;
      }
    }

    console.log("Registered Users after disconnect:", userSockets);
  });
});

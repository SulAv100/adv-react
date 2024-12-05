const mongoose = require("mongoose");
const userModel = require("./user-model.js");
const roomModel = require("./room-model.js");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userModel, // Reference to the User model
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: roomModel, // Reference to the Room model
    required: true,
  },
  content: {
    type: String,
    required: true, // Content of the message (can be text or base64 image)
  },
  image: {
    type: String, // Base64 encoded image string
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

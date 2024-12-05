import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import "./AllCss.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const location = useLocation();
  const { roomId, userProfile, from } = location.state || {};

  useEffect(() => {
    console.log("user profile yo ho", userProfile);
  }, [userProfile]);

  useEffect(() => {
    const socketInstance = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(socketInstance);

    if (roomId && userProfile) {
      socketInstance.emit("join_room", {
        roomId,
        userIds: [userProfile, from],
      });

      socketInstance.on("message_received", (message) => {
        console.log("Raw received message:", message);

        // Validate message structure before adding
        if (isValidMessage(message)) {
          setMessages((prevMessages) => [...prevMessages, message]);
        } else {
          console.error("Invalid message structure:", message);
        }
      });
    }

    return () => socketInstance.disconnect();
  }, [roomId, userProfile]);

  const isValidMessage = (message) => {
    return (
      message &&
      typeof message === "object" &&
      typeof message.sender === "string" &&
      (typeof message.content === "string" || message.content === undefined) &&
      (typeof message.image === "string" ||
        message.image === null ||
        message.image === undefined)
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !imageFile) return;

    const messageData = {
      sender: userProfile,
      content: newMessage.trim() || "",
      image: null,
      roomId,
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        messageData.image = base64Image;

        socket.emit("send_message", messageData);
        setNewMessage("");
        setImageFile(null);
      };
      reader.readAsDataURL(imageFile);
    } else {
      socket.emit("send_message", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat - Room: {roomId}</h2>
      </div>
      <div className="chat-messages">
        {messages.filter(isValidMessage).map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === userProfile ? "sent" : "received"
            }`}
          >
            <p>
              <strong>{message.sender}:</strong> {message.content || ""}
            </p>
            {message.image && (
              <img
                src={message.image}
                alt="Sent message"
                style={{ maxWidth: "200px" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

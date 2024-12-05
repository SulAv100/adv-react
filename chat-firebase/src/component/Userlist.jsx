import React, { useEffect, useState } from "react";
import "./AllCss.css";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function Userlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [connectionRequest, setConnectionRequest] = useState([]);
  const [socket, setSocket] = useState(null);



  useEffect(() => {
    console.log(connectionRequest);
  }, [connectionRequest]);

  useEffect(() => {
    const socketInstance = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(socketInstance);

    socketInstance.on(
      "connection_notification",
      ({ from, roomId, message }) => {
        console.log(
          `Connection request from ${from} for room ${roomId}: ${message}`
        );

        setConnectionRequest((prevState) => [
          ...prevState,
          { from, roomId, status: "pending" },
        ]);
      }
    );

      socketInstance.on(
      "connection_accepted_info",
      ({ from, roomId, userProfile, status }) => {
        if (status === "accepted") {
          navigate(`/chat/${roomId}`, {
            state: { roomId, userProfile, from },
          });
        }
      }
    );

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const getUserList = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/getUser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/getProfile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setUserProfile(data._id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserList();
    getUserProfile();
  }, []); 


  useEffect(() => {
    if (userProfile && socket) {
      socket.emit("register", { userId: userProfile });

      socket.on("disconnect", () => {
        console.log("Disconnected from server!");
      });
    }
  }, [userProfile, socket]);

  const initiateConnection = async (recieverId) => {
    if (!socket) return;



    const roomId = `${userProfile}_${recieverId}`;
    console.log(roomId);

    socket.emit("connection_request", { userProfile, recieverId, roomId });

    socket.on("connection_request_response", (response) => {
      if (response.status === "success") {
        console.log("The connection request was successfully sent");
      } else {
        console.log("The connection request failed to send");
      }
    });
  };

  const acceptRequest = async (roomId, from) => {
    console.log("called");
    console.log(from);
   

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    const request = connectionRequest.find(
      (item) => item.roomId === roomId && item.from === from
    );

    if (request) {
      console.log("Request successfully found");
    }

    setConnectionRequest((prevState) =>
      prevState.map((request, index) =>
        request.roomId === roomId && request.from === from
          ? { ...request, status: "accepted" }
          : request
      )
    );

    socket.emit("connection_accepted", {
      from,
      roomId,
      userProfile,
      status: "accepted",
    });

    console.log("Yo pani chalexa");

    socket.emit("join_room", { roomId, userIds: [userProfile, from] });

    

    socket.on("room_joined", (data) => {
      console.log(data.message);
      console.log("Chalexa hai");
      navigate(`/chat/${roomId}`, {
        state: { roomId, userProfile, from },
      });
    });
    
  };

  return (
    <>
      <div className="user-list">
        <ul className="usr">
          {user?.map((item, index) => (
            <li onClick={() => initiateConnection(item._id)} key={item._id}>
              {item.email}
            </li>
          ))}
        </ul>
      </div>
      <div className="request-list">
        <h2>Connection Requests</h2>
        <ul>
          {connectionRequest.map((request, index) => (
            <li key={index}>
              Request from: {request.from}, Room: {request.roomId}
              <button
                onClick={() => acceptRequest(request.roomId, request.from)}
              >
                Accept
              </button>
              <button
                onClick={() => rejectRequest(request.roomId, request.from)}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Userlist;

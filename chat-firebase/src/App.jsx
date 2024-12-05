import React from "react";
import Login from "./component/Login";
import Signup from "./component/SIgnup";
import { Route, Routes } from "react-router-dom";
import Userlist from "./component/Userlist";
import Chat from "./component/Chat";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<Userlist />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;

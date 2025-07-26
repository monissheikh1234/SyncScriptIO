import React, { useState } from "react";
import Logo from "../assets/logo1.png";
import StudentImage from "../assets/image.png"; // <-- your image here
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState({ username: false, roomId: false });
  const navigate = useNavigate();

  const generateRoomId = () => {
    setRoomId(uuidv4());
    toast.success("Room ID generated");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const newError = {
      username: username.trim().length === 0,
      roomId: roomId.trim().length === 0,
    };
    if (!username || !roomId) {
      toast.error("Please enter all the fields.");
      setError(newError);
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4">
      <div className="flex flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden max-w-5xl w-full bg-[#1f1f2e]">
        {/* Left: Image */}
        <div className="md:w-1/2 hidden md:block">
          <img
            src={StudentImage}
            alt="Student coding"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center items-center gap-4">
          <img src={Logo} alt="Logo" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold tracking-wide text-neon">Join a Room</h1>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={joinRoom}
          >
            <input
              type="text"
              className="px-4 py-2 rounded bg-[#2a2a3a] text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {error.username && (
              <span className="text-red-500 text-sm">Username cannot be empty!</span>
            )}

            <input
              type="text"
              className="px-4 py-2 rounded bg-[#2a2a3a] text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            {error.roomId && (
              <span className="text-red-500 text-sm">Room ID cannot be empty!</span>
            )}

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded transition-all duration-300"
            >
              Join Room
            </button>
          </form>

          <p className="mt-4 text-sm">
            Don’t have a Room ID?{" "}
            <button
              onClick={generateRoomId}
              className="text-purple-400 underline hover:text-purple-300 ml-1"
            >
              Generate New Room
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

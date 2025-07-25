import React from "react";
import Logo from "../assets/Logo1.png";
import Client from "./Client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ clients, roomId, socketRef }) => {
  const navigate = useNavigate();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied.");
    } catch (error) {
      toast.error("Unable to copy Room ID");
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef && socketRef.current) {
      console.log("[Sidebar] handleLeaveRoom called");
      console.log("[Sidebar] socketRef.current:", socketRef.current);
      console.log("[Sidebar] socketRef.current.id:", socketRef.current.id);
      console.log("[Sidebar] roomId:", roomId);
      socketRef.current.emit("leave-room", { roomId }, () => {
        console.log("[Sidebar] leave-room callback received");
        navigate("/");
      });
    } else {
      console.log("[Sidebar] handleLeaveRoom: socketRef.current is null");
      navigate("/");
    }
  };

  return (
    <div className="text-light h-full">
      <div className="my-4">
        <img src={Logo} alt="Logo" className="mx-auto h-10" />
      </div>
      <hr className="w-3/4 mx-auto" />
      <div className="h-8/12">
        {clients.map((client) => (
          <div className="mt-5" key={client.socketId}>
            <Client socketId={client.socketId} username={client.username} />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center flex-col mt-3 gap-2">
        <button
          onClick={copyRoomId}
          className="bg-green-700 px-1.5 py-1 w-6/12 rounded-sm hover:cursor-pointer hover:bg-green-600"
        >
          Copy Room ID
        </button>
        <button
          onClick={handleLeaveRoom}
          className="bg-red-600 px-1.5 py-1 w-6/12 rounded-sm hover:cursor-pointer hover:bg-red-500"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

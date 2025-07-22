import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import CodeEditor from "../components/CodeEditor";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { initSocket } from "../socket";
import { FiMenu } from "react-icons/fi";

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (location.state?.username) {
      toast.success(`Room joined as ${location.state.username}`);
    }
  }, [location.state?.username]);

  useEffect(() => {
    const init = async () => {
      const handleErr = (err) => {
        toast.error("Socket Connection Failed.");
        navigate("/");
      };

      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErr);
      socketRef.current.on("connect_failed", handleErr);

      socketRef.current.emit("join", {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        // Only show toast for other users
        if (
          username &&
          username !== location.state?.username &&
          socketId !== socketRef.current.id
        ) {
          toast.success(`${username} has joined.`);
        }
        setClients(clients);
      });

      socketRef.current.on("disconnected", ({ socketId, username, clients }) => {
        toast.success(`${username} left the room.`);
        if (clients) {
          setClients(clients);
        } else {
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        }
      });
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
      }
    };
  }, [location.state, navigate, roomId]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen relative" onClick={() => setShowSidebar(false)}>
      <button
        className="absolute top-4 left-4 z-50 md:hidden text-white"
        onClick={(e) => {
          e.stopPropagation();
          setShowSidebar(!showSidebar);
        }}
      >
        <FiMenu size={30} />
      </button>
      <div
        className={`md:w-1/5 bg-gray-900 md:relative fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 z-40 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <Sidebar clients={clients} roomId={roomId} />
      </div>
      <div className="md:w-4/5 w-full">
        <CodeEditor socketRef={socketRef} roomId={roomId} />
      </div>
    </div>
  );
};

export default EditorPage;
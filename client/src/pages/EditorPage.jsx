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
  const joinedToastShown = useRef(false);

  useEffect(() => {
    if (location.state?.username && !joinedToastShown.current) {
      toast.success(`Room joined as ${location.state.username}`, { toastId: "joined-room" });
      joinedToastShown.current = true;
    }
  }, [location.state?.username]);

  useEffect(() => {
    const username = location.state?.username;
    const currentRoomId = roomId;
    // Track last joined/left users to suppress duplicate toasts
    let lastJoined = null;
    let lastLeft = null;

    const init = async () => {
      const handleErr = () => {
        toast.error("Socket Connection Failed.");
        navigate("/");
      };

      socketRef.current = await initSocket();

      socketRef.current.on("connect", () => {
        console.log("[EditorPage] Socket connected with id:", socketRef.current.id);
        console.log("[EditorPage] Username:", username, "RoomId:", currentRoomId);
        socketRef.current.emit("join", {
          roomId: currentRoomId,
          username,
        });
        console.log("[EditorPage] Emitted join event", { roomId: currentRoomId, username });
      });

      socketRef.current.on("connect_error", handleErr);
      socketRef.current.on("connect_failed", handleErr);

      socketRef.current.on("joined", ({ clients, username: joinedUsername, socketId }) => {
        console.log("[EditorPage] joined event received", { clients, joinedUsername, socketId });
        if (
          joinedUsername &&
          joinedUsername !== username &&
          socketId !== socketRef.current.id &&
          lastJoined !== joinedUsername
        ) {
          toast.success(`${joinedUsername} has joined.`);
          lastJoined = joinedUsername;
        }
        // Filter clients to unique usernames
        const uniqueClients = [];
        const usernames = new Set();
        clients.forEach(client => {
          if (!usernames.has(client.username)) {
            usernames.add(client.username);
            uniqueClients.push(client);
          }
        });
        setClients(uniqueClients);
      });

      socketRef.current.on("disconnected", ({ username: leftUsername, clients }) => {
        console.log("[EditorPage] disconnected event received", { leftUsername, clients });
        if (leftUsername && lastLeft !== leftUsername) {
          toast.success(`${leftUsername} left the room.`);
          lastLeft = leftUsername;
        }
        // Filter clients to unique usernames and remove falsy usernames
        const uniqueClients = [];
        const usernames = new Set();
        clients.forEach(client => {
          if (client.username && !usernames.has(client.username)) {
            usernames.add(client.username);
            uniqueClients.push(client);
          }
        });
        setClients(uniqueClients);
      });
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
      }
    };
  }, []);

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
        <Sidebar clients={clients} roomId={roomId} socketRef={socketRef} />
      </div>
      <div className="md:w-4/5 w-full">
        <CodeEditor socketRef={socketRef} roomId={roomId} />
      </div>
    </div>
  );
};

export default EditorPage;
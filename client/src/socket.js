import { io } from "socket.io-client";

const globalAny = typeof window !== "undefined" ? window : global;

export const initSocket = async () => {
  if (globalAny._socketInstance) return globalAny._socketInstance;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // Optional: check backend is up before connecting
  try {
    await fetch(BACKEND_URL, { cache: "no-store" });
  } catch (error) {
    throw error;
  }
  const option = {
    "force new connection": true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };
  globalAny._socketInstance = io(BACKEND_URL, option);
  return globalAny._socketInstance;
};
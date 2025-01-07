// config/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      path: "/socket.io", // Debe coincidir con el servidor
      transports: ["websocket"], // Forzar el uso de WebSocket
      autoConnect: false, // Conexión manual
    });
  }
  return socket;
};

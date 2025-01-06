import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
  if (socket) {
    return socket;
  }

  const serverUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";


  socket = io(serverUrl, {
    autoConnect: false, // El cliente controla la conexión
    transports: ["websocket"], // Usar WebSocket como transporte preferido
  });

  return socket;
};

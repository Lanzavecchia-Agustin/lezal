// app/api/join/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";  // Corregir el path de importación

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function GET(req: Request) {
    console.log("GET /api/join called");
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");

  if (!roomId || !userName) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [],
      scene: {
        id: "scene1",
        text: "Te encuentras en un camino oscuro. Sientes que algo te observa. ¿Qué harás?",
        options: [
          { id: 1, text: "Avanzar con cautela por el camino", nextSceneId: "scene2" },
          { id: 2, text: "Regresar a pedir ayuda a la aldea", nextSceneId: "endingA" },
        ],
      },
      votes: {},
    };
  }

  if (!rooms[roomId].users.includes(userName)) {
    rooms[roomId].users.push(userName);
  }

  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    users: rooms[roomId].users,
    scene: rooms[roomId].scene,
    votes: rooms[roomId].votes,
  });

  return NextResponse.json({ message: "Room joined", room: rooms[roomId] });
}
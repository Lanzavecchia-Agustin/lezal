import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");
  const optionId = searchParams.get("optionId");

  console.log("Current rooms:", rooms);

  if (!roomId || !userName || !optionId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    console.log(`Room not found: ${roomId}`);
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Convertir optionId a un número
  const optionIdNumber = parseInt(optionId, 10);
  if (isNaN(optionIdNumber)) {
    return NextResponse.json({ error: "Invalid optionId" }, { status: 400 });
  }

  // Registrar el voto
  room.votes = room.votes || {};
  room.votes[optionIdNumber] = (room.votes[optionIdNumber] || 0) + 1;

  // Enviar la actualización a través de Pusher
  await pusher.trigger(`room-${roomId}`, "voteUpdate", room.votes);

  return NextResponse.json({ message: "Vote registered", votes: room.votes });
}

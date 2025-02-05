import { NextResponse } from "next/server";
import rooms from "../../../../roomsStore";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");
  const subskillId = searchParams.get("subskillId");

  if (!roomId || !userName || !subskillId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }
  const room = rooms[roomId];
  if (!room) {
    return NextResponse.json({ error: "Sala no existe" }, { status: 404 });
  }
  const player = room.players[userName];
  if (!player) {
    return NextResponse.json({ error: "Jugador no existe" }, { status: 404 });
  }
  if (player.skillPoints <= 0) {
    return NextResponse.json({ error: "No tienes Skill Points" }, { status: 400 });
  }

  player.skillPoints--;
  player.assignedPoints[subskillId] = (player.assignedPoints[subskillId] || 0) + 1;

  // Idealmente hacer un trigger a sceneUpdate o playerUpdate:
  // await pusher.trigger(`room-${roomId}`, "playerUpdate", { ... });

  return NextResponse.json({ success: true, player });
}

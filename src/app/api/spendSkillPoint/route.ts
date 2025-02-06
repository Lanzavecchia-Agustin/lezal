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

  // Consumir el Skill Point y asignarlo a la subhabilidad
  player.skillPoints--;
  player.assignedPoints[subskillId] = (player.assignedPoints[subskillId] || 0) + 1;

  // Notificar a todos los clientes del room con un trigger de "playerUpdate"
  await pusher.trigger(`room-${roomId}`, "playerUpdate", {
    player: {
      name: player.name,
      xp: player.xp,
      skillPoints: player.skillPoints,
      assignedPoints: player.assignedPoints,
      lockedAttributes: player.lockedAttributes,
      life: player.life,
      stress: player.stress,
    },
  });

  return NextResponse.json({ success: true, player });
}

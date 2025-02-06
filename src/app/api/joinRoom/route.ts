// app/api/join/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms, { Player, gameConfig } from "../../../../roomsStore";
import { storyData } from "../../../../storyData";

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
  const typeParam = searchParams.get("type") || "Normal";
  const attributesParam = searchParams.get("attributes") || "";

  console.log("[JOIN] Incoming params =>", { roomId, userName, typeParam, attributesParam });

  if (!roomId || !userName) {
    return NextResponse.json({ error: "roomId y userName son requeridos" }, { status: 400 });
  }

  // Si la sala no existe, la creamos
  if (!rooms[roomId]) {
    rooms[roomId] = {
      scene: storyData.scene1,
      votes: {},
      userVoted: new Set(),
      players: {},
      optionVotes: {},
      lockedConditions: {},
    };
  }
  const room = rooms[roomId];

  let parsedPoints: Record<string, number> = {};
  try {
    parsedPoints = JSON.parse(attributesParam);
  } catch (error) {
    console.log("[JOIN] Error al parsear assignedPoints =>", error);
    return NextResponse.json({ error: "Invalid assignedPoints JSON." }, { status: 400 });
  }

  const existingLeader = Object.values(room.players).find((p) => p.type === "Líder");
  let finalType: "Normal" | "Líder" = "Normal";
  if (typeParam === "Líder" && !existingLeader) {
    finalType = "Líder";
  }

  // Creamos el jugador usando la configuración global para la vida inicial y con estrés en 0
  const newPlayer: Player = {
    name: userName,
    type: finalType,
    assignedPoints: parsedPoints,
    xp: 0,
    skillPoints: 0,
    lockedAttributes: {}, // Inicializamos lockedAttributes como objeto vacío
    life: gameConfig.initialLife, // Por ejemplo, 100 (según lo definido en db.json)
    stress: 0 // Estrés inicial en 0
  };

  room.players[userName] = newPlayer;

  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
  });

  console.log("[JOIN] Player joined =>", userName, "| assignedPoints =>", parsedPoints);
  return NextResponse.json({ message: "Room joined", room });
}

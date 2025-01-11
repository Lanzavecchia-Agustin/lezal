// app/api/join/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms, { Player, ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES } from "../../../../roomsStore";
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
    console.log("[JOIN] Error: roomId y userName son requeridos");
    return NextResponse.json({ error: "roomId y userName son requeridos" }, { status: 400 });
  }

  // Crear sala si no existe
  if (!rooms[roomId]) {
    console.log(`[JOIN] Room ${roomId} no existe, creándola...`);
    rooms[roomId] = {
      scene: storyData.scene1,
      votes: {},
      userVoted: new Set(),
      players: {},
      optionVotes: {},
      // Inicializamos los contadores de condiciones para cada atributo bloqueado
      lockedConditions: LOCKED_ATTRIBUTES.reduce((acc, attr) => {
        acc[attr] = 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  const room = rooms[roomId];

  // Parsear atributos
  const attributeArray = attributesParam
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  console.log("[JOIN] attributeArray parsed =>", attributeArray);

  // Ver si ya existe un Líder
  const existingLeader = Object.values(room.players).find((p) => p.type === "Líder");

  let finalType: "Normal" | "Líder" = "Normal";
  if (typeParam === "Líder" && !existingLeader) {
    finalType = "Líder";
  }

  // Validar atributos
  if (attributeArray.length > 2) {
    console.log("[JOIN] Error: Más de 2 atributos");
    return NextResponse.json({ error: "Máximo 2 atributos." }, { status: 400 });
  }
  for (const attr of attributeArray) {
    if (!ATRIBUTOS_DISPONIBLES.includes(attr)) {
      console.log("[JOIN] Error: Atributo inválido =>", attr);
      return NextResponse.json({ error: `Atributo '${attr}' no es válido.` }, { status: 400 });
    }
  }

  // Crear Player
  const newPlayer: Player = {
    name: userName,
    type: finalType,
    attributes: attributeArray,
  };

  console.log("[JOIN] Creating new player =>", newPlayer);

  room.players[userName] = newPlayer;

  // Notificar a los demás (opcional)
  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
  });

  console.log("[JOIN] Player joined room =>", userName, "| Final type:", finalType);
  return NextResponse.json({ message: "Room joined", room });
}

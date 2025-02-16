import { NextResponse } from "next/server";
import Pusher from "pusher";
// Se importa gameConfig desde la roomstore; ahora es un array de ConfigItem.
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
  // Se elimina la lectura de "type"
  const attributesParam = searchParams.get("attributes") || "";
  // Nuevo parámetro para el avatar
  const avatar = searchParams.get("avatar") || "";

  console.log("[JOIN] Incoming params =>", { roomId, userName, attributesParam, avatar });

  if (!roomId || !userName) {
    return NextResponse.json({ error: "roomId y userName son requeridos" }, { status: 400 });
  }

  if (!rooms[roomId]) {
    // Inicializamos la sala con la escena inicial del juego
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

  // Debido a que gameConfig es ahora un arreglo, obtenemos "initialLife" mediante búsqueda.
  const initialLife = gameConfig.find((item) => item.id === "initialLife")?.value ?? 100;

  // Se asigna siempre el tipo "Normal"
  const newPlayer: Player = {
    name: userName,
    type: "Normal",
    assignedPoints: parsedPoints,
    xp: 0,
    skillPoints: 0,
    lockedAttributes: {},
    life: initialLife,
    stress: 0,
    avatar, // Agregamos el avatar seleccionado
  };

  room.players[userName] = newPlayer;

  // Si ya hay más de un jugador, forzamos la escena de selección de líder
  if (Object.keys(room.players).length > 1) {
    // Generamos dinámicamente las opciones para la selección del líder
    // Se asigna a cada opción un id (comenzando en 1) y el texto con el nombre del jugador.
    const options = Object.values(room.players).map((p, index) => ({
      id: index + 1,
      text: `Seleccionar a ${p.name}`,
      nextSceneId: { success: "scene1", failure: "", partial: "" },
    }));
    room.scene = {
      id: "leaderSelection",
      text: "Vota por el líder. Cada jugador debe emitir su voto. (si hay un empate se elige el líder aleatoriamente)",
      options,
      isEnding: false,
      maxVote: Object.keys(room.players).length,
    };
  }

  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
  });

  console.log("[JOIN] Player joined =>", userName, "| assignedPoints =>", parsedPoints);
  return NextResponse.json({ message: "Room joined", room });
}

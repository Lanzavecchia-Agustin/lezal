// app/api/joinRoom/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import { roomManager } from "@/store/roomsStore";
import { storyData } from "@/store/storyData";

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
  const isHost = searchParams.get("isHost") === "true";

  if (!roomId || !userName) {
    return NextResponse.json(
      { error: "Faltan parámetros requeridos" },
      { status: 400 }
    );
  }

  let room = roomManager.getRoom(roomId);

  // Si la sala no existe y es el host, créala
  if (!room && isHost) {
    room = roomManager.createRoom(roomId, {
      hostName: userName,
      settings: {
        voteTimeLimit: 30,
        minPlayers: 2,
        autoStartWhen: "MANUAL",
      },
    });
  } else if (!room) {
    return NextResponse.json(
      { error: "La sala no existe" },
      { status: 404 }
    );
  }

  // Si la partida ya comenzó, no permitir nuevos jugadores
  if (room.gameState.currentPhase === "PLAYING") {
    return NextResponse.json(
      { error: "La partida ya ha comenzado" },
      { status: 400 }
    );
  }

  // Añadir usuario a la sala
  if (!room.users.includes(userName)) {
    room.users.push(userName);
  }

  // Emitir actualización a todos los usuarios
  await pusher.trigger(`room-${roomId}`, "roomUpdate", {
    users: room.users,
    host: room.host,
    gameState: room.gameState,
    settings: room.settings,
  });

  return NextResponse.json({
    message: "Te has unido a la sala exitosamente",
    room: {
      users: room.users,
      host: room.host,
      gameState: room.gameState,
      settings: room.settings,
      isHost: userName === room.host,
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { roomId, action } = body;

  const room = roomManager.getRoom(roomId);
  if (!room) {
    return NextResponse.json(
      { error: "Sala no encontrada" },
      { status: 404 }
    );
  }

  switch (action) {
    case "START_GAME":
      if (room.users.length < room.settings.minPlayers) {
        return NextResponse.json(
          { error: "No hay suficientes jugadores" },
          { status: 400 }
        );
      }

      roomManager.startGame(roomId);
      
      // Notificar a todos los jugadores que el juego ha comenzado
      await pusher.trigger(`room-${roomId}`, "gameStart", {
        scene: room.scene,
        gameState: room.gameState,
      });

      return NextResponse.json({
        message: "Juego iniciado",
        scene: room.scene,
        gameState: room.gameState,
      });

    default:
      return NextResponse.json(
        { error: "Acción no válida" },
        { status: 400 }
      );
  }
}
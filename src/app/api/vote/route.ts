// app/api/vote/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";
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
  const optionId = searchParams.get("optionId");

  if (!roomId || !userName || !optionId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const optionIdNumber = parseInt(optionId, 10);

  // Registrar el voto
  if (!room.userVoted.has(userName)) {
    room.votes[optionIdNumber] = (room.votes[optionIdNumber] || 0) + 1;
    room.userVoted.add(userName);

    // Notificar la actualización de votos
    await pusher.trigger(`room-${roomId}`, "voteUpdate", {
      votes: room.votes,
      userVoted: Array.from(room.userVoted)
    });

    // Si todos votaron, avanzar a la siguiente escena
    if (room.userVoted.size === room.users.length) {
      // Limpiar el timer si existe
      if (room.voteTimer) {
        clearTimeout(room.voteTimer);
      }
      await advanceScene(roomId);
    } else if (!room.voteTimer) {
      // Si no todos votaron, configurar un timer de 30 segundos
      room.voteTimer = setTimeout(() => {
        advanceScene(roomId);
      }, 30000);
    }
  }

  return NextResponse.json({ 
    success: true, 
    votes: room.votes,
    userVoted: Array.from(room.userVoted)
  });
}

async function advanceScene(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  // Encontrar la opción con más votos
  const winningOptionId = Object.entries(room.votes)
    .reduce((max, [id, votes]) => 
      votes > (room.votes[max] || 0) ? parseInt(id) : max, 
      parseInt(Object.keys(room.votes)[0])
    );

  const nextSceneId = room.scene.options.find(opt => opt.id === winningOptionId)?.nextSceneId;
  if (!nextSceneId || !storyData[nextSceneId]) return;

  // Actualizar la escena y reiniciar votos
  room.scene = storyData[nextSceneId];
  room.votes = {};
  room.userVoted.clear();
  if (room.voteTimer) {
    clearTimeout(room.voteTimer);
    room.voteTimer = undefined;
  }

  // Notificar la nueva escena
  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: room.users,
    userVoted: Array.from(room.userVoted)
  });
}
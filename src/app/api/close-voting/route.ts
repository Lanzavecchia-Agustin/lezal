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

  if (!roomId) {
    return NextResponse.json({ error: "Invalid parameters: roomId is required" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Determinar la opción ganadora
  let maxVotes = 0;
  let winningOptionId: number | null = null;

  for (const [optionId, votes] of Object.entries(room.votes)) {
    const votesCount = Number(votes);
    if (votesCount > maxVotes) {
      maxVotes = votesCount;
      winningOptionId = parseInt(optionId, 10);
    }
  }

  if (winningOptionId === null) {
    return NextResponse.json({ error: "No votes recorded" }, { status: 400 });
  }

  // Encontrar la opción ganadora en la escena actual
  const winningOption = room.scene.options.find((option) => option.id === winningOptionId);
  if (!winningOption) {
    return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
  }

  // Obtener la siguiente escena desde `storyData`
  const nextScene = storyData[winningOption.nextSceneId];
  if (!nextScene) {
    return NextResponse.json({ error: "Next scene not found" }, { status: 404 });
  }

  // Actualizar la sala con la nueva escena
  room.scene = nextScene;
  room.votes = {}; // Reiniciar los votos para la nueva escena

  // Notificar a los usuarios de la nueva escena a través de Pusher
  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: room.users,
  });

  return NextResponse.json({ message: "Voting closed and scene updated", room });
}

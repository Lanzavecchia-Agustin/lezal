// app/api/closeVoting/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";
import { storyData } from "../../../../storyData";
import { SceneOption } from "../../../../roomsStore";

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

  console.log("[closeVoting] GET called with roomId:", roomId);

  if (!roomId) {
    console.log("[closeVoting] Error: roomId is required");
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    console.log("[closeVoting] Error: Room not found for roomId:", roomId);
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  console.log("[closeVoting] Current votes:", room.votes);

  let maxVotes = -1;
  let winningOptionId: number | null = null;

  for (const [optId, v] of Object.entries(room.votes)) {
    const vc = Number(v);
    console.log(`    Option ${optId} has ${vc} votes`);
    if (vc > maxVotes) {
      maxVotes = vc;
      winningOptionId = parseInt(optId, 10);
    }
  }

  if (winningOptionId === null) {
    console.log("[closeVoting] Error: No votes recorded");
    return NextResponse.json({ error: "No votes recorded" }, { status: 400 });
  }

  console.log("[closeVoting] Winning option ID:", winningOptionId);

  const winningOption = room.scene.options.find(
    (o: SceneOption) => o.id === winningOptionId
  );
  if (!winningOption) {
    console.log("[closeVoting] Error: Invalid option ID, no matching option found");
    return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
  }

  // Aquí llamamos a evaluateRequirement
  const nextKey = evaluateRequirement(room, winningOption);
  console.log("[closeVoting] Next key after requirement evaluation:", nextKey);

  const nextScene = storyData[nextKey];
  if (!nextScene) {
    console.log("[closeVoting] Error: Next scene not found for key:", nextKey);
    return NextResponse.json({ error: "Next scene not found" }, { status: 404 });
  }

  // Actualizar la escena en la sala
  room.scene = nextScene;
  // Si no es final, reseteamos las votaciones
  if (!room.scene.isEnding) {
    console.log("[closeVoting] Resetting votes & userVoted since scene is not ending");
    room.votes = {};
    room.userVoted.clear();
    room.optionVotes = {}; // Reiniciar tracking
  }

  // Trigger de Pusher
  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
  });

  console.log("[closeVoting] Voting closed and scene updated for roomId:", roomId);

  return NextResponse.json({
    message: "Voting closed and scene updated",
    room,
  });
}

/**
 * Evalúa SOLO los votantes de la opción ganadora
 */
function evaluateRequirement(room: any, option: SceneOption): string {
  console.log("[evaluateRequirement] Checking requirements for option:", option.id);
  console.log("[evaluateRequirement] Option requirement:", option.requirement);

  // 1) Sin requisitos => success directo
  if (!option.requirement || option.requirement.length === 0) {
    console.log("    - No requirement, returning SUCCESS");
    return option.nextSceneId.success;
  }

  // 2) Si no hay votantes => failure
  const votersSet: Set<string> = room.optionVotes[option.id] || new Set();
  console.log("    - Voters for this option:", Array.from(votersSet));

  if (votersSet.size === 0) {
    console.log("    - No voters, returning FAILURE");
    return option.nextSceneId.failure;
  }

  // 3) Usar directamente `option.requirement` como un array
  const requirements = option.requirement; // ya es un array de strings

  console.log("    - Requirements array:", requirements);

  let atLeastOneHasAll = false;
  let atLeastOneHasSome = false;

  // 4) Revisar a cada votante
  for (const voter of Array.from(votersSet)) {
    const player = room.players[voter];
    if (!player) continue;

    console.log(`    - Checking voter: ${voter}, attributes: ${player.attributes}`);

    // Contar cuántos requisitos cumple
    const matchCount = requirements.filter((req) =>
      player.attributes.includes(req)
    ).length;

    console.log(`      -> Voter ${voter} matches ${matchCount} of ${requirements.length}`);

    // Cumple todos los requisitos
    if (matchCount === requirements.length) {
      atLeastOneHasAll = true;
    }
    // Cumple al menos uno
    if (matchCount > 0) {
      atLeastOneHasSome = true;
    }
  }

  // 5) Decidir resultado
  if (atLeastOneHasAll) {
    console.log("    - At least one has all requirements, returning SUCCESS");
    return option.nextSceneId.success;
  }
  if (atLeastOneHasSome && option.nextSceneId.partial) {
    console.log("    - At least one has partial requirements, returning PARTIAL");
    return option.nextSceneId.partial;
  }

  console.log("    - Nobody satisfies any requirement or no partial route, returning FAILURE");
  return option.nextSceneId.failure;
}

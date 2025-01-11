// app/api/vote/route.ts
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
  console.log("[VOTE] GET called");
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");
  const optionId = searchParams.get("optionId");

  console.log("[VOTE] Params =>", { roomId, userName, optionId });

  if (!roomId || !userName || !optionId) {
    console.log("[VOTE] Error: Parámetros inválidos");
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    console.log("[VOTE] Error: Sala no encontrada =>", roomId);
    return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
  }

  // Asegurar optionVotes
  if (!room.optionVotes) {
    room.optionVotes = {};
  }

  const optionIdNum = parseInt(optionId, 10);
  const sceneOption = room.scene.options.find((o: SceneOption) => o.id === optionIdNum);
  if (!sceneOption) {
    console.log("[VOTE] Error: Opción inválida =>", optionIdNum);
    return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
  }

  // Revisar maxVotes
  const currentVotes = room.votes[optionIdNum] || 0;
  console.log(`[VOTE] currentVotes for option ${optionIdNum}: ${currentVotes}, maxVotes: ${sceneOption.maxVotes ?? "∞"}`);

  if (sceneOption.maxVotes != null && currentVotes >= sceneOption.maxVotes) {
    console.log("[VOTE] Se alcanzó el máximo de votos para esta opción");
    return NextResponse.json({ error: "Se alcanzó el máximo de votos para esta opción" }, { status: 400 });
  }

  // Verificar si es líder
  const isLeader = room.players?.[userName]?.type === "Líder";
  const voteValue = isLeader ? 2 : 1;
  console.log(`[VOTE] ${userName} isLeader=${isLeader} => voteValue=${voteValue}`);

  // Si no ha votado antes
  if (!room.userVoted.has(userName)) {
    room.votes[optionIdNum] = currentVotes + voteValue;
    room.userVoted.add(userName);

    if (!room.optionVotes[optionIdNum]) {
      room.optionVotes[optionIdNum] = new Set();
    }
    room.optionVotes[optionIdNum].add(userName);

    console.log(`[VOTE] ${userName} voted for option ${optionIdNum}. new total = ${room.votes[optionIdNum]}`);
  } else {
    console.log(`[VOTE] ${userName} ya votó anteriormente. Ignorando.`);
  }

  // Avisar a todos del update de votos
  await pusher.trigger(`room-${roomId}`, "voteUpdate", {
    votes: room.votes,
    userVoted: Array.from(room.userVoted),
  });

  // Si todos ya votaron
  if (room.userVoted.size === Object.keys(room.players).length) {
    console.log("[VOTE] Todos han votado, cerramos votación...");
    await closeVotingAndAdvance(roomId);
  }

  return NextResponse.json({
    success: true,
    votes: room.votes,
    userVoted: Array.from(room.userVoted),
  });
}

async function closeVotingAndAdvance(roomId: string) {
  console.log("[closeVotingAndAdvance] Called =>", roomId);
  const room = rooms[roomId];
  if (!room) {
    console.log("[closeVotingAndAdvance] room not found =>", roomId);
    return;
  }

  // Determinar opción ganadora
  let maxVotes = -1;
  let winningOptionId: number | null = null;
  for (const [optId, voteCount] of Object.entries(room.votes)) {
    const vc = Number(voteCount);
    if (vc > maxVotes) {
      maxVotes = vc;
      winningOptionId = parseInt(optId, 10);
    }
  }
  if (winningOptionId === null) {
    console.log("[closeVotingAndAdvance] No votes found, returning.");
    return;
  }
  console.log("[closeVotingAndAdvance] winningOptionId =>", winningOptionId);

  const winningOption = room.scene.options.find(o => o.id === winningOptionId);
  if (!winningOption) {
    console.log("[closeVotingAndAdvance] Invalid option =>", winningOptionId);
    return;
  }

  const nextKey = evaluateRequirement(room, winningOption);
  console.log("[closeVotingAndAdvance] nextKey =>", nextKey);

  const nextScene = storyData[nextKey];
  if (!nextScene) {
    console.log("[closeVotingAndAdvance] No scene found for =>", nextKey);
    return;
  }

  room.scene = nextScene;
  if (!room.scene.isEnding) {
    console.log("[closeVotingAndAdvance] Not an ending, resetting votes, userVoted, optionVotes");
    room.votes = {};
    room.userVoted.clear();
    room.optionVotes = {};
  }

  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map(p => p.name),
    userVoted: Array.from(room.userVoted),
  });
}

function evaluateRequirement(room: any, option: SceneOption): string {
  console.log("[evaluateRequirement] Checking =>", option.id, " requirement:", option.requirement);
  
  if (!option.requirement) {
    console.log("   => No requirement => success");
    return option.nextSceneId.success;
  }

  const votersSet: Set<string> = room.optionVotes[option.id] || new Set();
  if (votersSet.size === 0) {
    console.log("   => No voters => failure");
    return option.nextSceneId.failure;
  }

  // Si manejas la posibilidad de varios requisitos con comas:
  const requirements = option.requirement.includes(",")
    ? option.requirement.split(",").map(r => r.trim())
    : [option.requirement];

  let atLeastOneHasAll = false;
  let atLeastOneHasSome = false;

  for (const voter of Array.from(votersSet)) {
    const player = room.players[voter];
    if (!player) continue;

    const matchCount = requirements.filter((req) =>
      player.attributes.includes(req)
    ).length;

    // Cumple TODOS
    if (matchCount === requirements.length) {
      atLeastOneHasAll = true;
    }
    // Cumple al menos uno
    if (matchCount > 0) {
      atLeastOneHasSome = true;
    }
  }

  if (atLeastOneHasAll) {
    console.log("   => At least one has ALL => SUCCESS");
    return option.nextSceneId.success;
  }
  if (atLeastOneHasSome && option.nextSceneId.partial) {
    console.log("   => At least one has SOME => PARTIAL");
    return option.nextSceneId.partial;
  }
  console.log("   => No compliance => FAILURE");
  return option.nextSceneId.failure;
}

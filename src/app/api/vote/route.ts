import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms from "../../../../roomsStore";
import { storyData } from "../../../../storyData";
import { SceneOption, UNLOCK_THRESHOLDS } from "../../../../roomsStore";

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

  // Revisar maxVotes:
  const currentVotes = room.votes[optionIdNum] || 0;
  console.log(
    `[VOTE] currentVotes for option ${optionIdNum}: ${currentVotes}, maxVotes: ${sceneOption.maxVotes ?? "∞"}`
  );
  if (sceneOption.maxVotes != null && currentVotes >= sceneOption.maxVotes) {
    console.log("[VOTE] Se alcanzó el máximo de votos para esta opción");
    return NextResponse.json(
      { error: "Se alcanzó el máximo de votos para esta opción" },
      { status: 400 }
    );
  }

  // Verificar si el usuario es Líder (voto doble)
  const isLeader = room.players?.[userName]?.type === "Líder";
  const voteValue = isLeader ? 2 : 1;
  console.log(`[VOTE] ${userName} isLeader=${isLeader} => voteValue=${voteValue}`);

  // Si el usuario aún no ha votado
  if (!room.userVoted.has(userName)) {
    room.votes[optionIdNum] = currentVotes + voteValue;
    room.userVoted.add(userName);
    if (!room.optionVotes[optionIdNum]) {
      room.optionVotes[optionIdNum] = new Set();
    }
    room.optionVotes[optionIdNum].add(userName);
    console.log(
      `[VOTE] ${userName} voted for option ${optionIdNum}. New total = ${room.votes[optionIdNum]}`
    );
  } else {
    console.log(`[VOTE] ${userName} ya votó anteriormente. Ignorando.`);
  }

  // Avisar a todos del update de votos
  await pusher.trigger(`room-${roomId}`, "voteUpdate", {
    votes: room.votes,
    userVoted: Array.from(room.userVoted),
  });

  // Si se cumplen las condiciones de cierre de votación
  if (
    (sceneOption.maxVotes != null && room.votes[optionIdNum] >= sceneOption.maxVotes) ||
    (sceneOption.maxVotes == null &&
      room.userVoted.size === Object.keys(room.players).length)
  ) {
    console.log("[VOTE] Condición alcanzada, cerramos votación...");
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
    console.log("[closeVotingAndAdvance] Room not found =>", roomId);
    return;
  }

  // Determinar opción ganadora
  let maxVotes = -1;
  let winningOptionId: number | null = null;
  for (const [optId, voteCount] of Object.entries(room.votes)) {
    const vc = Number(voteCount);
    console.log(`    Option ${optId} has ${vc} votes`);
    if (vc > maxVotes) {
      maxVotes = vc;
      winningOptionId = parseInt(optId, 10);
    }
  }
  if (winningOptionId === null) {
    console.log("[closeVotingAndAdvance] No votes found, returning.");
    return;
  }
  console.log("[closeVotingAndAdvance] Winning option ID =>", winningOptionId);
  const winningOption = room.scene.options.find(
    (o: SceneOption) => o.id === winningOptionId
  );
  if (!winningOption) {
    console.log("[closeVotingAndAdvance] Invalid option =>", winningOptionId);
    return;
  }

  // Si la opción tiene incremento para un atributo bloqueado, actualizar el contador
  if (winningOption.lockedAttributeIncrement) {
    const { attribute, increment } = winningOption.lockedAttributeIncrement;
    if (room.lockedConditions[attribute] !== undefined) {
      room.lockedConditions[attribute] += increment;
      console.log(
        `[closeVotingAndAdvance] Se suma ${increment} a ${attribute}. Total: ${room.lockedConditions[attribute]}`
      );
    }
  }

  // Verificar si alguno de los atributos bloqueados alcanza su umbral
  Object.keys(room.lockedConditions).forEach(attribute => {
    if (room.lockedConditions[attribute] >= UNLOCK_THRESHOLDS[attribute]) {
      // Desbloquear para todos los jugadores: se agrega el atributo si aún no lo tienen
      Object.values(room.players).forEach(player => {
        if (!player.attributes.includes(attribute)) {
          player.attributes.push(attribute);
          console.log(`[closeVotingAndAdvance] ${attribute} desbloqueado para ${player.name}`);
        }
      });
      // (Opcional) Reiniciar el contador para el atributo desbloqueado:
      // room.lockedConditions[attribute] = 0;
    }
  });

  const nextKey = evaluateRequirement(room, winningOption);
  console.log("[closeVotingAndAdvance] Next key =>", nextKey);
  const nextScene = storyData[nextKey];
  if (!nextScene) {
    console.log("[closeVotingAndAdvance] Error: Next scene not found for key:", nextKey);
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
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
    lockedConditions: room.lockedConditions,
  });
}

function evaluateRequirement(room: any, option: SceneOption): string {
  console.log("[evaluateRequirement] Checking requirements for option:", option.id);
  console.log("[evaluateRequirement] Option requirement:", option.requirement);

  // 1) Sin requisitos → retorna success
  if (!option.requirement || option.requirement.length === 0) {
    console.log("    - No requirement, returning SUCCESS");
    return option.nextSceneId.success;
  }

  // 2) Si no hay votantes, retorna failure
  const votersSet: Set<string> = room.optionVotes[option.id] || new Set();
  console.log("    - Voters for this option:", Array.from(votersSet));
  if (votersSet.size === 0) {
    console.log("    - No voters, returning FAILURE");
    return option.nextSceneId.failure;
  }

  // 3) Revisar requisitos
  const requirements = option.requirement; // array de strings
  console.log("    - Requirements array:", requirements);

  let atLeastOneHasAll = false;
  let atLeastOneHasSome = false;

  for (const voter of Array.from(votersSet)) {
    const player = room.players[voter];
    if (!player) continue;
    console.log(`    - Checking voter: ${voter}, attributes: ${player.attributes}`);
    const matchCount = requirements.filter((req) =>
      player.attributes.includes(req)
    ).length;
    console.log(`      -> Voter ${voter} matches ${matchCount} of ${requirements.length}`);
    if (matchCount === requirements.length) {
      atLeastOneHasAll = true;
    }
    if (matchCount > 0) {
      atLeastOneHasSome = true;
    }
  }
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

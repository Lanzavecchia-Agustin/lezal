// app/api/vote/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms, { Player } from "../../../../roomsStore"; 
import { SCENES } from "../../../../roomsStore";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

// Definimos un umbral para subir de nivel (ej. 5 XP)
const XP_THRESHOLD = 5;

export async function GET(req: Request) {
  console.log("[VOTE] GET called");
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");
  const optionId = searchParams.get("optionId");

  if (!roomId || !userName || !optionId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const room = rooms[roomId];
  if (!room) {
    return NextResponse.json({ error: "Sala no existe" }, { status: 404 });
  }

  const optIdNum = parseInt(optionId, 10);
  const sceneOption = room.scene.options.find((o) => o.id === optIdNum);
  if (!sceneOption) {
    return NextResponse.json({ error: "Opción no válida" }, { status: 400 });
  }

  // --------------------------------------------------------------------
  // 1) Determinamos cuántos votos son necesarios para cerrar esta escena.
  //    - Si la escena no tiene 'maxVote', usamos el número total de jugadores.
  //    - Sino, usamos la lógica: "effectiveMaxVotes = min(sceneMaxVote, totalJugadores)".
  // --------------------------------------------------------------------
  const playerCount = Object.keys(room.players).length;
  // Usa playerCount por defecto si no hay maxVote en la escena
  const sceneMaxVote = room.scene.maxVote ?? playerCount;
  // Prevenimos un bloqueo si maxVote > número de jugadores, tomando el mínimo
  const effectiveMaxVotes = Math.min(sceneMaxVote, playerCount);

  // --------------------------------------------------------------------
  // 2) Registrar el voto si el usuario no había votado antes.
  // --------------------------------------------------------------------
  if (!room.userVoted.has(userName)) {
    room.votes[optIdNum] = (room.votes[optIdNum] || 0) + 1;
    room.userVoted.add(userName);
    console.log(`[VOTE] ${userName} votó por la opción ID=${optIdNum}`);
  } else {
    console.log(`[VOTE] Ignorado voto repetido de ${userName}`);
  }

  // --------------------------------------------------------------------
  // 3) Notificar a todos el nuevo estado de votos
  // --------------------------------------------------------------------
  await pusher.trigger(`room-${roomId}`, "voteUpdate", {
    votes: room.votes,
    userVoted: Array.from(room.userVoted),
  });

  // --------------------------------------------------------------------
  // 4) Verificamos si ya se alcanzó el número de votos necesarios
  //    (effectiveMaxVotes). En ese caso, cerramos la votación y
  //    resolvemos la acción de la escena.
  // --------------------------------------------------------------------
  if (room.userVoted.size === effectiveMaxVotes) {
    console.log(
      `[VOTE] Se alcanzó el límite de votos (${effectiveMaxVotes}). Resolvemos la escena.`
    );

    // Determinamos la opción ganadora (la más votada)
    const winningOptionId = findWinningOption(room.votes);
    console.log("[VOTE] Opción ganadora:", winningOptionId);

    // Avanzamos la escena según la lógica Disco Elysium
    await resolveCheckAndAdvance(roomId, winningOptionId);
  }

  return NextResponse.json({ success: true, votes: room.votes });
}

// --------------------------------------------------------------------
//  Función que determina la opción más votada.
// --------------------------------------------------------------------
function findWinningOption(votes: Record<number, number>): number {
  let maxVotes = -1;
  let winningOptionId = -1;
  for (const [optId, count] of Object.entries(votes)) {
    const voteCount = Number(count);
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      winningOptionId = parseInt(optId, 10);
    }
  }
  return winningOptionId;
}

// --------------------------------------------------------------------
//  Función que hace la lógica "Disco Elysium style" (roll cooperativo)
// --------------------------------------------------------------------
async function resolveCheckAndAdvance(roomId: string, winningOptionId: number) {
  const room = rooms[roomId];
  if (!room) return;

  const option = room.scene.options.find((o) => o.id === winningOptionId);
  if (!option) return;

  // 1) Determinamos si hay un roll
  if (!option.roll) {
    // Sin tirada => asumimos éxito automático
    goToScene(room, option.nextSceneId.success ?? "");
    return broadcastSceneUpdate(roomId);
  }

  // 2) Tirada "cooperativa": basta con que al menos 1 jugador pase la dificultad
  let success = false;

  for (const playerName of room.userVoted) {
    const player = room.players[playerName];
    if (!player) continue;

    const skillVal = getSkillValue(player, option.roll.skillUsed);
    const diceRoll = roll2d6();
    const total = diceRoll + skillVal;
    console.log(
      `[resolveCheck] Player ${playerName} => dice=${diceRoll}, skillVal=${skillVal}, total=${total}, diff=${option.roll.difficulty}`
    );

    // Si alguno pasa la dificultad => éxito para todos
    if (total >= option.roll.difficulty) {
      console.log(`[resolveCheck] ÉXITO para ${playerName}`);
      success = true;

      // Otorgamos XP
      if (option.expOnSuccess) {
        player.xp += option.expOnSuccess;
        // Chequeamos si sube de nivel
        while (player.xp >= XP_THRESHOLD) {
          player.skillPoints++;
          player.xp -= XP_THRESHOLD;
        }
      }
      // Rompemos el loop si basta con un solo éxito
      break;
    }
  }

  // 3) Decidir la escena siguiente (success/failure)
  const nextKey = success
    ? option.nextSceneId.success
    : option.nextSceneId.failure || "";

  goToScene(room, nextKey);
  await broadcastSceneUpdate(roomId);
}

// --------------------------------------------------------------------
//  Funciones utilitarias
// --------------------------------------------------------------------
function roll2d6(): number {
  return (
    Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)
  );
}

function getSkillValue(player: Player, skillId: string): number {
  return player.assignedPoints[skillId] || 0;
}

function goToScene(room: any, sceneId: string) {
  if (!sceneId) return;
  const nextScene = SCENES.find((s) => s.id === sceneId);
  if (!nextScene) return;
  room.scene = nextScene;

  // Si no es final, reseteamos las votaciones
  if (!room.scene.isEnding) {
    room.votes = {};
    room.userVoted.clear();
    room.optionVotes = {};
  }
}

async function broadcastSceneUpdate(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;
  await pusher.trigger(`room-${roomId}`, "sceneUpdate", {
    scene: room.scene,
    votes: room.votes,
    users: Object.values(room.players).map((p) => p.name),
    userVoted: Array.from(room.userVoted),
    // Podrías incluir los stats de cada jugador
    players: Object.values(room.players).map((p) => ({
      name: p.name,
      xp: p.xp,
      skillPoints: p.skillPoints,
      // assignedPoints: p.assignedPoints // si lo quieres en el front
    })),
  });
}

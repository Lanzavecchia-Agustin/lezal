import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms, { Player, SCENES } from "../../../../roomsStore";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

// Umbral para subir de nivel (XP)
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

  if (!room.userVoted.has(userName)) {
    room.votes[optIdNum] = (room.votes[optIdNum] || 0) + 1;
    room.userVoted.add(userName);

    // Si la opción incrementa algún atributo bloqueado, se aplica a TODOS los jugadores (como antes)
    if (sceneOption.lockedAttributeIncrement) {
      const attr = sceneOption.lockedAttributeIncrement.attribute;
      const increment = sceneOption.lockedAttributeIncrement.increment;
      for (const pName in room.players) {
        const player = room.players[pName];
        if (!player.lockedAttributes) {
          player.lockedAttributes = {};
        }
        player.lockedAttributes[attr] = (player.lockedAttributes[attr] || 0) + increment;
        console.log(
          `[VOTE] Se incrementó el atributo ${attr} de ${pName} en ${increment}. Valor actual: ${player.lockedAttributes[attr]}`
        );
      }
    }
  }

  await pusher.trigger(`room-${roomId}`, "voteUpdate", {
    votes: room.votes,
    userVoted: Array.from(room.userVoted),
  });

  const playerCount = Object.keys(room.players).length;
  const sceneMaxVote = room.scene.maxVote ?? playerCount;
  const effectiveMaxVotes = Math.min(sceneMaxVote, playerCount);

  if (room.userVoted.size === effectiveMaxVotes) {
    console.log(`[VOTE] Se alcanzaron los ${effectiveMaxVotes} votos necesarios. Resolviendo escena...`);
    const winningOptionId = findWinningOption(room.votes);
    await resolveCheckAndAdvance(roomId, winningOptionId);
  }

  return NextResponse.json({ success: true, votes: room.votes });
}

function findWinningOption(votes: Record<number, number>): number {
  let maxVotes = -1;
  let winningOptionId = -1;
  for (const [optionId, count] of Object.entries(votes)) {
    const vc = Number(count);
    if (vc > maxVotes) {
      maxVotes = vc;
      winningOptionId = parseInt(optionId, 10);
    }
  }
  return winningOptionId;
}

async function resolveCheckAndAdvance(roomId: string, winningOptionId: number) {
  const room = rooms[roomId];
  if (!room) return;
  const option = room.scene.options.find((o) => o.id === winningOptionId);
  if (!option) return;

  if (!option.roll) {
    // Si no hay tirada, se considera éxito automáticamente
    applyEffectsToVoters(room, option, true);
    goToScene(room, option.nextSceneId.success ?? "");
    return broadcastSceneUpdate(roomId);
  }

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
    if (total >= option.roll.difficulty) {
      success = true;
      break;
    }
  }

  if (success && option.expOnSuccess) {
    for (const pName in room.players) {
      const p = room.players[pName];
      p.xp += option.expOnSuccess;
      while (p.xp >= XP_THRESHOLD) {
        p.skillPoints++;
        p.xp -= XP_THRESHOLD;
      }
    }
  }

  // Aplicar efectos a los jugadores que votaron
  applyEffectsToVoters(room, option, success);

  const nextKey = success ? option.nextSceneId.success : option.nextSceneId.failure ?? "";
  goToScene(room, nextKey);
  await broadcastSceneUpdate(roomId);
}

/**
 * Aplica los efectos (de vida y estrés) solamente a los jugadores que hayan votado.
 * Si solo un jugador votó, solo se le aplican a él; si varios votaron, se aplican a cada uno de ellos.
 */
function applyEffectsToVoters(room: any, option: any, success: boolean) {
  const effects = success ? option.successEffects : option.failureEffects;
  if (!effects) return;
  for (const pName of room.userVoted) {
    const player = room.players[pName];

    if (effects.life !== undefined) {
      // Si se trata de un efecto positivo (sumar vida)
      if (effects.life > 0) {
        if (player.life < 100) {
          const nuevaVida = player.life + effects.life;
          player.life = Math.min(nuevaVida, 100);
          console.log(
            `[EFFECT] ${pName} aumenta la vida en ${effects.life} (ahora ${player.life})`
          );
        } else {
          console.log(
            `[EFFECT] ${pName} tiene la vida completa (100) y no se aplica el efecto de sanación.`
          );
        }
      } else {
        // Efecto negativo: se resta la vida, sin forzar un mínimo (o si deseas, clámplelo a 0)
        player.life += effects.life;
        player.life = Math.max(player.life, 0);
        console.log(
          `[EFFECT] ${pName} pierde ${-effects.life} de vida (ahora ${player.life})`
        );
      }
    }

    if (effects.stress !== undefined) {
      // Si se trata de quitar estrés (efecto negativo)
      if (effects.stress < 0) {
        if (player.stress > 0) {
          const nuevoStress = player.stress + effects.stress;
          player.stress = Math.max(nuevoStress, 0);
          console.log(
            `[EFFECT] ${pName} reduce el estrés en ${-effects.stress} (ahora ${player.stress})`
          );
        } else {
          console.log(
            `[EFFECT] ${pName} ya tiene el estrés en 0 y no se aplica la reducción.`
          );
        }
      } else {
        // Efecto positivo: se aumenta el estrés
        player.stress += effects.stress;
        console.log(
          `[EFFECT] ${pName} aumenta el estrés en ${effects.stress} (ahora ${player.stress})`
        );
      }
    }
  }
}

function roll2d6(): number {
  return Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
}

function getSkillValue(player: Player, skillId: string): number {
  return player.assignedPoints[skillId] || 0;
}

function goToScene(room: any, sceneId: string) {
  if (!sceneId) return;
  const nextScene = SCENES.find((s) => s.id === sceneId);
  if (!nextScene) return;
  room.scene = nextScene;
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
    players: Object.values(room.players).map((p) => ({
      name: p.name,
      xp: p.xp,
      skillPoints: p.skillPoints,
      lockedAttributes: p.lockedAttributes,
      life: p.life,
      stress: p.stress,
    })),
  });
}

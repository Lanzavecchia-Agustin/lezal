import { NextResponse } from "next/server";
import Pusher from "pusher";
import rooms, { Player, SCENES, gameConfig } from "../../../../roomsStore";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

// Umbral para subir de nivel (XP) se obtiene del array gameConfig.
const XP_THRESHOLD =
  gameConfig.find((item) => item.id === "xpThreshold")?.value ?? 1;

// Función que obtiene el umbral de estrés de gameConfig.
function getStressThreshold(): number {
  return gameConfig.find((item) => item.id === "stressThreshold")?.value ?? 100;
}

/**
 * Revisa si algún jugador ha alcanzado 0 de vida o 100 de estrés.
 * Si es así, retorna el ID de la escena de Game Over correspondiente.
 * Si no, retorna null.
 */
function checkGameOver(room: any): string | null {
  const stressThreshold = getStressThreshold();
  for (const pName in room.players) {
    const player = room.players[pName];
    if (player.life <= 0) {
      console.log(`[GAME OVER] ${pName} alcanzó 0 de vida.`);
      return "gameOverLife"; // ID de la escena para Game Over por falta de vida.
    }
    if (player.stress >= stressThreshold) {
      console.log(`[GAME OVER] ${pName} alcanzó ${stressThreshold} de estrés.`);
      return "gameOverStress"; // ID de la escena para Game Over por exceso de estrés.
    }
  }
  return null;
}

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

  // Si la escena es la de selección de líder, la lógica es especial.
  if (room.scene.id === "leaderSelection") {
    // Cada opción corresponde a un jugador (según el orden de las opciones generadas en el join)
    room.votes[optIdNum] = (room.votes[optIdNum] || 0) + 1;
    room.userVoted.add(userName);

    await pusher.trigger(`room-${roomId}`, "voteUpdate", {
      votes: room.votes,
      userVoted: Array.from(room.userVoted),
    });

    const playerCount = Object.keys(room.players).length;
    const sceneMaxVote = room.scene.maxVote ?? playerCount;
    const effectiveMaxVotes = Math.min(sceneMaxVote, playerCount);

    if (room.userVoted.size === effectiveMaxVotes) {
      console.log(
        `[VOTE] Se alcanzaron los ${effectiveMaxVotes} votos en leaderSelection. Resolviendo elección...`
      );
      const winningOptionId = findWinningOption(room.votes);
      // Las opciones se crearon en el mismo orden que Object.values(room.players)
      const playersArray = Object.values(room.players);
      // En caso de empate o error, se selecciona aleatoriamente
      const selectedPlayer =
        playersArray[winningOptionId - 1] ||
        playersArray[Math.floor(Math.random() * playersArray.length)];
      if (selectedPlayer) {
        selectedPlayer.type = "Líder";
      }
      // Notificamos a los clientes el líder seleccionado
      await pusher.trigger(`room-${roomId}`, "leaderSelected", {
        leader: selectedPlayer?.name || "",
      });
      // Avanzamos a la siguiente escena (por ejemplo, "scene1")
      goToScene(room, "scene1");
      // Reiniciamos votos y usuarios que votaron
      room.votes = {};
      room.userVoted.clear();
      return broadcastSceneUpdate(roomId);
    }
    return NextResponse.json({ success: true, votes: room.votes });
  }

  // Para escenas normales: se valida la opción elegida
  const sceneOption = room.scene.options.find((o) => o.id === optIdNum);
  if (!sceneOption) {
    return NextResponse.json({ error: "Opción no válida" }, { status: 400 });
  }

  if (!room.userVoted.has(userName)) {
    // Si el votante es el líder, su voto vale 2, de lo contrario vale 1.
    const voteIncrement = room.players[userName].type === "Líder" ? 2 : 1;
    room.votes[optIdNum] = (room.votes[optIdNum] || 0) + voteIncrement;
    room.userVoted.add(userName);

    // Incremento único de atributo bloqueado
    if (sceneOption.lockedAttributeIncrement && !room.lockedAttributeIncrementApplied) {
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
      room.lockedAttributeIncrementApplied = true;
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
    console.log(
      `[VOTE] Se alcanzaron los ${effectiveMaxVotes} votos necesarios. Resolviendo escena...`
    );
    const winningOptionId = findWinningOption(room.votes);
    await resolveCheckAndAdvance(roomId, winningOptionId);
  }

  return NextResponse.json({ success: true, votes: room.votes });
}

/**
 * Determina la opción ganadora:
 * - Obtiene el máximo de votos.
 * - Recolecta todas las opciones que tengan ese máximo.
 * - Si hay empate, selecciona aleatoriamente una de las opciones empatadas.
 */
function findWinningOption(votes: Record<number, number>): number {
  const maxVotes = Math.max(...Object.values(votes));
  const tiedOptions = Object.entries(votes)
    .filter(([optionId, count]) => Number(count) === maxVotes)
    .map(([optionId]) => parseInt(optionId, 10));

  if (tiedOptions.length > 1) {
    const randomIndex = Math.floor(Math.random() * tiedOptions.length);
    return tiedOptions[randomIndex];
  }
  return tiedOptions[0];
}

async function resolveCheckAndAdvance(roomId: string, winningOptionId: number) {
  const room = rooms[roomId];
  if (!room) return;
  const option = room.scene.options.find((o) => o.id === winningOptionId);
  if (!option) return;

  if (!option.roll) {
    // Si no hay tirada, se considera éxito automáticamente
    applyEffectsToVoters(room, option, true);

    // Verificar si se cumplió la condición de Game Over
    const gameOverSceneId = checkGameOver(room);
    if (gameOverSceneId) {
      room.scene = {
        id: gameOverSceneId,
        text: "¡Game Over! Un jugador alcanzó 0 de vida o 100 de estrés.",
        options: [],
      };
      return broadcastSceneUpdate(roomId);
    }

    goToScene(room, option.nextSceneId.success ?? "");
    return broadcastSceneUpdate(roomId);
  }

  let success = false;
  for (const playerName of room.userVoted) {
    const player = room.players[playerName];
    if (!player) continue;
    // Se asume que option.roll.skillUsed ya es una clave compuesta
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

  // Aplicar efectos (vida y estrés) a los jugadores que votaron
  applyEffectsToVoters(room, option, success);

  // Verificar si se cumple la condición de Game Over después de aplicar los efectos
  const gameOverSceneId = checkGameOver(room);
  if (gameOverSceneId) {
    room.scene = {
      id: gameOverSceneId,
      text: "¡Game Over! Un jugador alcanzó 0 de vida o 100 de estrés.",
      options: [],
    };
    return broadcastSceneUpdate(roomId);
  }

  const nextKey = success ? option.nextSceneId.success : option.nextSceneId.failure ?? "";
  goToScene(room, nextKey);
  await broadcastSceneUpdate(roomId);
}

/**
 * Aplica los efectos (vida y estrés) a los jugadores que hayan votado.
 */
function applyEffectsToVoters(room: any, option: any, success: boolean) {
  const effects = success ? option.successEffects : option.failureEffects;
  if (!effects) return;
  for (const pName of room.userVoted) {
    const player = room.players[pName];

    if (effects.life !== undefined) {
      if (effects.life > 0) {
        if (player.life < 100) {
          const nuevaVida = player.life + effects.life;
          player.life = Math.min(nuevaVida, 100);
          console.log(`[EFFECT] ${pName} aumenta la vida en ${effects.life} (ahora ${player.life})`);
        } else {
          console.log(`[EFFECT] ${pName} tiene la vida completa (100) y no se aplica el efecto de sanación.`);
        }
      } else {
        player.life += effects.life;
        player.life = Math.max(player.life, 0);
        console.log(`[EFFECT] ${pName} pierde ${-effects.life} de vida (ahora ${player.life})`);
      }
    }

    if (effects.stress !== undefined) {
      if (effects.stress < 0) {
        if (player.stress > 0) {
          const nuevoStress = player.stress + effects.stress;
          player.stress = Math.max(nuevoStress, 0);
          console.log(`[EFFECT] ${pName} reduce el estrés en ${-effects.stress} (ahora ${player.stress})`);
        } else {
          console.log(`[EFFECT] ${pName} ya tiene el estrés en 0 y no se aplica la reducción.`);
        }
      } else {
        player.stress += effects.stress;
        console.log(`[EFFECT] ${pName} aumenta el estrés en ${effects.stress} (ahora ${player.stress})`);
      }
    }
  }
}

function roll2d6(): number {
  return Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
}

function getSkillValue(player: Player, skillKey: string): number {
  // Se asume que skillKey es la clave compuesta (por ejemplo, "0-1")
  return player.assignedPoints[skillKey] || 0;
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
    room.lockedAttributeIncrementApplied = false;
  }
}

async function broadcastSceneUpdate(roomId: string) {
  const room = rooms[roomId];
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
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
  return NextResponse.json({ success: true, scene: room.scene });
}

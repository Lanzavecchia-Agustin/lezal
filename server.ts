import Pusher from "pusher";
import 'dotenv/config';

import  { Scene } from "./roomsStore";

/** ------------------------------------------------------------------
 * Configuración de Pusher
 * ------------------------------------------------------------------*/
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});


/** ------------------------------------------------------------------
 * Helper para resetear votos de una escena
 * ------------------------------------------------------------------*/
export function resetVotesForScene(scene: Scene): Record<number, number> {
  const votes: Record<number, number> = {};
  scene.options.forEach((opt) => {
    votes[opt.id] = 0;
  });
  return votes;
}
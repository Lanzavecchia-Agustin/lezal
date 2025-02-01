// roomsStore.ts
import db from "./db.json"

export interface Attributes {
  id: string;
  name: string;
  unlockable: boolean;
  unlock_threshold?: number;
}

// Otras constantes y código...
export const ATRIBUTOS_DISPONIBLES: string[] = db.attributes
  .filter((attr: any) => attr.unlockable === false)
  .map((attr: any) => attr.name);

export const LOCKED_ATTRIBUTES: string[] = db.attributes
  .filter((attr: any) => attr.unlockable === true)
  .map((attr: any) => attr.name);

export const UNLOCK_THRESHOLDS: Record<string, number> = db.attributes
  .filter((attr: any) => attr.unlockable === true)
  .reduce((acc: Record<string, number>, attr: any) => {
    acc[attr.name] = attr.unlock_threshold || 0;
    return acc;
  }, {});



// Interfaz de Jugador
export interface Player {
  name: string;
  type: "Normal" | "Líder";
  attributes: string[];  // Estos serán los atributos "elegidos" inicialmente (máx. 2) 
                           // *Luego* se agregarán los desbloqueados sin límite.
}

// Interfaz SceneOption extendida con requirement, maxVotes, etc.
export interface SceneOption {
  id: number;
  text: string;
  requirement?: string[];
  maxVotes?: number;
  lockedAttributeIncrement?: { attribute: string; increment: number };
  nextSceneId: {
    success: string;
    failure?: string;  // ahora es opcional
    partial?: string;  // ahora es opcional
  };
}


// Escena
export interface Scene {
  id: string;
  text: string;
  options: SceneOption[];
  isEnding?: boolean;
}

// Estado de la Sala
export interface RoomState {
  scene: Scene;
  votes: Record<number, number>;
  userVoted: Set<string>;
  players: Record<string, Player>;
  // Agregamos la propiedad `optionVotes`
  optionVotes: Record<number, Set<string>>;
  voteTimer?: NodeJS.Timeout;
  // Nuevo: Contador global para cada atributo bloqueado
  lockedConditions: Record<string, number>;
}

// Almacén global de salas
const rooms: Record<string, RoomState> = {};
export default rooms;

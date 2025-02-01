// roomsStore.ts
import db from "./db.json"

/*
A continuación se establecen las constantes de los atributos. 
Se recorre la base de datos JSON y se agregan los elementos a las constantes.
*/
export const ATRIBUTOS_DISPONIBLES: string[] = db.attributes
      .filter((attribute) => !attribute.unlockable) 
      .map((attribute) => attribute.name); 

export const LOCKED_ATTRIBUTES:string[] = db.attributes
.filter((attribute) => attribute.unlockable) 
.map((attribute) => attribute.name);

// Definimos los umbrales para desbloquear cada atributo secreto
export const UNLOCK_THRESHOLDS: Record<string, number> = db.attributes
.filter((attribute) => attribute.unlockable)
.reduce((acc, attribute) => {
  acc[attribute.name] = attribute.unlock_threshold || 0;
  return acc;
}, {} as Record<string, number>);


export interface Attributes {
  name: string;
  unlocked: boolean;
  unlockedCondition?: number;
}

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

// roomsStore.ts

// Atributos disponibles
export const ATRIBUTOS_DISPONIBLES: string[] = ["fuerte", "inteligente", "carismatico", "trolo", "autista", "otaku"]

export const LOCKED_ATTRIBUTES:string[] = ['chi-inutil', 'chi-responsable']

// Definimos los umbrales para desbloquear cada atributo secreto
export const UNLOCK_THRESHOLDS: Record<string, number> = {
  "chi-inutil": 5,
  "chi-responsable": 5,
};

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
  maxVotes?: number;
  requirement?: string[];
  // Nueva propiedad para sumar puntos a la condición de un atributo bloqueado:
  lockedAttributeIncrement?: {
    attribute: string; // Debe ser uno de los LOCKED_ATTRIBUTES ('chi-inutil' o 'chi-responsable')
    increment: number;
  };
  nextSceneId: {
    success: string;
    failure: string;
    partial?: string;
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

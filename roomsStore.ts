import db from "./db.json"; // Se asume que db.json tiene la estructura completa

// Interfaz para las subhabilidades
export interface Subskill {
  id: string;
  name: string;
  unlockable: boolean;
  unlock_threshold?: number;
}

// Interfaz para las habilidades principales
export interface Skill {
  id: string;
  name: string;
  subskills: Subskill[];
}

// Interfaz para los atributos (los "atributos ocultos")
export interface Attribute {
  id: string;
  name: string;
  unlockable: boolean;
  unlock_threshold?: number;
}

// Configuración del juego
export interface GameConfig {
  maxStartingPoints: number;
  initialLife: number;      // Puntos de vida iniciales para cada jugador
  stressThreshold: number;  // Umbral de estrés (máximo antes de que ocurran efectos negativos)
  skills: Skill[];
  attributes: Attribute[];
}

// Interfaz para cada opción de la escena
export interface SceneOption {
  id: number;
  text: string;
  nextSceneId: {
    success: string;
    failure?: string;
    partial?: string;
  };
  roll?: {
    skillUsed: string; // ID de la subskill (p. ej., "101")
    difficulty: number;
  };
  expOnSuccess?: number;
  // Incremento de atributo al elegir la opción
  lockedAttributeIncrement?: {
    attribute: string;
    increment: number;
  };
  // Requerimientos para mostrar o habilitar la opción
  requirements?: {
    attribute: string;
    actionIfNotMet: "hide" | "disable";
  };
  // Nuevos efectos diferenciados para éxito y fallo:
  successEffects?: {
    life?: number;    // Efecto en vida en caso de éxito (positivo para curar)
    stress?: number;  // Efecto en estrés en caso de éxito (negativo para aliviar)
  };
  failureEffects?: {
    life?: number;    // Efecto en vida en caso de fallo (negativo para dañar)
    stress?: number;  // Efecto en estrés en caso de fallo (positivo para aumentar)
  };
}

// Escena
export interface Scene {
  id: string;
  text: string;
  options: SceneOption[];
  isEnding?: boolean;
  maxVote?: number;
}

// Interfaz Player
export interface Player {
  name: string;
  type: "Normal" | "Líder";
  assignedPoints: { [subskillId: string]: number };
  xp: number;
  skillPoints: number;
  // Atributos ocultos que se irán incrementando (por ejemplo, "corrupto")
  lockedAttributes: { [attribute: string]: number };
  // NUEVAS PROPIEDADES:
  life: number;    // Puntos de vida actuales
  stress: number;  // Nivel de estrés actual
}

// Estado de la Sala
export interface RoomState {
  scene: Scene;
  votes: Record<number, number>;
  userVoted: Set<string>;
  players: Record<string, Player>;
  optionVotes: Record<number, Set<string>>;
  lockedConditions?: Record<string, number>;
}

// Cargamos la configuración y las escenas desde db.json
const dbData = db as {
  gameConfig: GameConfig;
  scenes: Scene[];
};

export const gameConfig = dbData.gameConfig;
export const SCENES = dbData.scenes;

// Almacén global de salas
const rooms: Record<string, RoomState> = {};
export default rooms;

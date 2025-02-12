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

// Interfaz para los atributos
export interface Attribute {
  id: string;
  name: string;
  unlockable: boolean;
  unlock_threshold?: number;
}

// Interfaz para cada ítem de configuración del juego
export interface ConfigItem {
  id: string;
  value: number;
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
    skillUsed: string;
    difficulty: number;
  };
  expOnSuccess?: number;
  lockedAttributeIncrement?: {
    attribute: string;
    increment: number;
  };
  requirements?: {
    attribute: string;
    actionIfNotMet: string; 
  };
  successEffects?: {
    life?: number;
    stress?: number;
  };
  failureEffects?: {
    life?: number;
    stress?: number;
  };
  maxVote?: number;
}

// Interfaz para la escena
export interface Scene {
  id: string;
  text: string;
  options: SceneOption[];
  isEnding?: boolean;
  maxVote?: number;
  audio?: string;
}

// Interfaz Player
export interface Player {
  name: string;
  type: "Normal" | "Líder";
  assignedPoints: { [subskillId: string]: number };
  xp: number;
  skillPoints: number;
  lockedAttributes: { [attribute: string]: number };
  life: number;
  stress: number;
}

// Estado de la Sala
export interface RoomState {
  scene: Scene;
  votes: Record<number, number>;
  userVoted: Set<string>;
  players: Record<string, Player>;
  optionVotes: Record<number, Set<string>>;
  lockedConditions?: Record<string, number>;
  lockedAttributeIncrementApplied?: boolean;
}

// Interfaz que representa la estructura completa del JSON de la DB
export interface DBData {
  gameConfig: ConfigItem[];
  skills: Skill[];
  attributes: Attribute[];
  scenes: Scene[];
}

// Cargamos la configuración, las skills, los atributos y las escenas desde db.json
const dbData = db as unknown as DBData;

export const gameConfig = dbData.gameConfig;
export const SKILLS = dbData.skills;
export const ATTRIBUTES = dbData.attributes;
export const SCENES = dbData.scenes;

console.log(SKILLS)

/*
  Nota:
  - Al haber cambiado gameConfig de objeto a array de ConfigItem, para acceder
    a un valor concreto (por ejemplo, "initialLife") deberás buscarlo en el array.
  Ejemplo:
  
  function getConfigValue(id: string): number {
    const item = gameConfig.find((conf) => conf.id === id);
    if (!item) {
      throw new Error(`No se encontró la configuración para: ${id}`);
    }
    return item.value;
  }
*/

// Almacén global de salas
const rooms: Record<string, RoomState> = {};
export default rooms;

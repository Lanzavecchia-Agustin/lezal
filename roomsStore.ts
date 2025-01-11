// roomsStore.ts

// Atributos disponibles
export const ATRIBUTOS_DISPONIBLES = ["fuerte", "inteligente", "carismatico", "trolo", "autista", "otaku"]

// Interfaz de Jugador
export interface Player {
  name: string;
  type: "Normal" | "Líder";
  attributes: string[];  // Máx. 2
}

// Interfaz SceneOption extendida con requirement, maxVotes, etc.
export interface SceneOption {
  id: number;
  text: string;
  maxVotes?: number;
  requirement?: string;
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
}

// Almacén global de salas
const rooms: Record<string, RoomState> = {};
export default rooms;

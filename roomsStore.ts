export interface Option {
    id: number;
    text: string;
    nextSceneId: string;
  }
  
  export interface Scene {
    id: string;
    text: string;
    options: Option[];
    isEnding?: boolean;
  }
  
  export interface Room {
    users: string[];
    scene: Scene;
    votes: Record<number, number>;
  }
  
  const rooms: Record<string, Room> = {};
  
  export default rooms;
  
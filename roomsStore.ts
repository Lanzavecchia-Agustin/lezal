// roomsStore.ts
export interface Scene {
    id: string;
    text: string;
    options: {
      id: number;
      text: string;
      nextSceneId: string;
    }[];
    isEnding?: boolean;
  }
  
  export interface Room {
    users: string[];
    scene: Scene;
    votes: Record<number, number>;
    userVoted: Set<string>;
    voteTimer?: NodeJS.Timeout;
  }
  
  const rooms: Record<string, Room> = {};
  
  export default rooms;
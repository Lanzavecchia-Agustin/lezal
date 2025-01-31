// types/scene.ts

export interface Scene {
    id: string;
    text: string;
    isEnding: boolean;
    options?: {
      id: number;
      text: string;
      nextSceneId?: {
        success?: string;
        failure?: string;
        partial?: string;
      };
    }[];
  }
  
  export interface Link {
    from: string;
    to: string;
    type: "success" | "failure" | "partial";
  }
  
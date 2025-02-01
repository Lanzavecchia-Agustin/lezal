// SceneCreationTypes.ts
import { ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES } from "../../../roomsStore";

export type AtributosDisponibles = (typeof ATRIBUTOS_DISPONIBLES)[number] | "";
export type LockedAttributes = (typeof LOCKED_ATTRIBUTES)[number] | "";

export interface LockedAttributeIncrement {
  attribute: LockedAttributes | "";
  increment: number;
}

export interface FormSceneOptionData {
  id: number;
  text: string;
  maxVotes: number;
  requirement: AtributosDisponibles[];
  lockedAttributeIncrement: LockedAttributeIncrement;
  nextSceneId: {
    success: string;
    failure: string;
    partial: string;
  };
}

export interface FormSceneBasicData {
  id: string;
  text: string;
  isEnding: boolean;
}

export interface SceneData extends FormSceneBasicData {
  options: FormSceneOptionData[];
}

// Alias para poder importar también como SceneOption
export type SceneOption = FormSceneOptionData;

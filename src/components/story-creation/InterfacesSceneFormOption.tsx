import { ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES } from "../../../roomsStore";
import { Dispatch, SetStateAction } from "react";


export type AtributosDisponibles = (typeof ATRIBUTOS_DISPONIBLES)[number] | ""; // Esto crea un tipo de unión con los valores de ATRIBUTOS_DISPONIBLES
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

export interface HomeProps {
  formSceneBasicData: FormSceneBasicData;
  sceneOptions: any[];
  setSceneOptions: Dispatch<SetStateAction<any[]>>;
  formSceneOptionData: FormSceneOptionData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: keyof FormSceneOptionData,
    nestedField?: keyof LockedAttributeIncrement
  ) => void;
  setUnlocksLockedAttribute: Dispatch<SetStateAction<boolean>>;
  unlocksLockedAttribute: boolean;
  setFormSceneOptionData: Dispatch<SetStateAction<FormSceneOptionData>>;
}
"use client";
import type React from "react";
import type { FormSceneBasicData } from "./SceneCreationTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StepBasicDataProps {
  basicData: FormSceneBasicData;
  setBasicData: React.Dispatch<React.SetStateAction<FormSceneBasicData>>;
}

const StepBasicData: React.FC<StepBasicDataProps> = ({ basicData, setBasicData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setBasicData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setBasicData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="id" className="text-gray-700">
          ID de la Escena
        </Label>
        <Input
          id="id"
          name="id"
          value={basicData.id}
          onChange={handleChange}
          className="mt-1 bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingrese el ID de la escena"
        />
      </div>
      <div>
        <Label htmlFor="text" className="text-gray-700">
          Descripción de la Escena
        </Label>
        <textarea
          id="text"
          name="text"
          value={basicData.text}
          onChange={handleChange}
          className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describa la escena"
          rows={4}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isEnding"
          name="isEnding"
          checked={basicData.isEnding}
          onCheckedChange={(checked) =>
            setBasicData(prev => ({ ...prev, isEnding: checked as boolean }))
          }
          className="border-gray-300"
        />
        <Label htmlFor="isEnding" className="text-gray-700">
          ¿Es esta una escena final?
        </Label>
      </div>
    </div>
  );
};

export default StepBasicData;

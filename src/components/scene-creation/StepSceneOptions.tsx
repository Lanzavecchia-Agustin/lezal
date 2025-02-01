"use client";
import React, { Fragment } from "react";
import type { FormSceneOptionData, SceneOption } from "./SceneCreationTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES } from "../../../roomsStore";

interface StepSceneOptionsProps {
  optionData: FormSceneOptionData;
  setOptionData: React.Dispatch<React.SetStateAction<FormSceneOptionData>>;
  sceneOptions: SceneOption[];
  setSceneOptions: React.Dispatch<React.SetStateAction<SceneOption[]>>;
  isEnding: boolean;
}

const StepSceneOptions: React.FC<StepSceneOptionsProps> = ({
  optionData,
  setOptionData,
  sceneOptions,
  setSceneOptions,
  isEnding,
}) => {
  const handleAddOption = () => {
    // Validar que el texto de la opción no esté vacío
    if (optionData.text.trim() === "") {
      alert("El texto de la opción es requerido.");
      return;
    }
    // Si se ha seleccionado un atributo para desbloquear, el incremento debe ser mayor que cero
    if (
      optionData.lockedAttributeIncrement.attribute !== "" &&
      optionData.lockedAttributeIncrement.increment <= 0
    ) {
      alert("Debe ingresar un incremento válido para el atributo desbloqueado.");
      return;
    }
   
    // Crear la opción; se incluyen solo los campos con valor
    const newOption: FormSceneOptionData = {
        id: optionData.id,
        text: optionData.text,
        requirement: optionData.requirement,
        nextSceneId: optionData.nextSceneId,
        maxVotes: optionData.maxVotes > 0 ? optionData.maxVotes : 0,
        lockedAttributeIncrement:
          optionData.lockedAttributeIncrement.attribute !== ""
            ? optionData.lockedAttributeIncrement
            : { attribute: "", increment: 0},
      };
    setSceneOptions([...sceneOptions, newOption]);
    // Reiniciar el formulario de opción para la siguiente entrada
    setOptionData({
      id: optionData.id + 1,
      text: "",
      maxVotes: 0,
      requirement: [],
      lockedAttributeIncrement: { attribute: "", increment: 0},
      nextSceneId: { success: "", failure: "", partial: "" },
    });
  };

  if (isEnding) {
    return <p className="text-gray-700 text-center">Esta es una escena final. No se requieren opciones.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="optionText" className="text-gray-700">
          Texto de la Opción
        </Label>
        <Input
          id="optionText"
          name="text"
          value={optionData.text}
          onChange={(e) => setOptionData({ ...optionData, text: e.target.value })}
          className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
          placeholder="Ingrese el texto de la opción"
        />
      </div>
      <div>
        <Label htmlFor="maxVotes" className="text-gray-700">
          Máximo de Votos
        </Label>
        <Input
          id="maxVotes"
          name="maxVotes"
          type="number"
          value={optionData.maxVotes}
          onChange={(e) =>
            setOptionData({ ...optionData, maxVotes: Number.parseInt(e.target.value) })
          }
          className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
          placeholder="Ingrese el máximo de votos"
        />
      </div>
      {/* Requerimientos: ahora se muestran como checkboxes para permitir múltiples selecciones */}
      <div>
        <Label className="text-gray-700 font-semibold">Requerimientos</Label>
        <div className="mt-1 space-y-1">
          {ATRIBUTOS_DISPONIBLES.map((attr) => (
            <div key={attr} className="flex items-center">
              <Checkbox
                checked={optionData.requirement.includes(attr)}
                onCheckedChange={(checked) => {
                  const isChecked = checked as boolean;
                  if (isChecked) {
                    setOptionData(prev => ({
                      ...prev,
                      requirement: [...prev.requirement, attr],
                    }));
                  } else {
                    setOptionData(prev => ({
                      ...prev,
                      requirement: prev.requirement.filter(r => r !== attr),
                    }));
                  }
                }}
                className="mr-2"
              />
              <span className="text-gray-900">{attr}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="lockedAttribute" className="text-gray-700">
          Atributo Bloqueado
        </Label>
        <Select
          value={optionData.lockedAttributeIncrement.attribute}
          onValueChange={(value) =>
            setOptionData({
              ...optionData,
              lockedAttributeIncrement: { ...optionData.lockedAttributeIncrement, attribute: value },
            })
          }
        >
          <SelectTrigger className="w-full mt-1 bg-gray-50 border-gray-300 text-gray-900">
            <SelectValue placeholder="Seleccione un atributo bloqueado" />
          </SelectTrigger>
          <SelectContent>
            {LOCKED_ATTRIBUTES.map((attr) => (
              <SelectItem key={attr} value={attr} className="bg-primary border">
                {attr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Mostrar campos adicionales para desbloquear atributo solo si se ha seleccionado uno */}
      {optionData.lockedAttributeIncrement.attribute !== "" && (
        <Fragment>
          <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
              <Label htmlFor="increment" className="text-gray-700 font-semibold">
                Incremento
              </Label>
              <Input
                id="increment"
                type="number"
                min="1"
                value={optionData.lockedAttributeIncrement.increment}
                onChange={(e) =>
                  setOptionData(prev => ({
                    ...prev,
                    lockedAttributeIncrement: {
                      ...prev.lockedAttributeIncrement,
                      increment: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
              />
            </div>
           
          </div>
        </Fragment>
      )}
      {/* Campos para los IDs de las siguientes escenas */}
      {(["success", "failure", "partial"] as const).map((key) => (
        <div key={key} className="flex gap-3">
          <Label className="text-gray-700 font-semibold w-24">{key.toUpperCase()}</Label>
          <Input
            value={optionData.nextSceneId[key]}
            onChange={(e) =>
              setOptionData(prev => ({
                ...prev,
                nextSceneId: { ...prev.nextSceneId, [key]: e.target.value },
              }))
            }
            className="flex-grow bg-gray-50 border-gray-300 text-gray-900"
            placeholder={`ID para ${key}`}
          />
        </div>
      ))}
      <Button onClick={handleAddOption} className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">
        Agregar Opción
      </Button>
      <div className="mt-4">
        <h3 className="text-gray-700 font-semibold mb-2">Opciones Agregadas:</h3>
        {sceneOptions.length === 0 ? (
          <p className="text-gray-600">No hay opciones agregadas.</p>
        ) : (
          sceneOptions.map((option, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded-md mb-2 text-gray-800">
              {option.id}. {option.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepSceneOptions;

"use client";
import React, { Fragment, useState } from "react";
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
  // Estado para saber si estamos editando una opción (guardamos el id de la opción)
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);

  const resetOptionForm = (keepId: number) => {
    setOptionData({
      id: keepId,
      text: "",
      maxVotes: 0,
      requirement: [],
      lockedAttributeIncrement: { attribute: "", increment: 0 },
      nextSceneId: { success: "", failure: "", partial: "" },
    });
  };

  const handleAddOrUpdateOption = () => {
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

    // Crear la opción (se toman todos los campos con valor)
    const newOption: FormSceneOptionData = {
      id: optionData.id,
      text: optionData.text,
      requirement: optionData.requirement,
      nextSceneId: optionData.nextSceneId,
      maxVotes: optionData.maxVotes > 0 ? optionData.maxVotes : 0,
      lockedAttributeIncrement:
        optionData.lockedAttributeIncrement.attribute !== ""
          ? optionData.lockedAttributeIncrement
          : { attribute: "", increment: 0 },
    };

    if (editingOptionId !== null) {
      // Modo edición: actualizar la opción existente
      const updatedOptions = sceneOptions.map((opt) =>
        opt.id === editingOptionId ? newOption : opt
      );
      setSceneOptions(updatedOptions);
      setEditingOptionId(null);
    } else {
      // Modo agregar: sumar la nueva opción
      setSceneOptions([...sceneOptions, newOption]);
    }
    // Reiniciar el formulario para la siguiente entrada (incrementamos el id en modo agregar)
    if (editingOptionId === null) {
      resetOptionForm(optionData.id + 1);
    } else {
      resetOptionForm(optionData.id);
    }
  };

  const handleEditOption = (option: FormSceneOptionData) => {
    // Asegurarse de que lockedAttributeIncrement y requirement estén definidos
    const optionToEdit = {
      ...option,
      lockedAttributeIncrement: option.lockedAttributeIncrement || { attribute: "", increment: 0 },
      requirement: option.requirement ?? [],
    };
    setOptionData(optionToEdit);
    setEditingOptionId(option.id);
  };

  const cancelEditOption = () => {
    setEditingOptionId(null);
    // Reiniciar el formulario; se puede calcular el siguiente id a partir de la lista
    const nextId =
      sceneOptions.length > 0 ? Math.max(...sceneOptions.map((o) => o.id)) + 1 : optionData.id;
    resetOptionForm(nextId);
  };

  // Función para eliminar una opción
  const handleDeleteOption = (id: number) => {
    if (confirm("¿Está seguro de eliminar esta opción?")) {
      // Si se está editando la opción que se desea eliminar, cancelar la edición
      if (editingOptionId === id) {
        cancelEditOption();
      }
      setSceneOptions((prevOptions) => prevOptions.filter((opt) => opt.id !== id));
    }
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
      {/* Requerimientos: se muestran como checkboxes para permitir múltiples selecciones */}
      <div>
        <Label className="text-gray-700 font-semibold">Requerimientos</Label>
        <div className="mt-1 space-y-1">
          {ATRIBUTOS_DISPONIBLES.map((attr) => (
            <div key={attr} className="flex items-center">
              <Checkbox
                checked={(optionData.requirement || []).includes(attr)}
                onCheckedChange={(checked) => {
                  const isChecked = checked as boolean;
                  if (isChecked) {
                    setOptionData((prev) => ({
                      ...prev,
                      requirement: [...(prev.requirement || []), attr],
                    }));
                  } else {
                    setOptionData((prev) => ({
                      ...prev,
                      requirement: (prev.requirement || []).filter((r) => r !== attr),
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
                  setOptionData((prev) => ({
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
              setOptionData((prev) => ({
                ...prev,
                nextSceneId: { ...prev.nextSceneId, [key]: e.target.value },
              }))
            }
            className="flex-grow bg-gray-50 border-gray-300 text-gray-900"
            placeholder={`ID para ${key}`}
          />
        </div>
      ))}
      <div className="flex gap-4">
        <Button onClick={handleAddOrUpdateOption} className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">
          {editingOptionId !== null ? "Guardar Edición" : "Agregar Opción"}
        </Button>
        {editingOptionId !== null && (
          <Button
            variant="outline"
            onClick={cancelEditOption}
            className="w-full mt-4"
          >
            Cancelar Edición
          </Button>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-gray-700 font-semibold mb-2">Opciones Agregadas:</h3>
        {sceneOptions.length === 0 ? (
          <p className="text-gray-600">No hay opciones agregadas.</p>
        ) : (
          sceneOptions.map((option) => (
            <div
              key={option.id}
              className="bg-gray-100 p-2 rounded-md mb-2 flex flex-col gap-2 shadow-sm"
            >
              {/* Se muestra la información completa de la opción */}
              <div>
                <p className="font-semibold text-gray-900">Opción {option.id}: {option.text}</p> 
              </div>
              <div className="text-xs text-gray-600">
                <p>
                  <strong>Requerimientos:</strong>{" "}
                  {(option.requirement || []).join(", ") || "Ninguno"}
                </p>
                <p>
                  <strong>Máximo de Votos:</strong> {option.maxVotes || 0}
                </p>
                {option.lockedAttributeIncrement &&
                  option.lockedAttributeIncrement.attribute && (
                    <p>
                      <strong>Desbloquea:</strong> {option.lockedAttributeIncrement.attribute} (+
                      {option.lockedAttributeIncrement.increment})
                    </p>
                  )}
                <p>
                  <strong>Próxima Escena:</strong> Success: {option.nextSceneId.success || "-"} / Failure:{" "}
                  {option.nextSceneId.failure || "-"} / Partial: {option.nextSceneId.partial || "-"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditOption(option)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteOption(option.id)}
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepSceneOptions;

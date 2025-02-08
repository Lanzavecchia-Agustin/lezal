'use client';

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Definiciones de interfaces

interface Skill {
  id: string;
  name: string;
  subskills: {
    id: string;
    name: string;
    unlockable: boolean;
    unlock_threshold?: number;
  }[];
}

interface Attribute {
  id: string;
  name: string;
  unlock_threshold: number;
}

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
    actionIfNotMet: "hide" | "disable";
  };
  successEffects?: {
    life?: number;
    stress?: number;
  };
  failureEffects?: {
    life?: number;
    stress?: number;
  };
}

export interface Scene {
  id: string;
  text: string;
  options: SceneOption[];
  isEnding?: boolean;
  maxVote?: number;
}

const initialOptionState: SceneOption = {
  id: 0,
  text: "",
  nextSceneId: { success: "" },
  roll: { skillUsed: "", difficulty: 0 },
  expOnSuccess: 0,
  lockedAttributeIncrement: { attribute: "", increment: 0 },
  requirements: { attribute: "", actionIfNotMet: "hide" },
  successEffects: { life: 0, stress: 0 },
  failureEffects: { life: 0, stress: 0 },
};

export default function CreateScenePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Si se recibe un parámetro "scene" en la query, asumimos modo edición.
  const queryScene = searchParams.get("scene");
  const isEditing = Boolean(queryScene);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [scene, setScene] = useState<Scene>({
    id: "",
    text: "",
    options: [],
    isEnding: false,
    maxVote: undefined,
  });
  const [currentOption, setCurrentOption] = useState<SceneOption>(initialOptionState);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [showNextSceneFailure, setShowNextSceneFailure] = useState(false);
  const [showNextScenePartial, setShowNextScenePartial] = useState(false);
  const [showSkillCheck, setShowSkillCheck] = useState(false);
  const [showExpOnSuccess, setShowExpOnSuccess] = useState(false);
  const [showLockedAttributeIncrement, setShowLockedAttributeIncrement] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const toggleField = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  // Obtener skills y attributes desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsResponse, attributesResponse] = await Promise.all([
          fetch("http://localhost:3001/skills"),
          fetch("http://localhost:3001/attributes"),
        ]);
        const skillsData = await skillsResponse.json();
        const attributesData = await attributesResponse.json();
        setSkills(skillsData);
        setAttributes(attributesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Si se pasa la escena por query, pre-cargarla para editar
  useEffect(() => {
    if (queryScene) {
      try {
        const parsedScene: Scene = JSON.parse(queryScene);
        setScene(parsedScene);
      } catch (error) {
        console.error("Error parsing scene from query:", error);
      }
    }
  }, [queryScene]);

  const handleSceneChange = (field: keyof Scene, value: any) => {
    setScene((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (field: keyof SceneOption, value: any) => {
    setCurrentOption((prev) => {
      if (
        field === "nextSceneId" ||
        field === "roll" ||
        field === "lockedAttributeIncrement" ||
        field === "requirements" ||
        field === "successEffects" ||
        field === "failureEffects"
      ) {
        const currentValue = prev[field];
        if (currentValue && typeof currentValue === "object") {
          return { ...prev, [field]: { ...currentValue, ...value } };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const addOrUpdateOption = () => {
    setScene((prev) => {
      const newOptions = [...prev.options];
      if (editingOptionIndex !== null) {
        newOptions[editingOptionIndex] = currentOption;
      } else {
        newOptions.push({ ...currentOption, id: prev.options.length });
      }
      return { ...prev, options: newOptions };
    });
    setCurrentOption(initialOptionState);
    setEditingOptionIndex(null);
  };

  const cancelOptionEdit = () => {
    setCurrentOption(initialOptionState);
    setEditingOptionIndex(null);
  };

  const editOption = (index: number) => {
    setCurrentOption(scene.options[index]);
    setEditingOptionIndex(index);
  };

  const removeOption = (index: number) => {
    setScene((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Scene data:", scene);
    try {
      // Si estamos en modo edición, usamos PATCH; en caso contrario, POST.
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing
        ? `http://localhost:3001/scenes/${scene.id}`
        : "http://localhost:3001/scenes";
      console.log("Submitting scene with method:", method, "to URL:", url);
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scene),
      });
      if (!response.ok) throw new Error("Error al actualizar la escena");
      alert(
        isEditing
          ? "Escena actualizada exitosamente!"
          : "Escena creada exitosamente!"
      );
      // Redirigir a la vista de escenas (ajusta la ruta según corresponda)
      router.push("/scenes-view");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la escena");
    }
  };

  const getSubskillLabel = (id: string) => {
    for (const skill of skills) {
      const subskill = skill.subskills.find((s) => s.id === id);
      if (subskill) {
        return subskill.name;
      }
    }
    return "Seleccione una habilidad";
  };

  return (
    // Se envuelve todo el contenido en un Suspense para asegurar que useSearchParams se use en el cliente
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4 bg-blue-900">
        <h1 className="text-2xl font-bold mb-4">
          {isEditing ? "Editar Escena" : "Crear Nueva Escena"}
        </h1>
        <form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="sceneId">ID de la Escena</Label>
                  <Input
                    id="sceneId"
                    value={scene.id}
                    onChange={(e) => handleSceneChange("id", e.target.value)}
                    placeholder="Ingrese el ID de la escena"
                    disabled={isEditing} // No permitir cambiar el ID en edición
                  />
                </div>
                <div>
                  <Label htmlFor="sceneText">Texto de la Escena</Label>
                  <Textarea
                    id="sceneText"
                    value={scene.text}
                    onChange={(e) => handleSceneChange("text", e.target.value)}
                    placeholder="Describa la escena"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEnding"
                    checked={scene.isEnding}
                    onCheckedChange={(checked) =>
                      handleSceneChange("isEnding", checked)
                    }
                  />
                  <Label htmlFor="isEnding">¿Es escena final?</Label>
                </div>
                <div>
                  <Label htmlFor="maxVote">Votos Máximos</Label>
                  <Input
                    id="maxVote"
                    type="number"
                    value={scene.maxVote || ""}
                    onChange={(e) =>
                      handleSceneChange(
                        "maxVote",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Número máximo de votos"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario para las opciones */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Opciones de la Escena</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {editingOptionIndex !== null ? "Editar Opción" : "Crear Nueva Opción"}
                </h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="optionText">Texto de la Opción</Label>
                    <Input
                      id="optionText"
                      value={currentOption.text}
                      onChange={(e) =>
                        handleOptionChange("text", e.target.value)
                      }
                      placeholder="Describa la opción"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextSceneSuccess">Siguiente Escena (Éxito)</Label>
                    <Input
                      id="nextSceneSuccess"
                      value={currentOption.nextSceneId.success}
                      onChange={(e) =>
                        handleOptionChange("nextSceneId", {
                          success: e.target.value,
                        })
                      }
                      placeholder="ID de la siguiente escena en caso de éxito"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => toggleField(setShowNextSceneFailure)}
                  >
                    {showNextSceneFailure ? "Ocultar" : "Mostrar"} Escena de Fracaso
                  </Button>
                  {showNextSceneFailure && (
                    <div>
                      <Label htmlFor="nextSceneFailure">
                        Siguiente Escena (Fracaso)
                      </Label>
                      <Input
                        id="nextSceneFailure"
                        value={currentOption.nextSceneId.failure || ""}
                        onChange={(e) =>
                          handleOptionChange("nextSceneId", {
                            failure: e.target.value,
                          })
                        }
                        placeholder="ID de la siguiente escena en caso de fracaso"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => toggleField(setShowNextScenePartial)}
                  >
                    {showNextScenePartial ? "Ocultar" : "Mostrar"} Escena Parcial
                  </Button>
                  {showNextScenePartial && (
                    <div>
                      <Label htmlFor="nextScenePartial">
                        Siguiente Escena (Parcial)
                      </Label>
                      <Input
                        id="nextScenePartial"
                        value={currentOption.nextSceneId.partial || ""}
                        onChange={(e) =>
                          handleOptionChange("nextSceneId", {
                            partial: e.target.value,
                          })
                        }
                        placeholder="ID de la siguiente escena en caso de éxito parcial"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => toggleField(setShowSkillCheck)}
                  >
                    {showSkillCheck ? "Ocultar" : "Mostrar"} Chequeo de Habilidad
                  </Button>
                  {showSkillCheck && (
                    <>
                      <div>
                        <Label htmlFor="skillUsed">Habilidad Utilizada</Label>
                        <Select
                          onValueChange={(value) =>
                            handleOptionChange("roll", { skillUsed: value })
                          }
                          value={currentOption.roll?.skillUsed}
                        >
                          <SelectTrigger id="skillUsed">
                            <SelectValue>
                              {currentOption.roll?.skillUsed
                                ? getSubskillLabel(currentOption.roll.skillUsed)
                                : "Seleccione una habilidad"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-blue-950">
                            {skills.flatMap((skill) =>
                              skill.subskills.map((subskill) => (
                                <SelectItem
                                  key={`${skill.id}-${subskill.id}`}
                                  value={subskill.id}
                                >
                                  {skill.name} - {subskill.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Dificultad</Label>
                        <Input
                          id="difficulty"
                          type="number"
                          value={currentOption.roll?.difficulty || ""}
                          onChange={(e) =>
                            handleOptionChange("roll", {
                              difficulty: Number(e.target.value),
                            })
                          }
                          placeholder="Nivel de dificultad"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="button"
                    onClick={() => toggleField(setShowExpOnSuccess)}
                  >
                    {showExpOnSuccess ? "Ocultar" : "Mostrar"} EXP en Éxito
                  </Button>
                  {showExpOnSuccess && (
                    <div>
                      <Label htmlFor="expOnSuccess">EXP en Éxito</Label>
                      <Input
                        id="expOnSuccess"
                        type="number"
                        value={currentOption.expOnSuccess || ""}
                        onChange={(e) =>
                          handleOptionChange("expOnSuccess", Number(e.target.value))
                        }
                        placeholder="EXP ganada en caso de éxito"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() =>
                      toggleField(setShowLockedAttributeIncrement)
                    }
                  >
                    {showLockedAttributeIncrement ? "Ocultar" : "Mostrar"} Incremento
                    de Atributo Bloqueado
                  </Button>
                  {showLockedAttributeIncrement && (
                    <div>
                      <Label>Incremento de Atributo Bloqueado</Label>
                      <Select
                        onValueChange={(value) =>
                          handleOptionChange("lockedAttributeIncrement", {
                            attribute: value,
                          })
                        }
                        value={currentOption.lockedAttributeIncrement?.attribute}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un atributo" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950">
                          {attributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.name}>
                              {attr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={currentOption.lockedAttributeIncrement?.increment || ""}
                        onChange={(e) =>
                          handleOptionChange("lockedAttributeIncrement", {
                            increment: Number(e.target.value),
                          })
                        }
                        placeholder="Incremento"
                        className="mt-2"
                      />
                    </div>
                  )}

                  <Button type="button" onClick={() => toggleField(setShowRequirements)}>
                    {showRequirements ? "Ocultar" : "Mostrar"} Requisitos
                  </Button>
                  {showRequirements && (
                    <div>
                      <Label>Requisitos</Label>
                      <Select
                        onValueChange={(value) =>
                          handleOptionChange("requirements", { attribute: value })
                        }
                        value={currentOption.requirements?.attribute}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un atributo requerido" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950">
                          {attributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.name}>
                              {attr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) =>
                          handleOptionChange("requirements", {
                            actionIfNotMet: value as "hide" | "disable",
                          })
                        }
                        value={currentOption.requirements?.actionIfNotMet}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Acción si no se cumple" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950">
                          <SelectItem value="hide">Ocultar</SelectItem>
                          <SelectItem value="disable">Deshabilitar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="button" onClick={() => toggleField(setShowEffects)}>
                    {showEffects ? "Ocultar" : "Mostrar"} Efectos
                  </Button>
                  {showEffects && (
                    <>
                      <div>
                        <Label>Efectos de Éxito</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={currentOption.successEffects?.life || ""}
                            onChange={(e) =>
                              handleOptionChange("successEffects", {
                                life: Number(e.target.value),
                              })
                            }
                            placeholder="Vida"
                          />
                          <Input
                            type="number"
                            value={currentOption.successEffects?.stress || ""}
                            onChange={(e) =>
                              handleOptionChange("successEffects", {
                                stress: Number(e.target.value),
                              })
                            }
                            placeholder="Estrés"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Efectos de Fracaso</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={currentOption.failureEffects?.life || ""}
                            onChange={(e) =>
                              handleOptionChange("failureEffects", {
                                life: Number(e.target.value),
                              })
                            }
                            placeholder="Vida"
                          />
                          <Input
                            type="number"
                            value={currentOption.failureEffects?.stress || ""}
                            onChange={(e) =>
                              handleOptionChange("failureEffects", {
                                stress: Number(e.target.value),
                              })
                            }
                            placeholder="Estrés"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" onClick={cancelOptionEdit} variant="outline">
                      Cancelar
                    </Button>
                    <Button type="button" onClick={addOrUpdateOption}>
                      {editingOptionIndex !== null ? "Actualizar" : "Agregar"} Opción
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de opciones creadas */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Opciones Creadas</h3>
                {scene.options.map((option, index) => (
                  <Card key={index} className="mb-2 p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.text}</span>
                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editOption(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full mb-4">
            {isEditing ? "Actualizar Escena" : "Crear Escena"}
          </Button>
        </form>
      </div>
    </Suspense>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Scene } from "../../../roomsStore";

// Definición de la interfaz Skill para poder obtener la info de la habilidad y sus subskills
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

interface SceneCardCustomProps {
  scene: Scene;
  deleteScene: (sceneId: string) => Promise<void>;
}

export function SceneCardCustom({ scene, deleteScene }: SceneCardCustomProps) {
  // Estado para almacenar la lista de skills obtenidas de la API.
  const [skills, setSkills] = useState<Skill[]>([]);

  // Se hace el fetch de skills al montar el componente.
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("http://localhost:3001/skills");
        const data = await res.json();
        setSkills(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
    fetchSkills();
  }, []);

  // Función helper para obtener el nombre de un subskill dado su ID.
  // Se recorre la lista de skills y se busca en cada una el subskill con el id indicado.
  const getSubskillName = (subskillId: string): string => {
    for (const skill of skills) {
      const found = skill.subskills.find((sub) => sub.id === subskillId);
      if (found) {
        return `${skill.name} - ${found.name}`;
      }
    }
    // Si no se encuentra, se retorna el propio ID
    return subskillId;
  };

  const handleDelete = async () => {
    if (
      confirm(
        `¿Está seguro de eliminar la escena ${scene.id}? Esta acción actualizará todas las conexiones.`
      )
    ) {
      await deleteScene(scene.id);
    }
  };

  return (
    <Card className="w-[320px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 text-gray-200 border border-purple-500">
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="truncate">{scene.id}</span>
          {scene.isEnding && (
            <Badge variant="destructive" className="ml-2 text-[10px]">
              END
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-xs">
        <ScrollArea className="pr-2">
          <p className="mb-2 font-semibold text-gray-100">{scene.text}</p>
          {scene.options && scene.options.length > 0 ? (
            <div className="mt-2">
              <strong className="text-purple-400">Opciones:</strong>
              <ul className="list-none space-y-3 mt-1">
                {scene.options.map((opt) => (
                  <li key={opt.id} className="border-b border-gray-700 pb-1">
                    <div className="font-semibold mb-1">
                      #{opt.id}: {opt.text}
                    </div>
                    {/* Mostrar información del roll si existe */}
                    {opt.roll && (
                      <div className="ml-2 text-gray-300">
                        <span className="text-purple-400">Roll:</span>{" "}
                        {getSubskillName(opt.roll.skillUsed)} (Difficulty:{" "}
                        {opt.roll.difficulty})
                      </div>
                    )}
                    {opt.requirements && (
                      <div className="ml-2 text-gray-300">
                        <span className="text-purple-400">Requiere:</span>{" "}
                        {opt.requirements.attribute} (Acción:{" "}
                        {opt.requirements.actionIfNotMet})
                      </div>
                    )}
                    {opt.maxVote !== undefined && (
                      <div className="ml-2 text-gray-300">
                        <span className="text-purple-400">maxVote:</span> {opt.maxVote}
                      </div>
                    )}
                    {opt.lockedAttributeIncrement && (
                      <div className="ml-2 text-gray-300">
                        <span className="text-purple-400">Incrementa:</span>{" "}
                        {opt.lockedAttributeIncrement.attribute} +{" "}
                        {opt.lockedAttributeIncrement.increment}
                      </div>
                    )}
                    {opt.nextSceneId && (
                      <div className="ml-2 text-gray-300">
                        <span className="text-purple-400">Camino a:</span>
                        <ul className="list-inside list-disc pl-4">
                          {opt.nextSceneId.success && (
                            <li className="text-green-400">
                              success →{" "}
                              <span className="text-gray-100">
                                {opt.nextSceneId.success}
                              </span>
                            </li>
                          )}
                          {opt.nextSceneId.failure && (
                            <li className="text-red-400">
                              failure →{" "}
                              <span className="text-gray-100">
                                {opt.nextSceneId.failure}
                              </span>
                            </li>
                          )}
                          {opt.nextSceneId.partial && (
                            <li className="text-orange-400">
                              partial →{" "}
                              <span className="text-gray-100">
                                {opt.nextSceneId.partial}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="italic text-gray-400">
              No hay opciones disponibles en esta escena.
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <div className="p-6 flex justify-between gap-2">
        <Link href={{ pathname: '/scene-creation', query: { scene: JSON.stringify(scene) } }}>
          <Button size="sm" className="w-full">
            Editar
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="w-full bg-red-500"
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

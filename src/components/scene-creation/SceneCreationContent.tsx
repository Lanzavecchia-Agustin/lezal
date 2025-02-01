"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SceneCreationWizard from "@/components/scene-creation/SceneCreationWizard";
import type { SceneData } from "@/components/scene-creation/SceneCreationTypes";

export default function SceneCreationContent() {
  const searchParams = useSearchParams();
  const [sceneToEdit, setSceneToEdit] = useState<SceneData | undefined>(undefined);

  useEffect(() => {
    const sceneParam = searchParams.get("scene");
    if (sceneParam) {
      try {
        const parsedScene = JSON.parse(sceneParam);
        setSceneToEdit(parsedScene);
      } catch (error) {
        console.error("Error parsing scene:", error);
      }
    }
  }, [searchParams]);

  return <SceneCreationWizard sceneToEdit={sceneToEdit} />;
}

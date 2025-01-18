// SceneDisplay.tsx
"use client";

import React from "react";
import DebugInfo from "./DebugInfo";
import SceneOptions from "./SceneOptions";

interface Scene {
  id: string;
  text: string;
  options: { 
    id: number; 
    text: string; 
    nextSceneId: any;
  }[];
  isEnding?: boolean;
}

interface SceneDisplayProps {
  scene: Scene;
  users: string[];
  votes: { [optionId: number]: number };
  hasVoted: boolean;
  handleVote: (optionId: number) => void;
  debugMode: boolean;
  lockedConditions: { [attribute: string]: number };
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({
  scene,
  users,
  votes,
  hasVoted,
  handleVote,
  debugMode,
  lockedConditions,
}) => {
  return (
    <div className="h-screen flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">{scene.text}</h1>
      <div className="text-sm">Usuarios en la sala: {users.join(", ")}</div>
      {debugMode && <DebugInfo sceneId={scene.id} lockedConditions={lockedConditions} />}
      <div className="p-2 rounded-md text-center">
        <p className="text-sm font-bold">Información de la sala:</p>
        {/* Aquí se pueden agregar más datos si se requieren */}
      </div>
      <SceneOptions
        options={scene.options}
        handleVote={handleVote}
        votes={votes}
        hasVoted={hasVoted}
        debugMode={debugMode}
      />
      {scene.isEnding && (
        <div className="bg-yellow-800 p-4 rounded-md text-white">
          <p className="text-xl font-semibold">¡Has llegado a un final!</p>
        </div>
      )}
    </div>
  );
};

export default SceneDisplay;

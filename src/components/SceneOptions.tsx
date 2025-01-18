// SceneOptions.tsx
"use client";

import React from "react";
import OptionButton from "./OptionButton";

interface SceneOptionsProps {
  options: any[];
  handleVote: (optionId: number) => void;
  votes: { [optionId: number]: number };
  hasVoted: boolean;
  debugMode: boolean;
}

const SceneOptions: React.FC<SceneOptionsProps> = ({
  options,
  handleVote,
  votes,
  hasVoted,
  debugMode,
}) => {
  if (!options.length) {
    return <p>No hay opciones disponibles.</p>;
  }
  return (
    <>
      {options.map((option) => (
        <OptionButton
          key={option.id}
          option={option}
          handleVote={handleVote}
          votes={votes}
          hasVoted={hasVoted}
          debugMode={debugMode}
        />
      ))}
    </>
  );
};

export default SceneOptions;

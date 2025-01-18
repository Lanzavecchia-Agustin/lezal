// OptionButton.tsx
"use client";

import React from "react";

interface OptionButtonProps {
  option: any;
  handleVote: (id: number) => void;
  votes: { [optionId: number]: number };
  hasVoted: boolean;
  debugMode: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  handleVote,
  votes,
  hasVoted,
  debugMode,
}) => {
  const debugRequirement = option.requirement ?? "(sin requirement)";
  const debugMaxVotes = option.maxVotes ?? "(sin límite)";
  let debugNextScene = "";
  if (option.nextSceneId?.success) {
    debugNextScene =
      "Success: " +
      option.nextSceneId.success +
      ", Failure: " +
      (option.nextSceneId.failure ?? "N/A") +
      (option.nextSceneId.partial ? `, Partial: ${option.nextSceneId.partial}` : "");
  } else {
    debugNextScene = "-> nextSceneId: " + option.nextSceneId;
  }
  const lockedInfo = option.lockedAttributeIncrement
    ? `Desbloqueo: ${option.lockedAttributeIncrement.attribute} (+${option.lockedAttributeIncrement.increment})`
    : "";
  return (
    <div className="w-full max-w-md mb-4">
      <button
        onClick={() => handleVote(option.id)}
        disabled={hasVoted}
        className={`bg-blue-800 py-2 px-4 rounded-md w-full text-left text-white ${
          hasVoted ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {option.text} <span className="ml-2">({votes?.[option.id] ?? 0} votos)</span>
        {lockedInfo && <span className="ml-2 text-sm italic">{lockedInfo}</span>}
      </button>
      {debugMode && (
        <div className="ml-2 text-xs text-yellow-400">
          <p>
            · Req: <em>{debugRequirement}</em>
          </p>
          <p>· maxVotes: {debugMaxVotes}</p>
          <p>· Destinos: {debugNextScene}</p>
        </div>
      )}
    </div>
  );
};

export default OptionButton;

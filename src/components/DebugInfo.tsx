// DebugInfo.tsx
"use client";

import React from "react";

interface DebugInfoProps {
  sceneId: string;
  lockedConditions: { [attribute: string]: number };
}

const DebugInfo: React.FC<DebugInfoProps> = ({ sceneId, lockedConditions }) => {
  return (
    <div className="text-xs text-gray-400">
      <p>
        <strong>DEBUG - Escena actual:</strong> {sceneId}
      </p>
      <div>
        <strong>Condiciones desbloqueo:</strong>
        {Object.entries(lockedConditions).map(([attr, count]) => (
          <div key={attr}>
            <span className="text-primary">
              {attr}: {count} {count >= 5 ? "(Desbloqueado)" : "(En progreso)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInfo;

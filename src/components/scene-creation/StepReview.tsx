"use client";
import React from "react";
import type { FormSceneBasicData, SceneOption } from "./SceneCreationTypes";

interface StepReviewProps {
  basicData: FormSceneBasicData;
  sceneOptions: SceneOption[];
}

const StepReview: React.FC<StepReviewProps> = ({ basicData, sceneOptions }) => {
  return (
    <div className="space-y-6 text-gray-800">
      <div>
        <h3 className="text-xl font-semibold mb-2">Datos Básicos</h3>
        <div className="p-4 bg-gray-200 rounded-md">
          <p>
            <strong>ID:</strong>{basicData.id}
          </p>
          <p>
            <strong>Descripción:</strong> {basicData.text}
          </p>
          <p>
            <strong>Escena Final:</strong> {basicData.isEnding ? "Sí" : "No"}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Opciones de Escena</h3>
        {sceneOptions.length === 0 ? (
          <p className="text-gray-600">No se han agregado opciones.</p>
        ) : (
          <div className="space-y-4">
            {sceneOptions.map((option) => (
              <div key={option.id} className="p-4 bg-gray-200 rounded-md text-gray-800">
                <p className="font-bold">
                  {option.id}. {option.text}
                </p>
                <p className="text-sm">
                  <strong>Requerimientos:</strong> {option.requirement.join(", ") || "Ninguno"}
                </p>
                <p className="text-sm">
                  <strong>Máximo de Votos:</strong> {option.maxVotes || 0}
                </p>
                {option.lockedAttributeIncrement && (
                  <p className="text-sm">
                    <strong>Desbloquea:</strong> {option.lockedAttributeIncrement.attribute} (+
                    {option.lockedAttributeIncrement.increment})
                  </p>
                )}
                <p className="text-sm">
                  <strong>Próxima Escena:</strong> S: {option.nextSceneId.success} / F: {option.nextSceneId.failure} / P: {option.nextSceneId.partial}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepReview;

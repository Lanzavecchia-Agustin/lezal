"use client";

import React, { useState } from "react";
import { gameConfig, Scene, SceneOption } from "../../roomsStore";

// Interfaz para la información del jugador, ahora con vida y estrés
interface MyPlayerData {
  name: string;
  assignedPoints: { [subskillId: string]: number };
  xp?: number;
  skillPoints?: number;
  lockedAttributes?: { [attribute: string]: number };
  life?: number;
  stress?: number;
}

// Props que recibe SceneDisplay
interface SceneDisplayProps {
  roomId: string | null;
  scene: Scene;
  users: string[];
  votes: { [optionId: number]: number };
  hasVoted: boolean;
  handleVote: (optionId: number) => void;
  debugMode: boolean;
  myPlayer?: MyPlayerData;
}

/**
 * Devuelve el nombre de la subhabilidad a partir de su ID usando gameConfig.skills
 */
function getSubskillName(subskillId: string): string {
  for (const skill of gameConfig.skills) {
    const found = skill.subskills.find((s) => s.id === subskillId);
    if (found) return found.name;
  }
  return subskillId;
}

/**
 * Calcula la probabilidad aproximada de que (2d6 + skillVal) >= difficulty
 */
function computeSuccessProbability(skillVal: number, difficulty: number): number {
  const ways: Record<number, number> = {
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 5,
    9: 4,
    10: 3,
    11: 2,
    12: 1,
  };
  const needed = difficulty - skillVal;
  let totalSuccesses = 0;
  for (let sum = 2; sum <= 12; sum++) {
    if (sum >= needed) {
      totalSuccesses += ways[sum];
    }
  }
  return totalSuccesses / 36;
}

/**
 * Evalúa si una opción es accesible para el jugador, según los requerimientos
 */
function evaluateOptionAccessibility(
  option: SceneOption,
  myPlayer?: MyPlayerData
): { accessible: boolean; hide: boolean } {
  if (!option.requirements) return { accessible: true, hide: false };
  if (!myPlayer || !myPlayer.lockedAttributes) {
    return { accessible: false, hide: option.requirements.actionIfNotMet === "hide" };
  }
  const attr = option.requirements.attribute;
  const value = myPlayer.lockedAttributes[attr] || 0;
  return value > 0
    ? { accessible: true, hide: false }
    : { accessible: false, hide: option.requirements.actionIfNotMet === "hide" };
}

/**
 * Extrae los umbrales de atributos desde gameConfig.attributes usando el nombre en minúsculas
 */
const attributeThresholds = gameConfig.attributes.reduce((acc, attr) => {
  if (attr.unlockable && attr.unlock_threshold) {
    acc[attr.name.toLowerCase()] = attr.unlock_threshold;
  }
  return acc;
}, {} as { [attribute: string]: number });

const SceneDisplay: React.FC<SceneDisplayProps> = ({
  roomId,
  scene,
  users,
  votes,
  hasVoted,
  handleVote,
  debugMode,
  myPlayer,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [localRollResult, setLocalRollResult] = useState<{ [optionId: number]: number }>({});

  const xp = myPlayer?.xp ?? 0;
  const skillPoints = myPlayer?.skillPoints ?? 0;
  const life = myPlayer?.life ?? gameConfig.initialLife;
  const stress = myPlayer?.stress ?? 0;
  const xpPercentage = Math.min(100, (xp / 100) * 100);
  const level = Math.floor(xp / 100);

  function doLocalRoll(optionId: number, skillVal: number, difficulty: number) {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2 + skillVal;
    setLocalRollResult((prev) => ({ ...prev, [optionId]: total }));
  }
  
  console.log(scene)

  async function handleSpendPoint(subskillId: string) {
    if (!myPlayer) return;
    if (myPlayer.skillPoints! <= 0) {
      alert("No tienes Skill Points disponibles");
      return;
    }
    if (!roomId) {
      alert("No se conoce roomId");
      return;
    }
    const res = await fetch(
      `/api/spendSkillPoint?roomId=${roomId}&userName=${myPlayer.name}&subskillId=${subskillId}`,
      { method: "POST" }
    );
    if (res.ok) {
      alert(`Skill Point asignado a ${getSubskillName(subskillId)}`);
      setShowModal(false);
    } else {
      const err = await res.json();
      alert(`Error al asignar Skill Point: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 space-y-6 bg-gradient-to-b text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">{scene.text}</h1>

      {/* Información general de la escena */}
      <div className="bg-blue-800 rounded-lg p-3 text-sm md:text-base w-full max-w-2xl space-y-2">
        <div>
          <span className="font-semibold">Usuarios en la sala:</span> {users.join(", ")}
        </div>
        {scene.maxVote !== undefined && (
          <div>
            <span className="font-semibold">Votos necesarios (maxVote):</span> {scene.maxVote}
          </div>
        )}
      </div>

      {/* Información Debug y Restricciones */}
      {debugMode && (
        <div className="bg-blue-800 p-4 rounded-lg text-white text-sm md:text-base w-full max-w-2xl space-y-2">
          {roomId && (
            <div>
              <h1 className="font-semibold">Room ID:</h1> {roomId}
            </div>
          )}
          <h2 className="text-lg font-bold mb-2">DEBUG INFO</h2>
          <p className="text-white"><strong>Scene ID:</strong> {scene.id}</p>
          <p className="text-white"><strong>Scene maxVote:</strong> {scene.maxVote ?? "N/A"}</p>
          <p className="text-white"><strong>hasVoted:</strong> {hasVoted ? "Sí" : "No"}</p>
          <p className="text-white">
            <strong>Votes:</strong>{" "}
            <pre className="whitespace-pre-wrap">{JSON.stringify(votes, null, 2)}</pre>
          </p>
          <p className="text-white">
            <strong>Users:</strong>{" "}
            <pre className="whitespace-pre-wrap">{JSON.stringify(users, null, 2)}</pre>
          </p>
          {myPlayer?.lockedAttributes && (
            <div>
              <h3 className="font-semibold">Atributos Ocultos:</h3>
              <pre className="whitespace-pre-wrap text-yellow-300">
                {JSON.stringify(myPlayer.lockedAttributes, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Restricciones de Opciones:</h3>
            <ul className="ml-4 text-xs text-gray-200">
              {scene.options.map((opt) => {
                if (opt.requirements) {
                  return (
                    <li key={opt.id}>
                      Opción "{opt.text}" requiere el atributo{" "}
                      <strong>{opt.requirements.attribute}</strong> y se{" "}
                      {opt.requirements.actionIfNotMet === "hide" ? "ocultará" : "deshabilitará"} si no se cumple.
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Información del jugador */}
      {myPlayer && (
        <div className="bg-blue-800 rounded-lg p-4 text-white w-full max-w-2xl flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div>
            <p className="text-white"><strong>XP:</strong> {xp}</p>
            <p className="text-white"><strong>Skill Points:</strong> {skillPoints}</p>
            <p className="text-white"><strong>Vida:</strong> {life}</p>
            <p className="text-white"><strong>Estrés:</strong> {stress}</p>
          </div>
          <div className="space-x-2">
            {skillPoints > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200"
              >
                Asignar Skill Point
              </button>
            )}
            <button
              onClick={() => setShowStatusModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200"
            >
              Ver Status
            </button>
          </div>
        </div>
      )}

      {/* Modal de Skill Points */}
      {showModal && myPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative text-gray-800">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Mejorar Subhabilidad</h2>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm mb-4">Elige una subhabilidad para subir en 1 punto.</p>
              <ul className="space-y-4">
                {gameConfig.skills.map((skill) => (
                  <li key={skill.id}>
                    <h3 className="font-semibold text-lg mb-2">{skill.name}</h3>
                    <ul className="ml-4 space-y-2">
                      {skill.subskills
                        .filter((sub) => !sub.unlockable)
                        .map((sub) => (
                          <li key={sub.id} className="flex items-center justify-between">
                            <span>
                              {sub.name} (Actual: {myPlayer.assignedPoints[sub.id] || 0})
                            </span>
                            <button
                              onClick={() => handleSpendPoint(sub.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition duration-200"
                            >
                              Mejorar
                            </button>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estado del Jugador */}
      {showStatusModal && myPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative text-gray-800">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Estado del Jugador</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4"><strong>Nombre:</strong> {myPlayer.name}</p>
              <div className="mb-4">
                <p className="mb-2"><strong>Nivel:</strong> {level}</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${xpPercentage}%` }} />
                </div>
                <p className="text-sm mt-1">XP actual: {xp} / 100</p>
              </div>
              <div className="mb-4">
                <p className="mb-2"><strong>Vida:</strong> {myPlayer.life ?? gameConfig.initialLife}</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-red-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: "100%" }} />
                </div>
                <p className="text-sm mt-1">Puntos de vida</p>
              </div>
              <div className="mb-4">
                <p className="mb-2"><strong>Estrés:</strong> {myPlayer.stress ?? 0}</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-yellow-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: "100%" }} />
                </div>
                <p className="text-sm mt-1">Nivel de estrés</p>
              </div>
              {myPlayer.lockedAttributes && (
                <div className="mb-4">
                  <h3 className="font-semibold">Progreso de Atributos Ocultos:</h3>
                  <ul className="ml-4 space-y-2">
                    {Object.entries(myPlayer.lockedAttributes).map(([attr, value]) => {
                      const configAttr = gameConfig.attributes.find(
                        (a) => a.name.toLowerCase() === attr.toLowerCase()
                      );
                      const threshold = configAttr && configAttr.unlock_threshold ? configAttr.unlock_threshold : 0;
                      const percentage = threshold > 0 ? Math.min(100, (value / threshold) * 100) : 0;
                      return (
                        <li key={attr}>
                          <p className="text-sm">
                            <strong>{attr}:</strong> {value}
                            {threshold > 0 && ` / ${threshold}`}{" "}
                            {threshold > 0 && value < threshold
                              ? `(Te faltan ${threshold - value} puntos)`
                              : threshold > 0
                              ? "(Desbloqueado)"
                              : ""}
                          </p>
                          {threshold > 0 && (
                            <div className="w-full bg-gray-300 rounded-full h-3">
                              <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                {gameConfig.skills.map((skill) => (
                  <div key={skill.id}>
                    <h3 className="font-semibold text-lg mb-2">{skill.name}</h3>
                    <ul className="ml-4 space-y-1">
                      {skill.subskills.map((sub) => {
                        const assigned = myPlayer.assignedPoints[sub.id] || 0;
                        return (
                          <li key={sub.id} className="flex justify-between">
                            <span>{sub.name}:</span>
                            <span className="font-semibold">{assigned}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-4">
        {scene.options.map((opt) => {
          const { accessible, hide } = evaluateOptionAccessibility(opt, myPlayer);
          if (hide) {
            if (debugMode) {
              return (
                <div key={opt.id} className="border border-red-500 p-2 rounded-lg bg-red-500 text-white">
                  [OCULTA] {opt.text}
                </div>
              );
            }
            return null;
          }
          let probability = 0;
          let skillVal = 0;
          if (opt.roll && myPlayer) {
            const subId = opt.roll.skillUsed;
            skillVal = myPlayer.assignedPoints[subId] || 0;
            probability = computeSuccessProbability(skillVal, opt.roll.difficulty);
          }

          return (
            <div key={opt.id} className="border border-blue-300 p-4 rounded-lg bg-blue-600 shadow-lg">
              <p className="font-semibold">{opt.text}</p>
              <div className="text-sm text-gray-700 ml-4">
                <p>Success = {opt.nextSceneId.success || "???"}</p>
                <p>Failure = {opt.nextSceneId.failure || "???"}</p>
                {opt.nextSceneId.partial && <p>Partial = {opt.nextSceneId.partial}</p>}
                {opt.roll && (
                  <div className="mt-1">
                    <p>
                      Dificultad: <strong>{opt.roll.difficulty}</strong>, Skill usada:{" "}
                      <strong>{getSubskillName(opt.roll.skillUsed)}</strong> (valor local: {skillVal})
                    </p>
                    <p>
                      Prob. de éxito (aprox): <strong>{(probability * 100).toFixed(1)}%</strong>
                    </p>
                    <button
                      onClick={() => doLocalRoll(opt.id, skillVal, opt.roll!.difficulty)}
                      className="text-xs underline text-blue-900"
                    >
                      Tirar dados (Local)
                    </button>
                    {localRollResult[opt.id] !== undefined && (
                      <p>
                        Resultado local: <strong>{localRollResult[opt.id]}</strong> vs {opt.roll.difficulty} →{" "}
                        {localRollResult[opt.id]! >= opt.roll.difficulty ? "Éxito" : "Fallo"}
                      </p>
                    )}
                  </div>
                )}
                {opt.successEffects && (
                  <div className="mt-1 text-xs text-green-300">
                    <p>En Éxito:</p>
                    {opt.successEffects.life !== undefined && (
                      <p>Efecto en Vida: {opt.successEffects.life >= 0 ? "+" : ""}{opt.successEffects.life}</p>
                    )}
                    {opt.successEffects.stress !== undefined && (
                      <p>Efecto en Estrés: {opt.successEffects.stress >= 0 ? "+" : ""}{opt.successEffects.stress}</p>
                    )}
                  </div>
                )}
                {opt.failureEffects && (
                  <div className="mt-1 text-xs text-red-300">
                    <p>En Fracaso:</p>
                    {opt.failureEffects.life !== undefined && (
                      <p>Efecto en Vida: {opt.failureEffects.life >= 0 ? "+" : ""}{opt.failureEffects.life}</p>
                    )}
                    {opt.failureEffects.stress !== undefined && (
                      <p>Efecto en Estrés: {opt.failureEffects.stress >= 0 ? "+" : ""}{opt.failureEffects.stress}</p>
                    )}
                  </div>
                )}
                {opt.requirements && (
                  <p className="mt-1 text-xs text-yellow-300">
                    Requiere atributo: <strong>{opt.requirements.attribute}</strong> (Acción: {opt.requirements.actionIfNotMet})
                  </p>
                )}
                {opt.lockedAttributeIncrement && (
                  <p className="mt-1 text-xs text-green-300">
                    Incrementa: <strong>{opt.lockedAttributeIncrement.attribute}</strong> en {opt.lockedAttributeIncrement.increment}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleVote(opt.id)}
                disabled={!accessible || hasVoted}
                className={`mt-3 px-4 py-2 rounded-lg transition duration-200 ${
                  !accessible || hasVoted
                    ? "bg-blue-800 opacity-50 cursor-not-allowed"
                    : "bg-blue-800 hover:bg-blue-900"
                } text-white`}
              >
                Elegir esta opción
              </button>
            </div>
          );
        })}
      </div>

      {scene.isEnding && (
        <div className="bg-yellow-600 p-6 rounded-lg text-white text-center shadow-lg">
          <p className="text-2xl font-bold">¡Has llegado a un final!</p>
        </div>
      )}
    </div>
  );

};

export default SceneDisplay;

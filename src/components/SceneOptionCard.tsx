"use client"
import type { SceneOption } from "../../roomsStore"
import type { MyPlayerData } from "./SceneDisplay"
import { AlertTriangle, ChevronRight, Zap } from "lucide-react"

interface SceneOptionCardProps {
  option: SceneOption
  debugMode: boolean
  myPlayer?: MyPlayerData
  hasVoted: boolean
  evaluateOptionAccessibility: (option: SceneOption, myPlayer?: MyPlayerData) => { accessible: boolean; hide: boolean }
  computeSuccessProbability: (skillVal: number, difficulty: number) => number
  getSubskillName: (subskillKey: string) => string
  localRollResult: { [optionId: number]: number }
  doLocalRoll: (optionId: number, skillVal: number, difficulty: number) => void
  onVote: (optionId: number) => void
}

export function SceneOptionCard({
  option,
  debugMode,
  myPlayer,
  hasVoted,
  evaluateOptionAccessibility,
  computeSuccessProbability,
  getSubskillName,
  localRollResult,
  doLocalRoll,
  onVote,
}: SceneOptionCardProps) {
  const { accessible, hide } = evaluateOptionAccessibility(option, myPlayer)

  if (hide) {
    if (debugMode) {
      return (
        <div className="border border-red-900 p-4 rounded-lg bg-red-950 text-red-200 shadow-lg shadow-red-900/20">
          <AlertTriangle className="inline-block mr-2 h-5 w-5" />
          [OCULTA] {option.text}
        </div>
      )
    }
    return null
  }

  let probability = 0
  let skillVal = 0
  if (option.roll && myPlayer) {
    const subKey = option.roll.skillUsed
    skillVal = myPlayer.assignedPoints?.[subKey] || 0
    probability = computeSuccessProbability(skillVal, option.roll.difficulty)
  }

  return (
    <div className="border border-purple-700 p-4 rounded-lg bg-gray-900 shadow-lg shadow-purple-900/20 text-gray-200">
      <h4 className="font-semibold text-lg mb-2 text-purple-300 whitespace-pre-wrap break-words  flex">{option.text}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex flex-col space-x-4 text-white">
          <p>Éxito: {option.nextSceneId.success || "???"}</p>
          <p>Fallo: {option.nextSceneId.failure || "???"}</p>
          {option.nextSceneId.partial && <p>Parcial: {option.nextSceneId.partial}</p>}
        </div>

        {/* Info de la tirada */}
        {option.roll && (
          <div className="bg-gray-800 p-3 rounded-md">
            <p className="mb-1">
              Dificultad: <strong className="text-yellow-400">{option.roll.difficulty}</strong>, Habilidad:{" "}
              <strong className="text-cyan-400">{getSubskillName(option.roll.skillUsed)}</strong>
              <span className="text-gray-400">(valor: {skillVal})</span>
            </p>
            <p className="mb-2">
              Prob. de éxito: <strong className="text-green-400">{(probability * 100).toFixed(1)}%</strong>
            </p>
            <button
              onClick={() => doLocalRoll(option.id, skillVal, option.roll!.difficulty)}
              className="text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded transition duration-200"
            >
              Tirar dados (Local)
            </button>
            {localRollResult[option.id] !== undefined && (
              <p className="mt-2">
                Resultado: <strong className="text-yellow-400">{localRollResult[option.id]}</strong> vs{" "}
                {option.roll.difficulty}→{" "}
                <span
                  className={localRollResult[option.id]! >= option.roll.difficulty ? "text-green-400" : "text-red-400"}
                >
                  {localRollResult[option.id]! >= option.roll.difficulty ? "Éxito" : "Fallo"}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Efectos de éxito / fracaso */}
        <div className="flex space-x-4">
          {option.successEffects && (
            <div className="flex-1 bg-green-900 p-2 rounded-md text-green-200">
              <p className="font-semibold mb-1">En Éxito:</p>
              {option.successEffects.life !== undefined && (
                <p>
                  Vida: {option.successEffects.life >= 0 ? "+" : ""}
                  {option.successEffects.life}
                </p>
              )}
              {option.successEffects.stress !== undefined && (
                <p>
                  Estrés: {option.successEffects.stress >= 0 ? "+" : ""}
                  {option.successEffects.stress}
                </p>
              )}
            </div>
          )}
          {option.failureEffects && (
            <div className="flex-1 bg-red-900 p-2 rounded-md text-red-200">
              <p className="font-semibold mb-1">En Fracaso:</p>
              {option.failureEffects.life !== undefined && (
                <p>
                  Vida: {option.failureEffects.life >= 0 ? "+" : ""}
                  {option.failureEffects.life}
                </p>
              )}
              {option.failureEffects.stress !== undefined && (
                <p>
                  Estrés: {option.failureEffects.stress >= 0 ? "+" : ""}
                  {option.failureEffects.stress}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Requerimientos */}
        {option.requirements && (
          <div className="bg-yellow-900 p-2 rounded-md text-yellow-200">
            <p className="flex items-center">
              <AlertTriangle className="inline-block mr-2 h-4 w-4" />
              Requiere: <strong className="ml-1">{option.requirements.attribute}</strong>
              <span className="ml-2 text-xs">({option.requirements.actionIfNotMet})</span>
            </p>
          </div>
        )}

        {/* Incrementar atributo oculto */}
        {option.lockedAttributeIncrement && (
          <div className="bg-blue-900 p-2 rounded-md text-blue-200">
            <p className="flex items-center">
              <Zap className="inline-block mr-2 h-4 w-4" />
              Incrementa: <strong className="ml-1">{option.lockedAttributeIncrement.attribute}</strong>
              <span className="ml-2">en {option.lockedAttributeIncrement.increment}</span>
            </p>
          </div>
        )}
      </div>

      {/* Botón para votar la opción */}
      <button
        onClick={() => onVote(option.id)}
        disabled={!accessible || hasVoted}
        className={`mt-4 px-4 py-2 rounded-lg transition duration-200 flex items-center justify-center w-full ${
          !accessible || hasVoted
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-purple-700 hover:bg-purple-600 text-white"
        }`}
      >
        <span>Elegir esta opción</span>
        <ChevronRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  )
}


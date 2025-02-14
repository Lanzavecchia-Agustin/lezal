// file: components/scene/DebugPanel.tsx
"use client"

import React from "react"
import { Scene } from "../../roomsStore"
import { MyPlayerData } from "./SceneDisplay"

interface DebugPanelProps {
  roomId: string | null
  scene: Scene
  votes: { [optionId: number]: number }
  hasVoted: boolean
  users: string[]
  myPlayer?: MyPlayerData
}

export function DebugPanel({
  roomId,
  scene,
  votes,
  hasVoted,
  users,
  myPlayer,
}: DebugPanelProps) {

  return (
    <div className="bg-blue-800 p-4 rounded-lg text-white text-sm md:text-base w-full max-w-2xl space-y-2">
      {roomId && (
        <div>
          <h1 className="font-semibold">Room ID:</h1> {roomId}
        </div>
      )}
      <h2 className="text-lg font-bold mb-2">DEBUG INFO</h2>
      <p>
        <strong>Scene ID:</strong> {scene.id}
      </p>
      <p>
        <strong>Scene maxVote:</strong> {scene.maxVote ?? "N/A"}
      </p>
      <p>
        <strong>hasVoted:</strong> {hasVoted ? "Sí" : "No"}
      </p>
      <p>
        <strong>Votes:</strong>
        <pre className="whitespace-pre-wrap">{JSON.stringify(votes, null, 2)}</pre>
      </p>
      <p>
        <strong>Users:</strong>
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
                  {opt.requirements.actionIfNotMet === "hide" ? "ocultará" : "deshabilitará"} si
                  no se cumple.
                </li>
              )
            }
            return null
          })}
        </ul>
      </div>
    </div>
  )
}

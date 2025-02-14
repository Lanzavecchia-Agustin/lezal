"use client"
import type { SceneOption } from "../../roomsStore"
import type { MyPlayerData } from "./SceneDisplay"
import { SceneOptionCard } from "./SceneOptionCard"

interface SceneOptionsListProps {
  options: SceneOption[]
  debugMode: boolean
  myPlayer?: MyPlayerData
  hasVoted: boolean
  votes: { [optionId: number]: number }
  evaluateOptionAccessibility: (option: SceneOption, myPlayer?: MyPlayerData) => { accessible: boolean; hide: boolean }
  computeSuccessProbability: (skillVal: number, difficulty: number) => number
  getSubskillName: (subskillKey: string) => string
  localRollResult: { [optionId: number]: number }
  doLocalRoll: (optionId: number, skillVal: number, difficulty: number) => void
  onVote: (optionId: number) => void
}

export function SceneOptionsList({
  options,
  debugMode,
  myPlayer,
  hasVoted,
  votes,
  evaluateOptionAccessibility,
  computeSuccessProbability,
  getSubskillName,
  localRollResult,
  doLocalRoll,
  onVote,
}: SceneOptionsListProps) {
  return (
    <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((option) => (
        <SceneOptionCard
          key={option.id}
          option={option}
          debugMode={debugMode}
          myPlayer={myPlayer}
          hasVoted={hasVoted}
          evaluateOptionAccessibility={evaluateOptionAccessibility}
          computeSuccessProbability={computeSuccessProbability}
          getSubskillName={getSubskillName}
          localRollResult={localRollResult}
          doLocalRoll={doLocalRoll}
          onVote={onVote}
        />
      ))}
    </div>
  )
}


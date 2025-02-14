"use client"
import type { MyPlayerData } from "./SceneDisplay"
import { Shield, Zap, Brain, Heart, Activity, ChevronDown } from "lucide-react"
import type React from "react"

interface PlayerInfoBarProps {
  myPlayer: MyPlayerData
  xp: number
  skillPoints: number
  life: number
  stress: number
  onOpenSkillPointModal: () => void
  onOpenStatusModal: () => void
  level: number
  xpPercentage: number
  initialLife: number
  roomId: string
}

export function PlayerInfoBar({
  myPlayer,
  xp,
  skillPoints,
  life,
  stress,
  onOpenSkillPointModal,
  onOpenStatusModal,
  level,
  xpPercentage,
  initialLife,
  roomId,
}: PlayerInfoBarProps) {
  return (
    <div className="m-5  flex flex-col">
    <div className=" text-gray-300 w-full py-4 flex flex-wrap items-center justify-center gap-4">
      <div className="flex items-center space-x-4">
        <p className="text-lg font-semibold text-purple-400">{myPlayer.name}</p>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <p className="text-blue-400 font-medium">Nv.{level}</p>
        </div>
      </div>

      <div className="flex-grow flex flex-wrap items-center gap-4">
        <StatusItem
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          label="XP"
          value={`${xp}/100`}
          percentage={xpPercentage}
          color="yellow"
        />
        <StatusItem
          icon={<Heart className="w-5 h-5 text-red-500" />}
          label="Vida"
          value={`${life}/${initialLife}`}
          percentage={(life / initialLife) * 100}
          color="red"
        />
        <StatusItem
          icon={<Activity className="w-5 h-5 text-green-500" />}
          label="Estrés"
          value={stress.toString()}
          percentage={stress}
          color="green"
        />
      </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <p className="text-cyan-400 font-medium">{skillPoints} Puntos de habilidad</p>
        </div>
        {skillPoints > 0 && (
          <button
            onClick={onOpenSkillPointModal}
            className="bg-purple-700 hover:bg-purple-600 text-purple-200 px-3 py-1 rounded text-sm transition duration-200"
          >
            Asignar SP
          </button>
        )}
        <button
          onClick={onOpenStatusModal}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm transition duration-200 flex items-center space-x-1"
        >
          <span>Habilidades</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <h1 className="text-gray-300 text-lg font-semibold bg-purple-500 p-1 rounded-lg">Sala: {roomId}</h1>
      </div>
    
    </div>

  )
}

interface StatusItemProps {
  icon: React.ReactNode
  label: string
  value: string
  percentage: number
  color: string
}

function StatusItem({ icon, label, value, percentage, color }: StatusItemProps) {
  return (
    <div className="flex items-center space-x-3">
      {icon}
      <div className="flex flex-col w-40">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span>{value}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}


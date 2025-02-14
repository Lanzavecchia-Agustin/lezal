"use client"
import type { MyPlayerData } from "./SceneDisplay"
import { X, Shield, Heart, Activity, Lock, Unlock } from "lucide-react"

interface PlayerStatusModalProps {
  myPlayer: MyPlayerData
  onClose: () => void
  level: number
  xpPercentage: number
  initialLife: number
  ATTRIBUTES: any[]
  SKILLS: any[]
}

export function PlayerStatusModal({
  myPlayer,
  onClose,
  SKILLS,
}: PlayerStatusModalProps) {


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative text-gray-300 shadow-lg shadow-purple-900/20">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-purple-400">Habilidades</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Habilidades */}
          <div>
            <div className="space-y-4">
              {SKILLS.map((skill) => (
                <div key={skill.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-purple-400 mb-2">{skill.name}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {skill.subskills.map((sub: { id: string; name: string }) => {
                      const subKey = `${skill.id}-${sub.id}`
                      const assigned = myPlayer.assignedPoints?.[subKey] || 0
                      return (
                        <div key={subKey} className="flex justify-between items-center">
                          <span className="text-sm">{sub.name}</span>
                          <span className="font-semibold text-cyan-400">{assigned}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


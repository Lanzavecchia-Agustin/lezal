"use client"

import { useState, useMemo } from "react"
import type { MyPlayerData } from "./SceneDisplay"
import { SKILLS } from "../../roomsStore"
import { X, ChevronRight, Plus, Minus } from "lucide-react"

interface SkillPointModalProps {
  myPlayer: MyPlayerData
  onClose: () => void
  onSpendPoint: (subskillKey: string) => void
  availablePoints: number
}

export function SkillPointModal({ myPlayer, onClose, onSpendPoint, availablePoints }: SkillPointModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const skillsWithPoints = useMemo(() => {
    return SKILLS.map((skill) => ({
      ...skill,
      totalPoints: skill.subskills.reduce((acc, sub) => {
        const subKey = `${skill.id}-${sub.id}`
        return acc + (myPlayer.assignedPoints?.[subKey] || 0)
      }, 0),
    }))
  }, [myPlayer.assignedPoints])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden relative text-gray-300 shadow-lg shadow-purple-900/30">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-purple-700 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-400">Mejora de Habilidades</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded-lg">
              <span className="text-sm text-gray-200">Puntos disponibles:</span>
              <span className="text-yellow-400 font-bold">{availablePoints}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* Sidebar con las habilidades principales */}
          <div className="w-full flex flex-col md:w-1/4 bg-gray-800 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-purple-700">
            {skillsWithPoints.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                  selectedSkill === skill.id
                    ? "bg-purple-700 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{skill.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{skill.totalPoints}</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Área principal con las subhabilidades */}
          <div className="w-full md:w-3/4 p-4 overflow-y-auto">
            {selectedSkill ? (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-4">
                  {SKILLS.find((s) => s.id === selectedSkill)?.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SKILLS.find((s) => s.id === selectedSkill)
                    ?.subskills.filter((sub) => !sub.unlockable)
                    .map((sub) => {
                      const subKey = `${selectedSkill}-${sub.id}`
                      const assigned = myPlayer.assignedPoints?.[subKey] || 0
                      const isDisabled = availablePoints === 0

                      return (
                        <div key={subKey} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                          <div className="flex flex-col gap-2 mb-2">
                            <span className="text-base font-medium">{sub.name}</span>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i < assigned ? "bg-purple-500" : "bg-gray-600"}`}
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-purple-400">{assigned}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <button
                              onClick={() => onSpendPoint(subKey)}
                              disabled={isDisabled}
                              className={`py-1 px-2 rounded transition duration-200 flex items-center justify-center ${
                                isDisabled
                                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              }`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                /* Implement decrease point logic */
                              }}
                              disabled={assigned === 0}
                              className={`py-1 px-2 rounded transition duration-200 flex items-center justify-center ${
                                assigned === 0
                                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Selecciona una habilidad para ver sus subhabilidades
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


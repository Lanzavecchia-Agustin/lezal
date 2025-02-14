"use client"

import type { MyPlayerData } from "./SceneDisplay"
import { X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PlayerStatusModalProps {
  myPlayer: MyPlayerData
  onClose: () => void
  level: number
  xpPercentage: number
  initialLife: number
  ATTRIBUTES: any[]
  SKILLS: any[]
}

export function PlayerStatusModal({ myPlayer, onClose, SKILLS }: PlayerStatusModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <Card className="w-[90vw] max-w-4xl h-[90vh] bg-gray-900 border-gray-700 text-gray-300 shadow-lg shadow-purple-900/20 flex flex-col">
        <CardHeader className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 flex flex-row items-center">
          <CardTitle className="text-2xl font-bold text-purple-400">Habilidades</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-gray-400 hover:text-gray-200 transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <CardContent className="p-6 space-y-8">
            {SKILLS.map((skill) => (
              <Card key={skill.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-medium text-purple-400">{skill.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skill.subskills.map((sub: { id: string; name: string }) => {
                      const subKey = `${skill.id}-${sub.id}`
                      const assigned = myPlayer.assignedPoints?.[subKey] || 0
                      return (
                        <div key={subKey} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
                          <span className="text-sm text-gray-300 break-words pr-2" style={{ wordBreak: "break-word" }}>
                            {sub.name}
                          </span>
                          <Badge variant="secondary" className="bg-cyan-900 text-cyan-300 ml-2 whitespace-nowrap">
                            {assigned}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}


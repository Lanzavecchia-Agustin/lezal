'use client'

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { gameConfig, SKILLS, type Subskill } from "../../roomsStore"
import { Cpu, Users, Radio, ChevronLeft, Plus, Minus, Check } from "lucide-react"
import { Terminal, AnimatedSpan } from "@/components/magicui/terminal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import db from "../../db.json"
interface RoomPayload {
  userName: string
  roomId: string
  assignedPoints: { [subskillKey: string]: number }
  avatar: string
}

interface JoinFormProps {
  userName: string
  setUserName: (name: string) => void
  roomId: string | null
  setRoomId: (roomId: string) => void
  handleCreateRoom: (data: RoomPayload) => void
  handleJoinRoom: (data: RoomPayload) => void
  assignedPoints: { [subskillKey: string]: number }
  setAssignedPoints: React.Dispatch<React.SetStateAction<{ [subskillKey: string]: number }>>
  selectedAvatar: string
  setSelectedAvatar: React.Dispatch<React.SetStateAction<string>>
}

const JoinForm: React.FC<JoinFormProps> = ({
  userName,
  setUserName,
  roomId,
  setRoomId,
  handleCreateRoom,
  handleJoinRoom,
  assignedPoints,
  setAssignedPoints,
  selectedAvatar,
  setSelectedAvatar
}) => {
  const [step, setStep] = useState(1)
  const [confirmedUserName, setConfirmedUserName] = useState("")
  const [confirmedSkills, setConfirmedSkills] = useState<{ [subskillKey: string]: number }>({})
  const [avatars, setAvatars] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [skillsData, setSkillsData] = useState<any>(null)

  // Obtener datos de habilidades
  useEffect(() => {
    // En lugar de fetch, usamos los datos importados
    setSkillsData(db.skills);
  }, []);
  // Obtener avatares
  useEffect(() => {
    setAvatars(db.avatars);
  }, []);
  
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" })
  }, [])

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const maxStartingPoints = gameConfig.find((item) => item.id === "maxStartingPoints")?.value ?? 0
  const totalAssigned = Object.values(assignedPoints).reduce((acc, val) => acc + val, 0)
  const pointsLeft = maxStartingPoints - totalAssigned

  const handlePointsChange = (subKey: string, newValue: number) => {
    if (newValue < 0) return
    const currentVal = assignedPoints[subKey] || 0
    const diff = newValue - currentVal
    if (diff > 0 && diff > pointsLeft) return
    setAssignedPoints((prev) => ({ ...prev, [subKey]: newValue }))
  }

  // Confirmar nombre (requiere que se haya seleccionado un avatar)
  const confirmUserName = () => {
    if (!selectedAvatar) {
      alert("Por favor, selecciona un avatar")
      return
    }
    setConfirmedUserName(userName)
    nextStep()
  }

  const editUserName = () => {
    setConfirmedUserName("")
    setStep(1)
  }

  const confirmSkills = () => {
    setConfirmedSkills(assignedPoints)
    nextStep()
  }

  const editSkills = () => {
    setConfirmedSkills({})
    setStep(2)
  }

  // Extraer nombres de habilidad y subhabilidad
  const getSkillName = (skillId: string, subskillId: string) => {
    if (!skillsData) return ""
    const skill = skillsData.find((s: any) => s.id === skillId)
    if (!skill) return ""
    const subskill = skill.subskills.find((sub: any) => sub.id === subskillId)
    return subskill ? subskill.name : ""
  }

  // Payload a enviar (incluye avatar)
  const onCreateRoom = () => {
    const payload: RoomPayload = {
      userName,
      roomId: roomId || "",
      assignedPoints,
      avatar: selectedAvatar,
    }
    handleCreateRoom(payload)
  }

  const onJoinRoom = () => {
    const payload: RoomPayload = {
      userName,
      roomId: roomId || "",
      assignedPoints,
      avatar: selectedAvatar,
    }
    handleJoinRoom(payload)
  }

  return (
    <Terminal className="min-h-screen w-[80vw] flex flex-col bg-transparent font-mono p-4 border border-white">
      <AnimatedSpan className="text-2xl font-bold text-white mb-4">
        Terminal de Acceso
      </AnimatedSpan>

      <div ref={containerRef} className="flex-grow overflow-auto">
        <div className="space-y-6">
          {/* Sección 1: Identificación y selección de avatar */}
          <div className="space-y-4">
            <AnimatedSpan className="flex items-center space-x-2 text-xl text-white">
              <Cpu className="w-6 h-6" />
              <span>Identificación</span>
            </AnimatedSpan>
            {!confirmedUserName ? (
              <>
                <div className="p-4">
                  <Input
                    id="userName"
                    placeholder="Ingresa tu nombre clave"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-transparent border-white text-white w-full"
                  />
                </div>
                <div className="p-4">
                  <Label className="block text-white mb-2">Elige tu Apariencia</Label>
                  <div className="flex gap-4 flex-wrap">
                    {avatars.map((avatar) => (
                      <img
                        key={avatar.id}
                        src={avatar.img}
                        alt={avatar.name}
                        className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                          selectedAvatar === avatar.img ? "border-purple-500" : "border-transparent"
                        }`}
                        onClick={() => setSelectedAvatar(avatar.img)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-purple-900 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      avatars.find((avatar) => avatar.img === selectedAvatar)?.img ||
                      "/placeholder.svg"
                    }
                    alt="Avatar seleccionado"
                    className="w-16 h-16 rounded-full border-2 border-purple-500"
                  />
                  <p className="text-white">
                    Nombre confirmado: <span className="font-bold">{confirmedUserName}</span>
                  </p>
                </div>
                <Button onClick={editUserName} variant="outline" size="sm" className="text-white border-white">
                  Editar
                </Button>
              </div>
            )}
          </div>

          {/* Sección 2: Configuración de Habilidades */}
          {step >= 2 && (
            <div className="space-y-4">
              <AnimatedSpan className="flex items-center space-x-2 text-xl text-white">
                <Cpu className="w-6 h-6" />
                <span>Configuración de Habilidades</span>
              </AnimatedSpan>
              {Object.keys(confirmedSkills).length === 0 ? (
                <div className="bg-transparent p-4 rounded-lg border border-purple-600">
                  <p className="font-semibold text-white mb-4">
                    Puntos disponibles: <span className="text-purple-300">{pointsLeft}</span> / {maxStartingPoints}
                  </p>
                  <Accordion type="single" collapsible className="w-full">
                    {SKILLS.map((skill) => (
                      <AccordionItem key={skill.id} value={skill.id}>
                        <AccordionTrigger className="text-lg font-bold text-white">{skill.name}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {skill.subskills
                              .filter((sub: Subskill) => !sub.unlockable)
                              .map((sub: Subskill) => {
                                const subKey = `${skill.id}-${sub.id}`
                                const value = assignedPoints[subKey] || 0
                                return (
                                  <div
                                    key={subKey}
                                    className="flex items-center justify-between p-2 bg-black rounded-lg border border-purple-700"
                                  >
                                    <Label className="font-medium text-purple-300">{sub.name}</Label>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={value <= 0}
                                        onClick={() => handlePointsChange(subKey, value - 1)}
                                        className="border-purple-500 text-white hover:bg-purple-900 p-1"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="w-8 text-center text-white">{value}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pointsLeft <= 0}
                                        onClick={() => handlePointsChange(subKey, value + 1)}
                                        className="border-purple-500 text-white hover:bg-purple-900 p-1"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={confirmSkills} variant="outline" className="text-white border-white">
                      Confirmar Habilidades <Check className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-purple-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-white mb-4 text-lg font-bold">Habilidades confirmadas:</p>
                    <Button onClick={editSkills} variant="outline" size="sm" className="text-white border-white">
                      Editar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(confirmedSkills).map(([key, value]) => {
                      const skillId = key.slice(0, 36)
                      const subskillId = key.slice(37)
                      const skillName = SKILLS.find((s) => s.id === skillId)?.name || ""
                      const subskillName = getSkillName(skillId, subskillId)
                      return (
                        <div key={key} className="bg-black p-3 rounded-lg border border-purple-700">
                          <p className="text-purple-300 font-medium">{skillName}</p>
                          <p className="text-white">
                            {subskillName}: <span className="font-bold">{value}</span>
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección 3: Conexión a la Sala */}
          {step >= 3 && (
            <div className="space-y-4">
              <AnimatedSpan className="flex items-center space-x-2 text-xl text-white">
                <Radio className="w-6 h-6" />
                <span>Conexión a la Sala</span>
              </AnimatedSpan>
              <div className="bg-gray-900 p-4 rounded-lg border border-purple-600">
                <Label htmlFor="roomId" className="text-purple-300 mb-2 block">
                  ID de Sala
                </Label>
                <Input
                  id="roomId"
                  placeholder="Ingresa el código de la sala"
                  value={roomId || ""}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-black border-purple-500 text-white placeholder-purple-700 w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de botones fija al fondo */}
      <div className="mt-4 pt-4">
        <div className="flex justify-between">
          {step > 1 && (
            <Button onClick={prevStep} className="bg-transparent text-white">
              <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={step === 1 ? confirmUserName : confirmSkills}
              disabled={step === 1 && !userName}
              className="bg-transparent text-white ml-auto flex items-center"
            >
              {step === 1 ? "Confirmar Nombre" : "Confirmar Habilidades"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex space-x-4 ml-auto">
              <Button
                onClick={onCreateRoom}
                className="bg-purple-700 text-white hover:bg-purple-600 flex items-center"
              >
                <Users className="w-4 h-4 mr-2" /> Crear Sala
              </Button>
              <Button
                onClick={onJoinRoom}
                disabled={!roomId}
                className="bg-purple-700 text-white hover:bg-purple-600 flex items-center"
              >
                <Radio className="w-4 h-4 mr-2" /> Unirse a Sala
              </Button>
            </div>
          )}
        </div>
      </div>
    </Terminal>
  )
}

export default JoinForm;

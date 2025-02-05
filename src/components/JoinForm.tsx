"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Step, Steps } from "./ui/steps";
import { gameConfig } from "../../roomsStore";
import { Subskill } from "../../roomsStore";

// Props que recibe el JoinForm
interface JoinFormProps {
  userName: string;
  setUserName: (name: string) => void;
  userType: "Normal" | "Líder";
  setUserType: (type: "Normal" | "Líder") => void;
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;

  // Objeto con subskillId -> puntos asignados
  assignedPoints: { [subskillId: string]: number };
  setAssignedPoints: React.Dispatch<React.SetStateAction<{ [subskillId: string]: number }>>;
}

const JoinForm: React.FC<JoinFormProps> = ({
  userName,
  setUserName,
  userType,
  setUserType,
  roomId,
  setRoomId,
  handleCreateRoom,
  handleJoinRoom,
  assignedPoints,
  setAssignedPoints
}) => {
  const [step, setStep] = useState(1);

  // Avanzar/retroceder en el wizard
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Cálculo del total de puntos asignados
  const totalAssigned = Object.values(assignedPoints).reduce((acc, val) => acc + val, 0);
  const pointsLeft = gameConfig.maxStartingPoints - totalAssigned;

  // Función para asignar puntos a una subskill
  const handlePointsChange = (subskillId: string, newValue: number) => {
    if (newValue < 0) return;
    const currentVal = assignedPoints[subskillId] || 0;
    const diff = newValue - currentVal;
    if (diff > 0 && diff > pointsLeft) {
      return; // Evita pasar el límite
    }
    setAssignedPoints((prev) => ({
      ...prev,
      [subskillId]: newValue,
    }));
  };

  return (
    <Card className="w-full max-w-7xl p-6 mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold">
          Unirse al Juego
        </CardTitle>
        <CardDescription className="text-lg">
          Sigue los pasos para unirte o crear una sala
        </CardDescription>
        <Steps className="mt-4">
          <Step active={step >= 1} />
          <Step active={step >= 2} />
          <Step active={step >= 3} />
        </Steps>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* STEP 1: Introducir nombre y tipo de jugador */}
        {step === 1 && (
          <div className="space-y-4">
            <Label htmlFor="userName">Tu nombre</Label>
            <Input
              id="userName"
              placeholder="Ingresa tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <RadioGroup
              value={userType}
              onValueChange={(value) => setUserType(value as "Normal" | "Líder")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Líder" id="lider" />
                <Label htmlFor="lider">Líder</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* STEP 2: Distribución de puntos iniciales en subhabilidades (solo las NO unlockable) */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="font-semibold">
              Puntos disponibles: {pointsLeft} / {gameConfig.maxStartingPoints}
            </p>

            {gameConfig.skills.map((skill) => (
              <div key={skill.id} className="mb-4">
                <h3 className="text-lg font-bold mb-2">{skill.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {skill.subskills
                    .filter((sub: Subskill) => !sub.unlockable) // Ocultamos las unlockable de inicio
                    .map((sub: Subskill) => {
                      const value = assignedPoints[sub.id] || 0;
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <Label className="font-semibold">{sub.name}</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={value <= 0}
                              onClick={() => handlePointsChange(sub.id, value - 1)}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              className="w-14 text-center"
                              readOnly
                              value={value}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pointsLeft <= 0}
                              onClick={() => handlePointsChange(sub.id, value + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Ingresar ID de la sala */}
        {step === 3 && (
          <div className="space-y-4">
            <Label htmlFor="roomId">ID de Sala</Label>
            <Input
              id="roomId"
              placeholder="Ingresa el ID de la sala"
              value={roomId || ""}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      {/* Botones de navegación / confirmar */}
      <CardFooter className="flex flex-col md:flex-row md:justify-between gap-4">
        {step > 1 && (
          <Button variant="outline" onClick={prevStep}>
            Atrás
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={nextStep} disabled={step === 1 && !userName}>
            Siguiente
          </Button>
        ) : (
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Button onClick={handleCreateRoom}>Crear Sala</Button>
            <Button onClick={handleJoinRoom} disabled={!roomId}>
              Unirse a Sala
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default JoinForm;

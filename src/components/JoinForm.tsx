"use client";

import React, { useState } from "react";
import { ATRIBUTOS_DISPONIBLES } from "../../roomsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Step, Steps } from "./ui/steps";

interface JoinFormProps {
  userName: string;
  setUserName: (name: string) => void;
  userType: "Normal" | "Líder";
  setUserType: (type: "Normal" | "Líder") => void;
  chosenAttributes: string[];
  setChosenAttributes: React.Dispatch<React.SetStateAction<string[]>>;
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
}

const JoinForm: React.FC<JoinFormProps> = ({
  userName,
  setUserName,
  userType,
  setUserType,
  chosenAttributes,
  setChosenAttributes,
  roomId,
  setRoomId,
  handleCreateRoom,
  handleJoinRoom,
}) => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    // Se usa w-full para ocupar todo el ancho disponible y max-w-2xl para limitar el ancho máximo
    <Card className="w-full max-w-2xl p-6 mx-auto">
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
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Tu nombre</Label>
              <Input
                id="userName"
                placeholder="Ingresa tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
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

        {step === 2 && (
          <div className="space-y-4">
            <Label>Elige hasta 2 atributos iniciales:</Label>
            <div className="grid grid-cols-2 gap-4">
              {ATRIBUTOS_DISPONIBLES.map((attr) => {
                const isSelected = chosenAttributes.includes(attr);
                const disabled = !isSelected && chosenAttributes.length >= 2;
                return (
                  <div key={attr} className="flex items-center space-x-2">
                    <Checkbox
                      id={attr}
                      checked={isSelected}
                      disabled={disabled}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setChosenAttributes((prev) => [...prev, attr]);
                        } else {
                          setChosenAttributes((prev) =>
                            prev.filter((a) => a !== attr)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={attr}>{attr}</Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">ID de Sala</Label>
              <Input
                id="roomId"
                placeholder="Ingresa el ID de la sala"
                value={roomId || ""}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
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

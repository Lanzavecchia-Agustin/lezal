"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { API_ROUTES } from "../../utils/apiConfig";
import { ATRIBUTOS_DISPONIBLES } from "../../roomsStore";

// Tipos de datos locales para la UI
interface Scene {
  id: string;
  text: string;
  options: { 
    id: number; 
    text: string; 
    nextSceneId: any;
  }[];
  isEnding?: boolean;
}

interface SceneUpdatePayload {
  scene: Scene;
  votes: { [optionId: number]: number };
  users: string[];
  userVoted: string[];
  // Condiciones de atributos bloqueados
  lockedConditions?: { [attribute: string]: number };
}

interface VoteUpdatePayload {
  votes: { [optionId: number]: number };
  userVoted: string[];
}

export default function StoryGame() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userType, setUserType] = useState<"Normal" | "Líder">("Normal");
  const [chosenAttributes, setChosenAttributes] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  // Estado para mostrar condiciones de desbloqueo
  const [lockedConditions, setLockedConditions] = useState<{ [attribute: string]: number }>({});
  const pusherRef = useRef<Pusher | null>(null);
  const debugMode = true;

  useEffect(() => {
    if (roomId) {
      if (!pusherRef.current) {
        pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
      }
      const channel = pusherRef.current.subscribe(`room-${roomId}`);
      channel.bind("sceneUpdate", (payload: SceneUpdatePayload) => {
        setScene(payload.scene);
        setVotes(payload.votes);
        setUsers(payload.users);
        setHasVoted(payload.userVoted?.includes(userName) || false);
        if (payload.lockedConditions) {
          setLockedConditions(payload.lockedConditions);
        }
        if (debugMode) {
          console.log("[sceneUpdate] Payload:", payload);
        }
      });
      channel.bind("voteUpdate", (payload: VoteUpdatePayload) => {
        setVotes(payload.votes);
        setHasVoted(payload.userVoted?.includes(userName) || false);
        if (debugMode) {
          console.log("[voteUpdate] Payload:", payload);
        }
      });
      channel.bind("error", (error: string) => {
        alert(`Error: ${error}`);
      });
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [roomId, userName, debugMode]);

  // Crear Sala
  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }
    const generatedRoomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setRoomId(generatedRoomId);
    const attrString = chosenAttributes.join(",");
    const joinUrl = API_ROUTES.joinRoom(generatedRoomId, userName, userType, attrString);
    console.log("[handleCreateRoom] Join URL =>", joinUrl);
    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al crear la sala: ${error.message}`);
    }
  };

  // Unirse a Sala
  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId) {
      alert("Por favor, ingresa tu nombre y el ID de la sala.");
      return;
    }
    const attrString = chosenAttributes.join(",");
    const joinUrl = API_ROUTES.joinRoom(roomId, userName, userType, attrString);
    console.log("[handleJoinRoom] Join URL =>", joinUrl);
    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al unirse a la sala: ${error.message}`);
    }
  };

  // Votar
  const handleVote = async (optionId: number) => {
    if (!scene || scene.isEnding || hasVoted) return;
    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }
    const voteUrl = API_ROUTES.vote(roomId, userName, optionId);
    console.log("[handleVote] Vote URL =>", voteUrl);
    try {
      const response = await fetch(voteUrl, { method: "GET" });
      if (!response.ok) {
        const error = await response.json();
        alert(`Error al votar: ${error.message}`);
      }
    } catch (err) {
      alert("Error al comunicarse con el servidor.");
    }
  };

  // Cerrar votación manualmente
  const handleCloseVoting = async () => {
    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }
    const closeUrl = API_ROUTES.closeVoting(roomId);
    console.log("[handleCloseVoting] Close URL =>", closeUrl);
    try {
      const response = await fetch(closeUrl, { method: "GET" });
      if (!response.ok) {
        const error = await response.json();
        alert(`Error al cerrar la votación: ${error.message}`);
      }
    } catch (err) {
      alert("Error al comunicarse con el servidor.");
    }
  };

  if (!joined) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Crea o únete a una sala</h1>
        <input
          type="text"
          placeholder="Tu nombre"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border px-4 py-2"
        />
        <div className="flex items-center space-x-2">
          <label htmlFor="userType" className="text-sm font-bold">
            Tipo de jugador:
          </label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value as "Normal" | "Líder")}
            className="border px-2 py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Líder">Líder</option>
          </select>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-bold">Elige hasta 2 atributos iniciales:</p>
          <div className="flex flex-wrap">
            {ATRIBUTOS_DISPONIBLES.map((attr) => {
              const isSelected = chosenAttributes.includes(attr);
              const disabled = !isSelected && chosenAttributes.length >= 2;
              return (
                <label key={attr} className="mr-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() =>
                      setChosenAttributes((prev) =>
                        isSelected ? prev.filter((a) => a !== attr) : [...prev, attr]
                      )
                    }
                  />
                  <span className="ml-1">{attr}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <button onClick={handleCreateRoom} className="px-6 py-2 bg-blue-500 text-white rounded-md">
            Crear Sala
          </button>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="ID de Sala"
              value={roomId || ""}
              onChange={(e) => setRoomId(e.target.value)}
              className="border px-4 py-2"
            />
            <button onClick={handleJoinRoom} className="px-6 py-2 bg-green-500 text-white rounded-md">
              Unirse a la Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        Cargando escena...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">{scene.text}</h1>
      <div className="text-sm">Usuarios en la sala: {users.join(", ")}</div>
      {debugMode && (
        <div className="text-xs text-gray-400">
          <p>
            <strong>DEBUG - Escena actual:</strong> {scene.id}
          </p>
          {/* Mostrar condiciones de desbloqueo */}
          <div>
            <strong>Condiciones desbloqueo:</strong>
            {Object.entries(lockedConditions).map(([attr, count]) => (
              <div key={attr}>
                <span className="text-primary">
                  {attr}: {count} {count >= 5 ? "(Desbloqueado)" : "(En progreso)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="p-2 rounded-md text-center">
        <p className="text-sm font-bold">Tu información:</p>
        <p>Tipo: {userType}</p>
        <p>Atributos iniciales: {chosenAttributes.join(", ") || "Ninguno"}</p>
      </div>
      {roomId && (
        <div className="mb-2 text-center">
          <p>
            <strong>ID de Sala:</strong> {roomId}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              alert("ID copiado al portapapeles");
            }}
            className="text-blue-500 underline"
          >
            Copiar ID
          </button>
        </div>
      )}
      {!scene.isEnding &&
        scene.options.map((option) => {
          const debugOption = option as any;
          const debugRequirement = debugOption.requirement ?? "(sin requirement)";
          const debugMaxVotes = debugOption.maxVotes ?? "(sin límite)";
          let debugNextScene = "";
          if (debugOption.nextSceneId?.success) {
            debugNextScene =
              "Success: " +
              debugOption.nextSceneId.success +
              ", Failure: " +
              (debugOption.nextSceneId.failure ?? "N/A") +
              (debugOption.nextSceneId.partial ? `, Partial: ${debugOption.nextSceneId.partial}` : "");
          } else {
            debugNextScene = "-> nextSceneId: " + option.nextSceneId;
          }
          // Mostrar la info de desbloqueo si existe
          const lockedInfo = debugOption.lockedAttributeIncrement
            ? `Desbloqueo: ${debugOption.lockedAttributeIncrement.attribute} (+${debugOption.lockedAttributeIncrement.increment})`
            : "";
          return (
            <div key={option.id} className="w-full max-w-md mb-4">
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`bg-blue-800 py-2 px-4 rounded-md w-full text-left text-white ${
                  hasVoted ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {option.text}{" "}
                <span className="ml-2">
                  ({votes?.[option.id] ?? 0} votos)
                </span>
                {lockedInfo && (
                  <span className="ml-2 text-sm italic">{lockedInfo}</span>
                )}
              </button>
              {debugMode && (
                <div className="ml-2 text-xs text-yellow-400">
                  <p>
                    · Req: <em>{debugRequirement}</em>
                  </p>
                  <p>· maxVotes: {debugMaxVotes}</p>
                  <p>· Destinos: {debugNextScene}</p>
                </div>
              )}
            </div>
          );
        })}
      {scene.isEnding && (
        <div className="bg-yellow-800 p-4 rounded-md text-white">
          <p className="text-xl font-semibold">¡Has llegado a un final!</p>
        </div>
      )}
    </div>
  );
}

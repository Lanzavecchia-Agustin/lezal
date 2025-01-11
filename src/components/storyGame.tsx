"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { API_ROUTES } from "../../utils/apiConfig";
import { ATRIBUTOS_DISPONIBLES } from "../../roomsStore";

// Atributos disponibles (puedes moverlo a un archivo común si prefieres)

// -- Tipos de datos locales para la UI --
interface Scene {
  id: string;
  text: string;
  options: { 
    id: number; 
    text: string; 
    nextSceneId: string 
    // O si en tu back-end usas { success, failure, partial }, ajusta
  }[];
  isEnding?: boolean;
}

interface SceneUpdatePayload {
  scene: Scene;
  votes: { [optionId: number]: number };
  users: string[];
  userVoted: string[];
}

interface VoteUpdatePayload {
  votes: { [optionId: number]: number };
  userVoted: string[];
}

export default function StoryGame() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Tipo de jugador y atributos elegidos:
  const [userType, setUserType] = useState<"Normal" | "Líder">("Normal");
  const [chosenAttributes, setChosenAttributes] = useState<string[]>([]);

  const [joined, setJoined] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const pusherRef = useRef<Pusher | null>(null);

  // (Opcional) Activa/Desactiva "debugMode" si deseas ocultarlo fácilmente
  const debugMode = true;

  // ----------------------------
  // Efecto para suscribir a Pusher
  // ----------------------------
  useEffect(() => {
    if (roomId) {
      // Inicializar pusher si no existe
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

  // ----------------------------
  // 1) Crear Sala
  // ----------------------------
  const handleCreateRoom = async () => {
    console.log("chosenAttributes antes de crear sala =>", chosenAttributes);
    if (!userName.trim()) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }

    // Generar un RoomID
    const generatedRoomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setRoomId(generatedRoomId);

    // Construir la URL con type y attributes
    const attrString = chosenAttributes.join(",");
    const joinUrl = API_ROUTES.joinRoom(generatedRoomId, userName, userType, attrString);

    // Para debug
    console.log("[handleCreateRoom] Join URL =>", joinUrl);

    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al crear la sala: ${error.message}`);
    }
  };

  // ----------------------------
  // 2) Unirse a Sala
  // ----------------------------
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

  // ----------------------------
  // 3) Votar
  // ----------------------------
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

  // ----------------------------
  // 4) Cerrar votación manualmente (si se desea)
  // ----------------------------
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

  // ----------------------------
  // Render: Selección de atributos y tipo antes de unirse
  // ----------------------------
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

        {/* Seleccionar el tipo: Normal o Líder */}
        <div className="flex items-center space-x-2">
          <label htmlFor="userType" className="text-sm font-bold">
            Tipo de jugador:
          </label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value as "Normal" | "Líder")}
            className="border px-2 py-1 bg-blue-500"
          >
            <option value="Normal">Normal</option>
            <option value="Líder">Líder</option>
          </select>
        </div>

        {/* Seleccionar atributos: máximo 2 */}
        <div className="flex flex-col items-start">
          <p className="font-bold">Elige hasta 2 atributos:</p>
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
        onChange={() => {
          setChosenAttributes((prev) =>
            isSelected
              ? prev.filter((a) => a !== attr) // Quitar si ya estaba seleccionado
              : [...prev, attr]               // Agregar si no estaba
          );
        }}
      />
      <span className="ml-1">{attr}</span>
    </label>
  );
})}

          </div>
        </div>

        {/* Botones para Crear Sala o Unirse a una Sala */}
        <div className="space-y-2 mt-4">
          <button
            onClick={handleCreateRoom}
            className="px-6 py-2 bg-blue-500 text-white rounded-md"
          >
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
            <button
              onClick={handleJoinRoom}
              className="px-6 py-2 bg-green-500 text-white rounded-md"
            >
              Unirse a la Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Render: Escena actual
  // ----------------------------
  if (!scene) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        Cargando escena...
      </div>
    );
  }

  // ----------------------------
  // Render final si ya estamos dentro de la sala
  // ----------------------------
  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">{scene.text}</h1>
      <div className="text-sm">Usuarios en la sala: {users.join(", ")}</div>

      {/* DEBUG: Mostrar ID de la escena actual */}
      {debugMode && (
        <div className="text-xs text-gray-400">
          <p><strong>DEBUG - ID de escena actual:</strong> {scene.id}</p>
        </div>
      )}

      {/* Info del jugador local */}
      <div className="p-2 rounded-md text-center">
        <p className="text-sm font-bold">Tu información:</p>
        <p>Tipo: {userType}</p>
        <p>Atributos: {chosenAttributes.join(", ") || "Ninguno"}</p>
      </div>

      {/* Mostrar y copiar el roomId para compartir */}
      {roomId && (
        <div className="mb-2 text-center">
          <p><strong>ID de Sala:</strong> {roomId}</p>
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

      {/* Listado de opciones de la escena */}
      {!scene.isEnding &&
        scene.options.map((option) => {
          // Pueden haber más campos en "option", si tu back-end lo envía
          const debugOption = option as any;
          const debugRequirement = debugOption.requirement ?? "(sin requirement)";
          const debugMaxVotes = debugOption.maxVotes ?? "(sin límite)";

          let debugNextScene = "";
          if (debugOption.nextSceneId?.success) {
            debugNextScene = `Success: ${debugOption.nextSceneId.success}, ` +
                             `Failure: ${debugOption.nextSceneId.failure ?? "N/A"}, ` +
                             `Partial: ${debugOption.nextSceneId.partial ?? "N/A"}`;
          } else {
            debugNextScene = `-> nextSceneId: ${option.nextSceneId}`;
          }

          return (
            <div key={option.id} className="w-full max-w-md">
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`bg-blue-800 py-2 px-4 rounded-md w-full text-left text-white ${
                  hasVoted ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {option.text}
                <span className="ml-2">({votes?.[option.id] ?? 0} votos)</span>
              </button>

              {debugMode && (
                <div className="ml-2 text-xs text-yellow-400">
                  <p>· Req: <em>{debugRequirement}</em></p>
                  <p>· maxVotes: {debugMaxVotes}</p>
                  <p>· Destinos: {debugNextScene}</p>
                </div>
              )}
            </div>
          );
        })
      }

      {/* Si es final, mostrar mensaje */}
      {scene.isEnding && (
        <div className="bg-yellow-800 p-4 rounded-md text-white">
          <p className="text-xl font-semibold">¡Has llegado a un final!</p>
        </div>
      )}
    </div>
  );
}

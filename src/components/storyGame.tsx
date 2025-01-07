"use client";

import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";

interface Scene {
  id: string;
  text: string;
  options: {
    id: number;
    text: string;
    nextSceneId: string;
  }[];
  isEnding?: boolean;
}

interface SceneUpdatePayload {
  scene: Scene;
  votes: { [optionId: number]: number };
  users: string[];
}

export default function StoryGame() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [joined, setJoined] = useState(false);

  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (roomId) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      const channel = pusher.subscribe(`room-${roomId}`);

      channel.bind("sceneUpdate", (payload: SceneUpdatePayload) => {
        setScene(payload.scene);
        setVotes(payload.votes);
        setUsers(payload.users);
        setHasVoted(false);
      });

      channel.bind("voteUpdate", (updatedVotes: { [optionId: number]: number }) => {
        setVotes(updatedVotes);
      });

      channel.bind("error", (error: string) => {
        alert(error);
      });

      return () => {
        pusher.unsubscribe(`room-${roomId}`);
      };
    }
  }, [roomId]);

  const handleCreateRoom = async () => {
    if (!userName) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }

    const generatedRoomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setRoomId(generatedRoomId);

    const response = await fetch(`/api/joinRoom?roomId=${generatedRoomId}&userName=${userName}`, {
      method: "GET",
    });

    if (response.ok) {
      setJoined(true);
    } else {
      alert("Error al crear la sala.");
    }
  };

  const handleJoinRoom = async () => {
    if (!userName || !roomId) {
      alert("Por favor, ingresa tu nombre y el ID de la sala.");
      return;
    }

    const response = await fetch(`/api/joinRoom?roomId=${roomId}&userName=${userName}`, {
      method: "GET",
    });

    if (response.ok) {
      setJoined(true);
    } else {
      alert("Error al unirse a la sala.");
    }
  };

  const handleVote = async (optionId: number) => {
    if (!scene || scene.isEnding || hasVoted) return;

    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }

    const response = await fetch(
      `/api/vote?roomId=${roomId}&userName=${userName}&optionId=${optionId}`,
      { method: "GET" }
    );

    if (response.ok) {
      setHasVoted(true);
    } else {
      alert("Error al enviar el voto.");
    }
  };

  const handleCloseVoting = async () => {
    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }

    const response = await fetch(`/api/closeVoting?roomId=${roomId}`, { method: "GET" });

    if (!response.ok) {
      alert("Error al cerrar la votación.");
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
        <div className="space-y-2">
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

  if (!scene) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        Cargando escena...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold">{scene.text}</h1>
      <div className="text-sm">Usuarios en la sala: {users.join(", ")}</div>

      {roomId && (
        <div className="mt-4 p-2 bg-gray-200 rounded-md text-center">
          <p>
            <strong>ID de Sala:</strong> {roomId}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="text-blue-500 underline mt-2"
          >
            Copiar ID
          </button>
        </div>
      )}

      {!scene.isEnding &&
        scene.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            className="bg-blue-800 py-2 px-4 rounded-md w-full max-w-md text-left"
          >
            {option.text} <span className="ml-2">({votes[option.id] || 0} votos)</span>
          </button>
        ))}

      {scene.isEnding && (
        <div className="bg-yellow-800 p-4 rounded-md">
          <p className="text-xl font-semibold">¡Has llegado a un final!</p>
        </div>
      )}

      {!scene.isEnding && (
        <button
          onClick={handleCloseVoting}
          className="mt-4 py-2 px-6 bg-red-400 text-white rounded-md"
        >
          Cerrar votación
        </button>
      )}
    </div>
  );
}

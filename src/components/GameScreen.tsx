"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { API_ROUTES } from "../../utils/apiConfig";
import JoinForm from "./JoinForm";
import SceneDisplay from "./SceneDisplay";
import { gameConfig, Scene } from "../../roomsStore"; // Asegúrate de que gameConfig incluya initialLife y stressThreshold

/** Representación mínima de la escena */


// Estructura para almacenar la información de cada jugador (ahora incluyendo vida y estrés)
interface PlayerData {
  xp: number;
  skillPoints: number;
  lockedAttributes?: { [attribute: string]: number };
  life: number;
  stress: number;
}

// Payloads de eventos
interface SceneUpdatePayload {
  scene: Scene;
  votes: { [optionId: number]: number };
  users: string[];
  userVoted: string[];
  players?: { 
    name: string; 
    xp: number; 
    skillPoints: number; 
    lockedAttributes?: { [attribute: string]: number };
    life?: number;
    stress?: number;
  }[];
}

interface VoteUpdatePayload {
  votes: { [optionId: number]: number };
  userVoted: string[];
}

export default function GameScreen() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userType, setUserType] = useState<"Normal" | "Líder">("Normal");

  // assignedPoints: subhabilidades elegidas al inicio
  const [assignedPoints, setAssignedPoints] = useState<{ [subskillId: string]: number }>({});

  const [joined, setJoined] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  // playersData: guardamos XP, skillPoints, lockedAttributes, vida y estrés de cada jugador
  const [playersData, setPlayersData] = useState<Record<string, PlayerData>>({});

  // Pusher
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

        if (payload.players) {
          const pd: Record<string, PlayerData> = {};
          payload.players.forEach((pl) => {
            pd[pl.name] = {
              xp: pl.xp,
              skillPoints: pl.skillPoints,
              lockedAttributes: pl.lockedAttributes || {},
              life: pl.life !== undefined ? pl.life : gameConfig.initialLife,
              stress: pl.stress !== undefined ? pl.stress : 0,
            };
          });
          setPlayersData(pd);
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

  /**
   * Crear Sala
   */
  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }
    const generatedRoomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setRoomId(generatedRoomId);

    // Enviamos assignedPoints como JSON
    const assignedPointsString = JSON.stringify(assignedPoints);
    const joinUrl = API_ROUTES.joinRoom(generatedRoomId, userName, userType, assignedPointsString);
    console.log("[handleCreateRoom] =>", joinUrl);

    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al crear la sala: ${error.message}`);
    }
  };

  /**
   * Unirse a Sala
   */
  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId) {
      alert("Por favor, ingresa tu nombre y el ID de la sala.");
      return;
    }
    const assignedPointsString = JSON.stringify(assignedPoints);
    const joinUrl = API_ROUTES.joinRoom(roomId, userName, userType, assignedPointsString);
    console.log("[handleJoinRoom] =>", joinUrl);

    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al unirse a la sala: ${error.message}`);
    }
  };

  /**
   * Manejo de voto por una opción
   */
  const handleVote = async (optionId: number) => {
    if (!scene || scene.isEnding || hasVoted) return;
    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }
    const voteUrl = API_ROUTES.vote(roomId, userName, optionId);
    console.log("[handleVote] =>", voteUrl);

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

  // Construimos la información de "mi jugador" combinando los datos del join (assignedPoints) con los recibidos por Pusher
  const myPlayerData = playersData[userName] || { xp: 0, skillPoints: 0, lockedAttributes: {}, life: gameConfig.initialLife, stress: 0 };
  const myPlayer = {
    name: userName,
    assignedPoints,
    xp: myPlayerData.xp,
    skillPoints: myPlayerData.skillPoints,
    lockedAttributes: myPlayerData.lockedAttributes || {},
    life: myPlayerData.life,
    stress: myPlayerData.stress
  };

  // Render
  if (!joined) {
    return (
      <JoinForm
        userName={userName}
        setUserName={setUserName}
        userType={userType}
        setUserType={setUserType}
        roomId={roomId}
        setRoomId={setRoomId}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        assignedPoints={assignedPoints}
        setAssignedPoints={setAssignedPoints}
      />
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
    <SceneDisplay
      roomId={roomId}
      scene={scene}
      users={users}
      votes={votes}
      hasVoted={hasVoted}
      handleVote={handleVote}
      debugMode={debugMode}
      myPlayer={myPlayer}
    />
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { API_ROUTES } from "../../utils/apiConfig";
import JoinForm from "./JoinForm";
import SceneDisplay from "./SceneDisplay";
import { gameConfig, Scene } from "../../roomsStore"; // gameConfig debe incluir initialLife y stressThreshold

// Estructura para almacenar la información de cada jugador (incluyendo vida y estrés)
export interface PlayerData {
  xp: number;
  skillPoints: number;
  assignedPoints: { [subskillId: string]: number };
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
    assignedPoints: { [subskillId: string]: number };
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
  const [assignedPoints, setAssignedPoints] = useState<{ [subskillId: string]: number }>({});
  const [joined, setJoined] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [playersData, setPlayersData] = useState<Record<string, PlayerData>>({});
  const [leader, setLeader] = useState<string | null>(null);  // Estado para el líder

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
              assignedPoints: pl.assignedPoints,
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

      channel.bind("playerUpdate", (payload: { player: PlayerData & { name: string } }) => {
        setPlayersData((prev) => ({ ...prev, [payload.player.name]: payload.player }));
      });

      // Actualización del líder
      channel.bind("leaderSelected", (payload: { leader: string }) => {
        setLeader(payload.leader);  // Actualizamos el estado del líder
        alert(`El líder es ${payload.leader}`);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [roomId, userName, debugMode]);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }
    const generatedRoomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    setRoomId(generatedRoomId);

    const assignedPointsString = JSON.stringify(assignedPoints);
    const joinUrl = API_ROUTES.joinRoom(generatedRoomId, userName, assignedPointsString);
    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al crear la sala: ${error.message}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId) {
      alert("Por favor, ingresa tu nombre y el ID de la sala.");
      return;
    }
    const assignedPointsString = JSON.stringify(assignedPoints);
    const joinUrl = API_ROUTES.joinRoom(roomId, userName, assignedPointsString);
    const response = await fetch(joinUrl, { method: "GET" });
    if (response.ok) {
      setJoined(true);
    } else {
      const error = await response.json();
      alert(`Error al unirse a la sala: ${error.message}`);
    }
  };

  const handleVote = async (optionId: number) => {
    if (!scene || scene.isEnding || hasVoted) return;
    if (!roomId) {
      alert("No estás en una sala.");
      return;
    }
    const voteUrl = API_ROUTES.vote(roomId, userName, optionId);
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

  const myPlayerData = playersData[userName] || {
    xp: 0,
    skillPoints: 0,
    assignedPoints: {},
    lockedAttributes: {},
    life: gameConfig.initialLife,
    stress: 0,
  };

  const effectiveAssignedPoints =
    Object.keys(myPlayerData.assignedPoints || {}).length > 0
      ? myPlayerData.assignedPoints
      : assignedPoints;

  const myPlayer = {
    name: userName,
    assignedPoints: effectiveAssignedPoints,
    xp: myPlayerData.xp,
    skillPoints: myPlayerData.skillPoints,
    lockedAttributes: myPlayerData.lockedAttributes || {},
    life: myPlayerData.life,
    stress: myPlayerData.stress,
  };

  if (!joined) {
    return (
      <JoinForm
        userName={userName}
        setUserName={setUserName}
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
    <div>
      <SceneDisplay
        roomId={roomId}
        scene={scene}
        users={users}
        votes={votes}
        hasVoted={hasVoted}
        handleVote={handleVote}
        debugMode={debugMode}
        myPlayer={myPlayer}
        leader={leader}  // Mostrar el líder
      />
    </div>
  );
}
// StoryGame.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { API_ROUTES } from "../../utils/apiConfig";
import { ATRIBUTOS_DISPONIBLES } from "../../roomsStore";

import JoinForm from "./JoinForm";
import SceneDisplay from "./SceneDisplay";

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
  lockedConditions?: { [attribute: string]: number };
}

interface VoteUpdatePayload {
  votes: { [optionId: number]: number };
  userVoted: string[];
}

export default function GameScreen() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userType, setUserType] = useState<"Normal" | "Líder">("Normal");
  const [chosenAttributes, setChosenAttributes] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [votes, setVotes] = useState<{ [optionId: number]: number }>({});
  const [users, setUsers] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
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


  if (!joined) {
    return (
      <JoinForm
        userName={userName}
        setUserName={setUserName}
        userType={userType}
        setUserType={setUserType}
        chosenAttributes={chosenAttributes}
        setChosenAttributes={setChosenAttributes}
        roomId={roomId}
        setRoomId={setRoomId}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
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
      scene={scene}
      users={users}
      votes={votes}
      hasVoted={hasVoted}
      handleVote={handleVote}
      debugMode={debugMode}
      lockedConditions={lockedConditions}
    />
  );
}

'use client';

import type { MyPlayerData } from "./SceneDisplay";
import { Shield, Zap, Brain, Heart, Activity, ChevronDown, Users, ArrowUp } from "lucide-react";
import type React from "react";

interface PlayerInfoBarProps {
  myPlayer: MyPlayerData;
  xp: number;
  skillPoints: number;
  life: number;
  stress: number;
  onOpenSkillPointModal: () => void;
  onOpenStatusModal: () => void;
  level: number;
  xpPercentage: number;
  initialLife: number;
  roomId: string;
  avatar: string;
}

export function PlayerInfoBar({
  myPlayer,
  xp,
  skillPoints,
  life,
  stress,
  onOpenSkillPointModal,
  onOpenStatusModal,
  level,
  xpPercentage,
  initialLife,
  roomId,
  avatar,
}: PlayerInfoBarProps) {
  return (
    <div className="bg-transparent">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Avatar and Player Info */}
        
        <div className="flex items-center space-x-4" onClick={skillPoints > 0 ? onOpenSkillPointModal : undefined}>
          <div className="relative flex flex-col items-center justify-center">
          <img
            src={avatar || "/placeholder.svg"}
            alt="Avatar"
       
            className={`w-24 h-24 rounded-full border-2 ${
              skillPoints > 0
                ? "animate-pulse cursor-pointer border-purple-300"
                : "border-purple-500"
            }`}
          />
        { skillPoints > 0 && <div className="flex items-center justify-center space-x-2 mt-2 animate-pulse cursor-pointer">
            <p className="text-white text-xs">Level Up</p>
            <ArrowUp className="w-3 h-3 text-white" />
          </div>}
          </div>

          <div>
            
            <p className="text-lg font-semibold text-purple-400">{myPlayer.name}</p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 font-medium">Nv.{level}</p>
            </div>
            <button
              onClick={onOpenStatusModal}
              className="text-gray-300 py-1 text-sm flex items-center space-x-1"
            >
              <span>Habilidades</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>


        <div className="flex flex-wrap gap-4">
          <StatusItem
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            label="XP"
            value={`${xp}/100`}
            percentage={xpPercentage}
            color="yellow"
          />
          <StatusItem
            icon={<Heart className="w-5 h-5 text-red-500" />}
            label="Vida"
            value={`${life}/${initialLife}`}
            percentage={(life / initialLife) * 100}
            color="red"
          />
          <StatusItem
            icon={<Activity className="w-5 h-5 text-green-500" />}
            label="Estrés"
            value={stress.toString()}
            percentage={stress}
            color="green"
          />
        </div>

        {/* Skills and Room Info */}
        <div className="flex items-center space-x-4 ml-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2 bg-purple-900 px-3 py-1 rounded">
              <Users className="w-4 h-4 text-purple-300" />
              <p className="text-purple-300 font-medium text-sm">Sala: {roomId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage: number;
  color: string;
}

function StatusItem({ icon, label, value, percentage, color }: StatusItemProps) {
  return (
    <div className="flex items-center space-x-3">
      {icon}
      <div className="flex flex-col w-32">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium text-white">{label}</span>
          <span className="text-white">{value}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

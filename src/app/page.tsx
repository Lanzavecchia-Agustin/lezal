'use client';
import { useState, useEffect } from "react";
import GameScreen from "@/components/GameScreen";
import Particles from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";
import '../app/globals.css';

const themes = [
  "theme-classic-bw",
  "theme-monochrome-green",
  "theme-blue-white-space",
  "theme-retro-grayscale-accent",
  "theme-minimalist-bw-purple"
];

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [currentTheme] = useState(0);

  useEffect(() => {
    document.body.className = themes[currentTheme];
  }, [currentTheme]);

  const handleContinue = () => {
    setShowGame(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-indigo-950 to-black">

      {/* Capa de partículas sangrientas */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={700}
        staticity={120}
        ease={60}
        color="#8B0000"
        minSize={0.4}
        maxSize={2}
        speed={0.3}
        vx={0.05}
        vy={0.05}
      />

      {/* Capa de partículas de colores oscuros */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={500}
        staticity={100}
        ease={70}
        color="#7C0909"
        minSize={0.5}
        maxSize={1.5}
        speed={0.4}
        vx={-0.05}
        vy={0.1}
      />

      {/* Capa de partículas más luminosas */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={300}
        staticity={90}
        ease={30}
        color="#FF4500"
        minSize={0.3}
        maxSize={1.2}
        speed={0.2}
        vx={0.1}
        vy={-0.1}
      />
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        staticity={90}
        ease={10}
        color="#0000"
        minSize={2}
        maxSize={3}
        speed={0.2}
        vx={0.4}
        vy={-0.4}
      />


      {/* Capa adicional para partículas violetas */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={300}
        staticity={80}
        ease={80}
        color="#8A2BE2"
        minSize={0.4}
        maxSize={2}
        speed={0.3}
        vx={-0.08}
        vy={0.05}
      />

      {/* Meteors */}
      {!showGame && (
        <div className="absolute inset-0 z-5 flex items-center justify-center">
          <div className="apocalyptic-planet"></div>
          <Meteors />
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {!showGame ? (
          <div>
            <h1 className="content__title text-purple-400">Lezale</h1>
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-purple-900/30 text-purple-500 text-2xl border-2 border-purple-800/50 rounded hover:bg-purple-950 hover:text-purple-400 transition-all duration-500 font-retro mb-4"
            >
              INICIAR JUEGO
            </button>
          </div>
        ) : (
          <GameScreen />
        )}
      </div>
    </div>
  );
}

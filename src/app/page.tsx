'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../app/globals.css";
import { MorphingText } from "@/components/magicui/morphing-text";

export default function Home() {
  const router = useRouter();
  const [animationFinished, setAnimationFinished] = useState(false);

  const navigateToGame = () => {
    if (!animationFinished) return; // Solo navega si la animación finalizó
    window.location.href = "/game";
    router.push("/game");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black">
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
        onClick={navigateToGame}
      >
        <MorphingText
          texts={[
            'Bienvenido a Lezal',
            'Intenta que tus compañeros',
            'no te maten',
            '...',
            '...',
            '...',
            'o matalos primero!'
          ]}
          className="mb-48"
          onComplete={() => setAnimationFinished(true)}
        />
        {animationFinished && (
          <p className="animate-pulse text-white">
            Por favor haz click en cualquier parte para empezar el juego
          </p>
        )}
      </div>
    </div>
  );
}

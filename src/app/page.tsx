'use client';
import { useRouter } from "next/navigation";
import "../app/globals.css";
import { MorphingText } from "@/components/magicui/morphing-text";

export default function Home() {
  const router = useRouter();
  const navigateToGame = () => {
    window.location.href = "/game";
    router.push("/game");
    router.refresh();
  };
  return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-black" onClick={() => navigateToGame()}>
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black flex-col">
          <MorphingText
            texts={['Bienvenido','a Lezal','Intenta', 'sobrevivir','O que tus','compañeros','no te maten']}
            className="mb-8 text-8xl text-white"
            />
            <p className="animate-pulse">Porfavor haz click en cualquier parte para empezar el juego</p>
          </div>
      </div>
  );
}

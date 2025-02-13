'use client';
import { useRouter } from "next/navigation";
import "../app/globals.css";

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
            <h1 className="text-4xl text-white font-bold ">
              Bienvenido!
            </h1>
            <p className="animate-pulse">Porfavor haz click en cualquier parte para empezar el juego</p>
          </div>
      </div>
  );
}

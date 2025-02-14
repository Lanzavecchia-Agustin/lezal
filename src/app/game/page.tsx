'use client';
import { useState, useEffect } from "react";
import Particles from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";
import GameScreen from "@/components/GameScreen";
import { gameConfig } from "../../../roomsStore";
import { useAudio } from "@/context/AudioProvider";

export default function Home() {
    const { setAudio } = useAudio();


    const [showGame, setShowGame] = useState(false);

    useEffect(() => {
        const musicItem = gameConfig.find((item) => item.id === "initialMusic");
        console.log(musicItem)
        setAudio(String(musicItem?.value));
    }, []);


    const handleContinue = () => {
        setShowGame(true);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-black">
            {/* Capas de partículas */}
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


            {/* {!showGame && (
                <div className="absolute inset-0 z-5 flex items-center justify-center">
                    <div className="apocalyptic-planet">
                    </div>
                    <Meteors number={30} />
                </div>
            )} */}


            {/* Contenido principal */}
            {/* <div className="relative z-10 flex flex-col items-center justify-center text-center">
                {!showGame ? (
                    <div>
                        <h1 className="content__title text-white">Lezal</h1>
                        <button
                            onClick={handleContinue}
                            className="px-6 py-3 bg-purple-900/30 text-purple-500 text-2xl border-2 border-purple-800/50 rounded hover:bg-purple-950 hover:text-purple-400 transition-all duration-500 font-retro mb-4"
                        >
                            Crear partida
                        </button>
                    </div>
                ) : (
                    // <GameScreen />
                )}
            </div> */}
            <GameScreen />
        </div>
    );
}

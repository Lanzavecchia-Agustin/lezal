'use client';
import React, { createContext, useContext, useState, useEffect } from "react";

interface AudioContextProps {
  audio: string;
  setAudio: (src: string) => void;
  volume: number; // valor entre 0 y 100
  setVolume: (v: number) => void;
}

const AudioContext = createContext<AudioContextProps>({
  audio: "",
  setAudio: () => {},
  volume: 100,
  setVolume: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para la URL del audio y para el volumen
  const [audio, setAudio] = useState<string>("");
  const [volume, setVolume] = useState(100);

  // Al montar, hacemos fetch al endpoint para obtener la configuración inicial
  useEffect(() => {
    fetch("http://localhost:3001/gameConfig")
      .then((res) => res.json())
      .then((data) => {
        // Se espera que data sea un arreglo de objetos { id, value }
        const initialMusicItem = data.find((item: { id: string; value: unknown }) => item.id === "initialMusic");
        if (initialMusicItem && initialMusicItem.value) {
          setAudio(String(initialMusicItem.value));
        }
      })
      .catch((err) => {
        console.error("Error fetching gameConfig:", err);
      });
  }, []);

  console.log(audio)

  return (
    <AudioContext.Provider value={{ audio, setAudio, volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

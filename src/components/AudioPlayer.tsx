"use client";
import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  audioSrc?: string;
  targetVolume?: number;
}

/**
 * Mapea un porcentaje (0–100) a un valor real (0–1) usando una curva exponencial.
 */
const mapVolume = (percent: number): number => {
  return Math.pow(Math.max(0, Math.min(percent, 100)) / 100, 2);
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, targetVolume = 100 }) => {
  const [currentAudio, setCurrentAudio] = useState<string | undefined>(audioSrc);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use this to track if the player has started once (so we can skip initial fade).
  const hasStarted = useRef<boolean>(false);

  // Mantiene siempre el volumen según el targetVolume (solo si no estás en transición).
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = mapVolume(targetVolume);
    }
  }, [targetVolume]);

  // Cambia el audio. Si es la primera vez -> reproduccion inmediata
  // Caso contrario -> fade out / fade in
  useEffect(() => {
    if (!audioSrc || !audioRef.current) return;

    const audioEl = audioRef.current;

    // Si es la primera vez que se asigna audio, reproducimos instantáneamente.
    if (!hasStarted.current) {
      setCurrentAudio(audioSrc);
      audioEl.src = audioSrc;
      audioEl.load();
      audioEl.play().catch(console.error);
      hasStarted.current = true;
      return;
    }

    // Si ya se reprodujo algo antes y no hay cambio en la fuente, no hacemos nada.
    if (audioSrc === currentAudio) return;

    // --- FADE OUT + FADE IN ---
    let fadeOutVolume = audioEl.volume;
    const stepCount = 20;       // Aumenta para mayor suavidad
    const fadeDuration = 500;   // Duración en ms de cada fade (out o in)
    const intervalTime = fadeDuration / stepCount;

    // Fade out
    const fadeOutInterval = setInterval(() => {
      fadeOutVolume = Math.max(0, fadeOutVolume - (audioEl.volume / stepCount));
      audioEl.volume = fadeOutVolume;

      if (fadeOutVolume <= 0.01) {
        clearInterval(fadeOutInterval);
        audioEl.volume = 0;

        // Cambiamos la fuente
        setCurrentAudio(audioSrc);
        audioEl.src = audioSrc;
        audioEl.load();
        audioEl.play().catch(console.error);

        // Fade in
        let fadeInVolume = 0;
        const target = mapVolume(targetVolume);
        const fadeInInterval = setInterval(() => {
          fadeInVolume = Math.min(target, fadeInVolume + target / stepCount);
          audioEl.volume = fadeInVolume;

          if (fadeInVolume >= target - 0.01) {
            audioEl.volume = target;
            clearInterval(fadeInInterval);
          }
        }, intervalTime);
      }
    }, intervalTime);
  }, [audioSrc, currentAudio, targetVolume]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      loop
      style={{ display: "none" }}
    >
      <source src={currentAudio || ""} type="audio/mpeg" />
      Tu navegador no soporta el elemento de audio.
    </audio>
  );
};

export default AudioPlayer;

"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  /** Enlace al audio que viene desde la escena */
  audioSrc?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  // Almacena el último audio recibido.
  const [currentAudio, setCurrentAudio] = useState<string | undefined>(audioSrc);
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * Realiza una transición (fade out y fade in) al cambiar de audio.
   * @param newAudio El nuevo enlace de audio.
   */
  const fadeTransition = (newAudio: string) => {
    if (!audioRef.current) return;

    const fadeOutDuration = 2000; // Duración del fade out en milisegundos.
    const fadeInDuration = 1000; // Duración del fade in en milisegundos.
    const intervalTime = 50; // Intervalo de tiempo para los pasos del fade.

    // Si no hay audio previo (o el src es vacío), saltamos el fade out.
    if (!audioRef.current.src || audioRef.current.src === "" || audioRef.current.src === window.location.href) {
      setCurrentAudio(newAudio);
      audioRef.current.src = newAudio;
      audioRef.current.load();
      audioRef.current.volume = 0;
      audioRef.current
        .play()
        .then(() => {
          const fadeInSteps = fadeInDuration / intervalTime;
          const volumeStepIn = 1 / fadeInSteps;
          const fadeInInterval = setInterval(() => {
            if (audioRef.current) {
              if (audioRef.current.volume < 1 - volumeStepIn) {
                audioRef.current.volume = Math.min(1, audioRef.current.volume + volumeStepIn);
              } else {
                audioRef.current.volume = 1;
                clearInterval(fadeInInterval);
              }
            }
          }, intervalTime);
        })
        .catch((err) => console.error("Error al reproducir el audio:", err));
      return;
    }

    // Si ya hay audio reproduciéndose, realizamos fade out.
    const fadeOutSteps = fadeOutDuration / intervalTime;
    const fadeInSteps = fadeInDuration / intervalTime;
    const currentVolume = audioRef.current.volume || 1;
    const volumeStepOut = currentVolume / fadeOutSteps;
    const volumeStepIn = 1 / fadeInSteps;

    const fadeOutInterval = setInterval(() => {
      if (audioRef.current) {
        if (audioRef.current.volume > volumeStepOut) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - volumeStepOut);
        } else {
          clearInterval(fadeOutInterval);
          audioRef.current.volume = 0;
          setCurrentAudio(newAudio);
          audioRef.current.src = newAudio;
          audioRef.current.load();
          audioRef.current
            .play()
            .then(() => {
              const fadeInInterval = setInterval(() => {
                if (audioRef.current) {
                  if (audioRef.current.volume < 1 - volumeStepIn) {
                    audioRef.current.volume = Math.min(1, audioRef.current.volume + volumeStepIn);
                  } else {
                    audioRef.current.volume = 1;
                    clearInterval(fadeInInterval);
                  }
                }
              }, intervalTime);
            })
            .catch((err) => console.error("Error al reproducir el nuevo audio:", err));
        }
      }
    }, intervalTime);
  };

  // Detecta cambios en audioSrc para iniciar la transición.
  useEffect(() => {
    if (audioSrc && audioSrc !== currentAudio) {
      fadeTransition(audioSrc);
    }
  }, [audioSrc, currentAudio]);

  // Siempre renderizamos el elemento <audio>, incluso si currentAudio es undefined.
  return (
    <audio
      ref={audioRef}
      autoPlay
      loop
      // Ocultamos el elemento para que no se muestren controles.
      style={{ display: "none" }}
    >
      <source src={currentAudio || ""} type="audio/mpeg" />
      Tu navegador no soporta el elemento de audio.
    </audio>
  );
};

export default AudioPlayer;

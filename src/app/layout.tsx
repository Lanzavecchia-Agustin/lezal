'use client';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import React, { useState } from "react";
import { Settings } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import AudioConfigModal from "@/components/AudioConfigModal";
import { AudioProvider, useAudio } from "@/context/AudioProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


function GlobalAudio() {
  const { audio, volume } = useAudio();
  return <AudioPlayer audioSrc={audio} targetVolume={volume} />;
}

function AudioConfigModalWrapper({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { volume, setVolume } = useAudio();
  if (!show) return null;
  return (
    <AudioConfigModal
      volume={volume}
      onVolumeChange={setVolume}
      onClose={onClose}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAudioConfig, setShowAudioConfig] = useState(false);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AudioProvider>
          {/* Ícono de configuración (engranaje) fijo en la esquina superior derecha */}
          <button
            onClick={() => setShowAudioConfig(true)}
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 1000,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Configuración de sonido"
          >
            <Settings size={24} className="text-white" />
          </button>

          {/* Reproductor de audio global */}
          <GlobalAudio />

          {children}
          <Toaster />

          {/* Modal de configuración de sonido */}
          <AudioConfigModalWrapper show={showAudioConfig} onClose={() => setShowAudioConfig(false)} />
        </AudioProvider>
      </body>
    </html>
  );
}

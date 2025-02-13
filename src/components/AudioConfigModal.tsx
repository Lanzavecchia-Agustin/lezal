'use client';
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface AudioConfigModalProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
}

const AudioConfigModal: React.FC<AudioConfigModalProps> = ({
  volume,
  onVolumeChange,
  onClose,
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuracion</DialogTitle>
          <DialogDescription>
            Ajusta el volumen de la aplicación.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <label
            htmlFor="volume"
            className="block text-sm font-medium text-gray-700"
          >
            Volumen: {volume}%
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Cerrar
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioConfigModal;

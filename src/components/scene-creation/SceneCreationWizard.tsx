"use client";
import React, { useState, useEffect } from "react";
import StepBasicData from "./StepBasicData";
import StepSceneOptions from "./StepSceneOptions";
import StepReview from "./StepReview";
import type { FormSceneBasicData, FormSceneOptionData, SceneData, SceneOption } from "./SceneCreationTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface SceneCreationWizardProps {
  sceneToEdit?: SceneData;
}

const initialBasicData: FormSceneBasicData = {
  id: "",
  text: "",
  isEnding: false,
};

const initialOptionData: FormSceneOptionData = {
  id: 1,
  text: "",
  maxVotes: 0,
  requirement: [],
  lockedAttributeIncrement: { attribute: "", increment: 0 },
  nextSceneId: { success: "", failure: "", partial: "" },
};

const SceneCreationWizard: React.FC<SceneCreationWizardProps> = ({ sceneToEdit }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Inicializar con la escena a editar o con los valores por defecto
  const [basicData, setBasicData] = useState<FormSceneBasicData>(
    sceneToEdit ? { id: sceneToEdit.id, text: sceneToEdit.text, isEnding: sceneToEdit.isEnding } : initialBasicData
  );
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>(
    sceneToEdit ? sceneToEdit.options : []
  );
  const [optionData, setOptionData] = useState<FormSceneOptionData>(initialOptionData);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Efecto para actualizar los estados cuando sceneToEdit cambia
  useEffect(() => {
    if (sceneToEdit) {
      setBasicData({ id: sceneToEdit.id, text: sceneToEdit.text, isEnding: sceneToEdit.isEnding });
      setSceneOptions(sceneToEdit.options);
    } else {
      // Si no se pasa una escena para editar, se dejan los valores iniciales
      setBasicData(initialBasicData);
      setSceneOptions([]);
    }
  }, [sceneToEdit]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const submitScene = async () => {
    setSubmitting(true);
    const sceneId = basicData.id.replace(/\s+/g, "");
    const newScene: SceneData = {
      ...basicData,
      id: sceneId,
      options: sceneOptions,
    };
    try {
      if (sceneToEdit) {
        // Actualización de una escena existente (modo edición)
        const response = await fetch(`http://localhost:3001/scenes/${sceneToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newScene),
        });
        if (response.ok) {
          toast({
            title: "Escena actualizada",
            description: "La escena se ha actualizado correctamente.",
            variant: "default",
          });
        } else {
          throw new Error("Error al actualizar la escena");
        }
      } else {
        // Creación de una nueva escena
        const response = await fetch("http://localhost:3001/scenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newScene),
        });
        if (response.ok) {
          toast({
            title: "Escena creada",
            description: "La escena se ha creado exitosamente.",
            variant: "default",
          });
        } else {
          throw new Error("Error al crear la escena");
        }
      }
      // Reiniciar el wizard o navegar a otra vista según convenga
      setCurrentStep(1);
      setBasicData(initialBasicData);
      setSceneOptions([]);
      setOptionData(initialOptionData);
    } catch (error) {
      console.error("Error al enviar la escena:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la escena.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ["Datos Básicos", "Opciones de Escena", "Revisión"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {sceneToEdit ? "Editar Escena" : "Crear Escena"}
          </h2>
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > index + 1
                      ? "bg-green-500"
                      : currentStep === index + 1
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  } text-white text-sm font-medium`}
                >
                  {currentStep > index + 1 ? "✓" : index + 1}
                </div>
                <span className="mt-2 text-xs text-gray-600">{step}</span>
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <StepBasicData basicData={basicData} setBasicData={setBasicData} />}
              {currentStep === 2 && (
                <StepSceneOptions
                  optionData={optionData}
                  setOptionData={setOptionData}
                  sceneOptions={sceneOptions}
                  setSceneOptions={setSceneOptions}
                  isEnding={basicData.isEnding}
                />
              )}
              {currentStep === 3 && <StepReview basicData={basicData} sceneOptions={sceneOptions} />}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
              >
                Anterior
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onClick={nextStep} className="bg-blue-500 hover:bg-blue-600 text-white ml-auto">
                Siguiente
              </Button>
            ) : (
              <Button onClick={submitScene} disabled={submitting} className="bg-green-500 hover:bg-green-600 text-white ml-auto">
                {submitting ? "Enviando..." : sceneToEdit ? "Guardar Cambios" : "Crear Escena"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SceneCreationWizard;

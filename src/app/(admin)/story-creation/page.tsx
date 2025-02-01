"use client";
import React, { useState } from "react";
import {
  ATRIBUTOS_DISPONIBLES,
  Attributes,
  LOCKED_ATTRIBUTES,
  Scene,
} from "../../../../roomsStore";
import SceneFormOption from "@/components/story-creation/sceneFormOption";
import {
  FormSceneBasicData,
  FormSceneOptionData,
} from "@/components/story-creation/InterfacesSceneFormOption";
import ReadScenes from "@/components/story-creation/readScenes";
import FormAttributes from "@/components/story-creation/formAttributes";

// Creamos tipos de unión a partir de las constantes importadas
type AtributosDisponibles = (typeof ATRIBUTOS_DISPONIBLES)[number] | "";
type LockedAttributes = (typeof LOCKED_ATTRIBUTES)[number] | "";

const Page: React.FC = () => {
  const [unlocksLockedAttribute, setUnlocksLockedAttribute] =
    useState<boolean>(false);
  const [formSceneBasicData, setFormSceneBasicData] =
    useState<FormSceneBasicData>({
      id: "",
      text: "",
      isEnding: false,
    });
  const [formSceneOptionData, setFormSceneOptionData] =
    useState<FormSceneOptionData>({
      id: 1,
      text: "",
      maxVotes: 0,
      requirement: [] as AtributosDisponibles[],
      lockedAttributeIncrement: {
        attribute: "" as LockedAttributes,
        increment: 0,
      },
      nextSceneId: {
        success: "",
        failure: "",
        partial: "",
      },
    });
  const [formAttributeData, setFormAttributeData] = useState<Attributes>({
    id: "-1", // id es string
    name: "",
    unlockable: false,
    unlock_threshold: 1,
  });
  const [sceneOptions, setSceneOptions] = useState<any[]>([]);
  const [newScenes, setNewScenes] = useState<Array<object>>([]);
  const [showAttForm, setShowAttForm] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormSceneOptionData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: keyof typeof formSceneOptionData
  ) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    ) as AtributosDisponibles[];
    setFormSceneOptionData((prevState) => ({
      ...prevState,
      [field]: value as AtributosDisponibles[],
    }));
  };

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormSceneBasicData({
      ...formSceneBasicData,
      [name]: value,
    });
  };

  const PostScene = async (newScene: Scene) => {
    try {
      const response = await fetch("http://localhost:3001/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScene),
      });
      console.log("Escena agregada con éxito");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Generar el ID de la escena; se elimina espacios y se antepone "scene"
    const newSceneId = "scene" + formSceneBasicData.id.replace(/ /g, "");
    const newScene = {
      ...formSceneBasicData,
      options: sceneOptions,
      id: newSceneId,
    };
    // Actualizamos el estado de nuevas escenas (si fuera necesario)
    setNewScenes((prevScenes) => ({
      ...prevScenes,
      ...newScene,
    }));
    setSceneOptions([]); // Reiniciamos las opciones
    setFormSceneBasicData({
      id: "",
      text: "",
      isEnding: false,
    });
    setFormSceneOptionData({
      ...formSceneOptionData,
      id: 1,
    });
    document.getElementById("header")?.scrollIntoView({
      behavior: "smooth",
    });
    await PostScene(newScene);
  };

  return (
    <div id="header" className="min-h-screen text-slate-700 flex flex-col bg-slate-100">
      <button
        onClick={() => setShowAttForm(!showAttForm)}
        className="m-2 flex justify-center text-wrap py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Ver/ocultar formulario para crear atributo
      </button>
      <div className="flex justify-center mt-1">
        {showAttForm && (
          <FormAttributes
            formAttributeData={formAttributeData}
            setFormAttributeData={setFormAttributeData}
          />
        )}
      </div>
      <div className="flex justify-center mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border border-slate-300 w-full max-w-4xl"
        >
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-slate-700 mb-4">
              Creación de Escenas
            </h1>
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-slate-700 text-md font-bold mb-2"
            >
              Nombre de la escena
            </label>
            <div className="flex">
              <p className="pt-1.5 text-slate-600 text-md">scene</p>
              <input
                type="text"
                id="id"
                name="id"
                value={formSceneBasicData.id}
                onChange={handleBasicChange}
                className="shadow appearance-none border rounded w-full py-2 pr-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder="OtakuCompletamenteLoco"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-slate-700 text-md font-bold mb-2"
            >
              Texto
            </label>
            <textarea
              id="text"
              name="text"
              value={formSceneBasicData.text}
              onChange={handleBasicChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="El otaku estaba completamente loco. Ninguna persona cuerda consideraría algo de lo que pasaba por su mente como 'normal'."
            />
          </div>
          <div className="mb-4 flex gap-6">
            <label
              htmlFor="isEnding"
              className="block text-slate-700 text-md font-bold"
            >
              ¿Es un ending?
            </label>
            <div>
              <input
                type="checkbox"
                id="isEnding"
                name="isEnding"
                checked={formSceneBasicData.isEnding}
                onChange={(e) => {
                  setFormSceneBasicData({
                    ...formSceneBasicData,
                    isEnding: e.target.checked,
                  });
                  setSceneOptions([]);
                }}
                className="align-middle leading-tight"
              />
              <span className="text-slate-700 text-sm p-1">Sí</span>
            </div>
          </div>
          <hr className="mb-2" />
          <SceneFormOption
            formSceneBasicData={formSceneBasicData}
            sceneOptions={sceneOptions}
            setSceneOptions={setSceneOptions}
            formSceneOptionData={formSceneOptionData}
            setFormSceneOptionData={setFormSceneOptionData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            setUnlocksLockedAttribute={setUnlocksLockedAttribute}
            unlocksLockedAttribute={unlocksLockedAttribute}
          />
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-slate-700 m-5 self-end hover:bg-slate-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              ¡Crear Escena!
            </button>
          </div>
        </form>
      </div>
      <hr className="my-5" />
      <h1 className="text-center text-xl">Escenas anteriores:</h1>
      <pre className="max-w-screen-xl mx-auto p-6 bg-slate-300 text-wrap w-2/3 text-white rounded-lg shadow-md">
        <ReadScenes />
      </pre>
    </div>
  );
};

export default Page;

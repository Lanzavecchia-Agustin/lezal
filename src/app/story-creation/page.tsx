"use client";
import React, { Fragment, useState } from "react";
import { ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES, Scene } from "../../../roomsStore";
import SceneFormOption from "../../components/story-creation/sceneFormOption";
import {
  FormSceneBasicData,
  FormSceneOptionData,
} from "@/components/story-creation/InterfacesSceneFormOption";

type AtributosDisponibles = (typeof ATRIBUTOS_DISPONIBLES)[number] | ""; // Esto crea un tipo de unión con los valores de ATRIBUTOS_DISPONIBLES
type LockedAttributes = (typeof LOCKED_ATTRIBUTES)[number] | ""; // Esto crea un tipo de unión con los valores de LOCKED_Attributes

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
        attribute: "" as LockedAttributes, // Usa el tipo correcto
        increment: 0,
      },
      nextSceneId: {
        success: "",
        failure: "",
        partial: "",
      },
    });
  const [sceneOptions, setSceneOptions] = useState<any[]>([]);
  const [newScenes, setNewScenes] = useState<Array<object>>([]);

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
    ) as AtributosDisponibles[]; // Asegura que los valores sean del tipo correcto

    setFormSceneOptionData((prevState) => ({
      ...prevState,
      [field]: value as AtributosDisponibles[], // Actualiza requirement como un arreglo
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

  const fetchAttributes = async (newScene:Scene) => {
    try {
      const response = await fetch("http://localhost:3001/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScene),
      });
      console.log("agregado con exito")
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newScene = {
      ...formSceneBasicData,
      options: sceneOptions,
      id: "scene" + formSceneBasicData.id.replace(/ /g, ""), //saca espacios
    };
    const sceneObject = { [newScene.id]: newScene };
    setNewScenes((prevScenes) => ({
      ...prevScenes,
      ... newScene, 
    }));
    setSceneOptions([]); //borra las opciones que venías creando
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
    await fetchAttributes(newScene)
  };

  return (
    <div id="header" className="min-h-screen flex flex-col bg-slate-100">
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
              <p className="pt-1.5 text-slate-600 text-md ">scene</p>
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
              className="block text-slate-700 text-md font-bold "
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
                className=" align-middle leading-tight"
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
              className="bg-slate-700  m-5 self-end hover:bg-slate-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              ¡Crear Escena!
            </button>
          </div>
        </form>
      </div>
      <div className="flex mt-3 justify-center">
        <h1>Salida:</h1>
      </div>
      <pre className="max-w-4xl mx-auto p-6 bg-black text-wrap w-2/3 text-white rounded-lg shadow-md">
        {JSON.stringify(newScenes,null, 2)}
      </pre>
    </div>
  );
};

export default Page;

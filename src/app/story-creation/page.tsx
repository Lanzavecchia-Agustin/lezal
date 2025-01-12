"use client";
import React, { useState } from "react";

const ATRIBUTOS_DISPONIBLES = [
  //ESTO TIENE Q VENIR DESDE roomsStore.ts
  "fuerte",
  "inteligente",
  "carismatico",
  "trolo",
  "autista",
  "otaku",
] as const;

const LOCKED_ATTRIBUTES = ["inutil", "responsable"] as const;
type AtributosDisponibles = (typeof ATRIBUTOS_DISPONIBLES)[number]; // Esto crea un tipo de unión con los valores de ATRIBUTOS_DISPONIBLES
type LockedAttributes = (typeof LOCKED_ATTRIBUTES)[number]; // Esto crea un tipo de unión con los valores de LOCKED_Attributes

const Page: React.FC = () => {
  const [formSceneBasicData, setFormSceneBasicData] = useState({
    id: "",
    text: "",
    isEnding: false,
  });
  const [formSceneOptionData, setFormSceneOptionData] = useState({
    id: 1,
    text: "",
    maxVotes: 0,
    requirement:  "" as AtributosDisponibles | "", // Aquí especificamos que `requirement` es un arreglo de valores que solo puede contener valores de ATRIBUTOS_DISPONIBLES
    lockedAttributeIncrement: {
      attribute:  "" as LockedAttributes | "",
      increment: 1,
    },
    nextSceneId: {
      success: "",
      failure: "",
      partial: "",
    },
  });
  const [sceneOptions, setSceneOptions] = useState<any[]>([]);
  const [newScenes, setNewScenes] = useState<Record<string, any>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormSceneOptionData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: string,
    nestedField?: string
  ) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormSceneOptionData((prevState) => {
      if (nestedField) {
        // Si es un campo anidado
        return {
          ...prevState,
          [field]: {
            ...prevState[field],
            [nestedField]: value,
          },
        };
      }
      // Si no es un campo anidado
      return {
        ...prevState,
        [field]: value,
      };
    });
  };

  const handleIncrementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormSceneOptionData((prevState) => ({
      ...prevState,
      lockedAttributeIncrement: {
        ...prevState.lockedAttributeIncrement,
        increment: parseInt(value, 10),
      },
    }));
  };

  const handleChange = (
    //TODOOOO CAMBIAR nombre A handleBASIC CHANGE!!!!!!!!!!!!!!!!!!
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormSceneBasicData({
      ...formSceneBasicData,
      [name]: value,
    });
  };

  const handleAddOption = () => {
    setSceneOptions((prevSceneOptions) => [
      ...prevSceneOptions,
      formSceneOptionData,
    ]);
    // Reset the form state after adding the option
    setFormSceneOptionData({
      id: formSceneOptionData.id + 1,
      text: "",
      maxVotes: 0,
      requirement: [],
      lockedAttributeIncrement: { attribute: [], increment: 1 },
      nextSceneId: { success: "", failure: "", partial: "" },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newScene = {
      ...formSceneBasicData,
      options: sceneOptions,
      id: "scene" + formSceneBasicData.id,
    };
    const sceneObject = { [newScene.id]: newScene };
    setNewScenes((prevScenes) => ({
      ...prevScenes,
      [newScene.id]: newScene, // Añadir la nueva escena como un atributo del objeto
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
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
                onChange={handleChange}
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
              onChange={handleChange}
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

          {/* Agregar una opción*/}
          {!formSceneBasicData.isEnding && (
            <div>
              <div className="flex justify-center">
                <h1 className="text-xl font-bold text-slate-700 mb-2 pt-2">
                  Creador de opciones
                </h1>
              </div>
              <div className="mb-6">
                {sceneOptions.map((opcion) => (
                  <div
                    className="bg-slate-400 py-2 my-3 px-4 rounded-md w-full text-left text-white"
                    key={opcion.id}
                  >
                    {opcion.id},{opcion.text}
                  </div>
                ))}
              </div>

              <div className="max-w-4xl mx-auto p-6 bg-slate-100 rounded-lg shadow-md">
                <div className="flex justify-center">
                  <h1 className="text-xl font-bold text-slate-700 mb-4">
                    Nueva Opción
                  </h1>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-slate-700 font-semibold mb-2">
                      Texto
                    </label>
                    <input
                      type="text"
                      name="text"
                      value={formSceneOptionData.text}
                      onChange={handleInputChange}
                      placeholder="Huir rápidamente del otaku..."
                      className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-slate-700 font-semibold mb-2">
                      Máximo de votos
                    </label>
                    <input
                      type="number"
                      name="maxVotes"
                      value={formSceneOptionData.maxVotes}
                      onChange={handleInputChange}
                      className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-slate-700 flex gap-2 font-semibold mb-2">
                      Requerimientos{" "}
                      <p className="text-slate-500 text-sm align-text-bottom">
                        Elige varios con ctrl.
                      </p>
                    </label>
                    <select
                      multiple
                      name="requirement"
                      value={formSceneOptionData.requirement}
                      onChange={(e) => handleSelectChange(e, "requirement")}
                      className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      {ATRIBUTOS_DISPONIBLES.map((atributo) => (
                        <option key={atributo} value={atributo}>
                          {atributo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex">
                    <label
                      htmlFor="lockedAttributeIncrementAttribute"
                      className="block font-semibold align-middle text-md text-slate-700 w-1/2 mb-1"
                    >
                      Desbloqueo de atributo oculto
                    </label>
                    <select
                      id="lockedAttributeIncrementAttribute"
                      value={
                        formSceneOptionData.lockedAttributeIncrement
                          .attribute || ""
                      }
                      onChange={(e) =>
                        setFormSceneOptionData((prevState) => ({
                          ...prevState,
                          lockedAttributeIncrement: {
                            ...prevState.lockedAttributeIncrement,
                            attribute: e.target.value as LockedAttributes, // Asegurar el tipo correcto
                          },
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="" disabled>
                        Selecciona un atributo
                      </option>
                      {LOCKED_ATTRIBUTES.map((atributo) => (
                        <option key={atributo} value={atributo}>
                          {atributo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex">
                    <label className="block align-middle font-semibold text-md text-slate-700 w-1/2 mb-1">
                      Incremento del atributo oculto
                    </label>
                    <input
                      type="number"
                      value={
                        formSceneOptionData.lockedAttributeIncrement.increment
                      }
                      onChange={handleIncrementChange}
                      className="border border-slate-300 w-full rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="mb-4 flex">
                    <label
                      htmlFor="nextSceneIdSuccess"
                      className="block text-sm font-medium text-slate-700 mb-1 w-1/2"
                    >
                      ID de la Siguiente Escena (Éxito)
                    </label>
                    <input
                      type="text"
                      id="nextSceneIdSuccess"
                      value={formSceneOptionData.nextSceneId.success}
                      onChange={(e) =>
                        setFormSceneOptionData((prevState) => ({
                          ...prevState,
                          nextSceneId: {
                            ...prevState.nextSceneId,
                            success: e.target.value, // Actualiza solo la propiedad "success"
                          },
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="mb-4 flex">
                    <label
                      htmlFor="nextSceneIdFailure"
                      className="block text-sm font-medium text-slate-700 mb-1 w-1/2"
                    >
                      ID de la Siguiente Escena (Fracaso)
                    </label>
                    <input
                      type="text"
                      id="nextSceneIdFailure"
                      value={formSceneOptionData.nextSceneId.failure}
                      onChange={(e) =>
                        setFormSceneOptionData((prevState) => ({
                          ...prevState,
                          nextSceneId: {
                            ...prevState.nextSceneId,
                            failure: e.target.value, // Actualiza solo la propiedad "failure"
                          },
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="mb-4 flex">
                    <label
                      htmlFor="nextSceneIdPartial"
                      className="block text-sm font-medium text-slate-700 mb-1 w-1/2"
                    >
                      ID de la Siguiente Escena (Parcial)
                    </label>
                    <input
                      type="text"
                      id="nextSceneIdPartial"
                      value={formSceneOptionData.nextSceneId.partial}
                      onChange={(e) =>
                        setFormSceneOptionData((prevState) => ({
                          ...prevState,
                          nextSceneId: {
                            ...prevState.nextSceneId,
                            partial: e.target.value, // Actualiza solo la propiedad "partial"
                          },
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="bg-slate-600 text-white rounded-md py-2 px-4 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Agregar Opción
                  </button>
                </div>
              </div>
            </div>
          )}

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
      <pre className="max-w-4xl mx-auto p-6 bg-black text-wrap text-white rounded-lg shadow-md">
        {JSON.stringify(newScenes)}
      </pre>
      <div className="flex-grow bg-slate-100">
        {/* Espacio para el canvas */}
      </div>
    </div>
  );
};

export default Page;

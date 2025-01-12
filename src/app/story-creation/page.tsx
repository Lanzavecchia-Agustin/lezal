"use client";
import React, { Fragment, useState } from "react";

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
  const [unlocksLockedAttribute, setUnlocksLockedAttribute] =
    useState<Boolean>(false);
  const [formSceneBasicData, setFormSceneBasicData] = useState({
    id: "",
    text: "",
    isEnding: false,
  });
  const [formSceneOptionData, setFormSceneOptionData] = useState({
    id: 1,
    text: "",
    maxVotes: 0,
    requirement: "" as AtributosDisponibles | "", // Aquí especificamos que `requirement` es un arreglo de valores que solo puede contener valores de ATRIBUTOS_DISPONIBLES
    lockedAttributeIncrement: {
      attribute: "" as LockedAttributes | "",
      increment: 0,
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
    field: keyof typeof formSceneOptionData,
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
            ...(prevState as Record<string, any>),
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

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormSceneBasicData({
      ...formSceneBasicData,
      [name]: value,
    });
  };

  const handleAddOption = () => {
    let sceneOptionData = {
      ...formSceneOptionData,
      lockedAttributeIncrement: unlocksLockedAttribute
        ? formSceneOptionData.lockedAttributeIncrement
        : undefined,
      maxVotes:
        formSceneOptionData.maxVotes <= 0
          ? undefined
          : formSceneOptionData.maxVotes,
    };
    setSceneOptions((prevSceneOptions) => [
      ...prevSceneOptions,
      sceneOptionData,
    ]);
    // Reset the form state after adding the option
    setFormSceneOptionData({
      id: formSceneOptionData.id + 1,
      text: "",
      maxVotes: 0,
      requirement: "" as AtributosDisponibles | "",
      lockedAttributeIncrement: {
        attribute: "" as LockedAttributes | "",
        increment: 0,
      },
      nextSceneId: { success: "", failure: "", partial: "" },
    });
    document.getElementById("headerOption")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleDeleteOption = (idToDelete: number) => {
    // Eliminar la opción con el id correspondiente
    const updatedSceneOptions = sceneOptions.filter(
      (option) => option.id !== idToDelete
    );
  
    // Reasignar los ids de las opciones restantes para mantener el orden consecutivo
    const renumberedSceneOptions = updatedSceneOptions.map((option, index) => ({
      ...option,
      id: index + 1, // Nuevo id basado en el índice (comienza desde 1)
    }));
  
    // Actualizar el estado con las opciones reordenadas
    setSceneOptions(renumberedSceneOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newScene = {
      ...formSceneBasicData,
      options: sceneOptions,
      id: "scene" + formSceneBasicData.id.replace(/ /g, ""), //saca espacios
    };
    const sceneObject = { [newScene.id]: newScene };
    setNewScenes((prevScenes) => ({
      ...prevScenes,
      [newScene.id]: newScene, // Añadir la nueva escena como un atributo del objeto
    }));
    setSceneOptions([]); //borra las opciones que venías creando
    setFormSceneBasicData({
      //borra el titulo y eso
      id: "",
      text: "",
      isEnding: false,
    });
    setFormSceneOptionData({
      //reinicia los id de las opciones del form opciones
      ...formSceneOptionData,
      id: 1,
    });
    document.getElementById("header")?.scrollIntoView({
      behavior: "smooth",
    });
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

          {/* Agregar una opción*/}
          {!formSceneBasicData.isEnding && (
            <div id="headerOption">
              <div className="flex justify-center">
                <h1 className="text-xl font-bold text-slate-700 mb-2 pt-2">
                  Creador de opciones
                </h1>
              </div>
              <div className="mb-6">
                {sceneOptions.map(
                  (
                    opcion //Renderizar opciones ya creadas
                  ) => (
                    <div
                      className="bg-slate-400 py-2 my-3 px-4 rounded-md w-full text-left text-white"
                      key={opcion.id}
                    >
                      {" "}
                      <p className="inline-block">
                        {opcion.id}: {opcion.text} | Req:{" "}
                        {opcion.requirement || "Ninguno"} | maxVotos:{" "}
                        {opcion.maxVotes} | Atrib Oculto:{" "}
                        {opcion.lockedAttributeIncrement?.attribute ||
                          "Ninguno"}
                        , +{opcion.lockedAttributeIncrement?.increment || "0"}
                      </p>
                      <p className="inline mx-2 text-rose-700 underline cursor-pointer" onClick={()=>handleDeleteOption(opcion.id)}>
                        Eliminar
                      </p>
                    </div>
                  )
                )}
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
                    <label className="text-slate-700 flex gap-2 font-semibold mb-2">
                      Máximo de votos{" "}
                      <p className="text-slate-500 text-xs  pt-1.5">
                        "0" es ninguno.
                      </p>
                    </label>
                    <input
                      type="number"
                      name="maxVotes"
                      min="0"
                      value={formSceneOptionData.maxVotes}
                      onChange={handleInputChange}
                      className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-slate-700 flex gap-2 font-semibold mb-2">
                      Requerimientos{" "}
                      <p className="text-slate-500 text-xs pt-1.5">
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

                  <div className="mb-4 flex gap-6">
                    <label
                      htmlFor="isEnding"
                      className="block text-slate-700 text-md font-bold "
                    >
                      ¿Esta opción desbloquea algún atributo oculto?
                    </label>
                    <div>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          setUnlocksLockedAttribute(!unlocksLockedAttribute);
                        }}
                        className="align-middle leading-tight"
                      />
                      <span className="text-slate-700 text-sm p-1">Sí</span>
                    </div>
                  </div>

                  {unlocksLockedAttribute && (
                    <Fragment>
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
                            Elige un atributo
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
                          min="1"
                          value={
                            formSceneOptionData.lockedAttributeIncrement
                              .increment
                          }
                          onChange={handleIncrementChange}
                          className="border border-slate-300 w-full rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </Fragment>
                  )}

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
      <pre className="max-w-4xl mx-auto p-6 bg-black text-wrap w-2/3 text-white rounded-lg shadow-md">
        {JSON.stringify(newScenes, null, 2)}
      </pre>
      <div className="flex-grow mt-2 bg-slate-100">
        {/* Espacio para el canvas */}
      </div>
    </div>
  );
};

export default Page;

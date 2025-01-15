import { Fragment } from "react";
import { ATRIBUTOS_DISPONIBLES, LOCKED_ATTRIBUTES } from "../../../roomsStore";
import { Dispatch, SetStateAction } from "react";
import {
  AtributosDisponibles,
  HomeProps,
  LockedAttributes,
} from "./InterfacesSceneFormOption";

export default function Home({
  formSceneBasicData,
  sceneOptions,
  setSceneOptions,
  formSceneOptionData,
  handleInputChange,
  handleSelectChange,
  setUnlocksLockedAttribute,
  unlocksLockedAttribute,
  setFormSceneOptionData,
}: HomeProps) {
  const handleDeleteOption = (idToDelete: number) => {
    const updatedSceneOptions = sceneOptions.filter(
      (option) => option.id !== idToDelete
    );
    const renumberedSceneOptions = updatedSceneOptions.map((option, index) => ({
      ...option,
      id: index + 1,
    }));
    setSceneOptions(renumberedSceneOptions);
  };

  const handleIncrementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormSceneOptionData((prevState) => ({
      ...prevState,
      lockedAttributeIncrement: {
        ...prevState.lockedAttributeIncrement,
        increment: parseInt(value, 10), // Asegurando el tipo número
      },
    }));
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
      id: 1,
      text: "",
      maxVotes: 0,
      requirement: [] as AtributosDisponibles[],
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
    document.getElementById("headerOption")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div>
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
                    {opcion.lockedAttributeIncrement?.attribute || "Ninguno"}, +
                    {opcion.lockedAttributeIncrement?.increment || "0"}
                  </p>
                  <p
                    className="inline mx-2 text-rose-700 underline cursor-pointer"
                    onClick={() => handleDeleteOption(opcion.id)}
                  >
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
                      value={
                        formSceneOptionData.lockedAttributeIncrement.attribute
                      }
                      onChange={(e) =>
                        setFormSceneOptionData((prevState) => ({
                          ...prevState,
                          lockedAttributeIncrement: {
                            ...prevState.lockedAttributeIncrement,
                            attribute: e.target.value as LockedAttributes, // Asegura el tipo correcto
                          },
                        }))
                      }
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
                        formSceneOptionData.lockedAttributeIncrement.increment
                      }
                      onChange={handleIncrementChange}
                      className="border border-slate-300 w-full rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </Fragment>
              )}

              {/* IDs de las siguientes escenas */}
              {["success", "failure", "partial"].map((key) => (
                <div key={key} className="flex gap-3">
                  <label className="text-slate-700 pt-1.5 font-semibold mb-2">
                    ID de la Siguiente Escena ({key})
                  </label>
                  <input
                    type="text"
                    value={
                      formSceneOptionData.nextSceneId[
                        key as keyof typeof formSceneOptionData.nextSceneId
                      ]
                    }
                    onChange={(e) =>
                      setFormSceneOptionData((prevState) => ({
                        ...prevState,
                        nextSceneId: {
                          ...prevState.nextSceneId,
                          [key]: e.target.value,
                        },
                      }))
                    }
                    className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 flex-grow focus:ring-slate-500"
                  />
                </div>
              ))}

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
    </div>
  );
}

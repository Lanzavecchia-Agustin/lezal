import { Attributes } from "../../../roomsStore";
import { Dispatch, SetStateAction } from "react";
import db from "../../../db.json";

interface FormAttributesProps {
  formAttributeData: Attributes;
  setFormAttributeData: Dispatch<SetStateAction<Attributes>>;
}

export default function FormAttributes({
  formAttributeData,
  setFormAttributeData,
}: FormAttributesProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, type, value, checked } = e.target;

    setFormAttributeData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const PostAttribute = async (att: Attributes) => {
    try {
      const response = await fetch("http://localhost:3001/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(att),
      });
      console.log("Att agregado con exito");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ultimoAtt: Attributes | undefined = db.attributes.at(-1);
    const newId = ultimoAtt ? ultimoAtt.id + 1 : 1;
    const newAtt = {
      ...formAttributeData,
      id: newId,
      unlock_threshold: !formAttributeData.unlockable
        ? undefined
        : formAttributeData.unlock_threshold,
    };
    await PostAttribute(newAtt)
  };
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border border-slate-300 w-full max-w-4xl">
      <div className="flex justify-center">
        <h1 className="text-xl font-bold text-slate-700 mb-4">
          Creación de Attributos
        </h1>
      </div>
      <div className="flex flex-wrap justify-between">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre del Atributo
          </label>
          <input
            type="text"
            id="name"
            placeholder="Rebelde..."
            value={formAttributeData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="unlockable"
            className="block text-sm font-medium text-gray-700"
          >
            ¿Es oculto?
          </label>
          <input
            type="checkbox"
            id="unlockable"
            checked={formAttributeData.unlockable}
            onChange={handleChange}
            className="mt-1 block h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
        </div>
        {formAttributeData.unlockable && (
          <div className="mb-4">
            <label
              htmlFor="unlock_threshold"
              className="block text-sm font-medium text-gray-700"
            >
              Nivel Requerido
            </label>
            <input
              type="number"
              id="unlock_threshold"
              value={formAttributeData.unlock_threshold}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min="1"
              required
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="flex-shrink justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

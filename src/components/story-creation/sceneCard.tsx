import db from "../../../db.json";
import { Scene } from "../../../roomsStore";

interface SceneCardProps {
  scene: Scene;
}

export default function SceneCard(scene: SceneCardProps) {
  const escena = scene.scene;
  return (
    <div className="max-w-sm w-full p-6 bg-white border text-gray-700 dark:text-gray-400 border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <h5 className="mb-2 text-2xl font-sans break-words font-bold tracking-tight text-gray-900 dark:text-white">
        {escena.id}
      </h5>
      <p className="mb-3 font-normal font-sans text-pretty">{escena.text}</p>
      <hr />
      <p className="text-center">opciones</p>
      {escena.options.map((opcion) => (
        <div
          className="flex cursor-default flex-col justify-center px-3 py-2 my-1 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <p className="font-sans font-bold w">{opcion.text}</p>
          {opcion.requirement && "Req: " + opcion.requirement}
          {opcion.maxVotes && "| maxVotos:" + opcion.maxVotes}
          {opcion.lockedAttributeIncrement &&
            "| Unlock Att:" +
              opcion.lockedAttributeIncrement.attribute +
              " +" +
              opcion.lockedAttributeIncrement.increment}
          <hr />
          <p>EXITO: {opcion.nextSceneId.success}</p>
          <p>FAIL: {opcion.nextSceneId.failure}</p>
          {opcion.nextSceneId.partial && <p>PARTIAL: {opcion.nextSceneId.partial}</p>}
        </div>
      ))}
      {escena.isEnding && (
        <div className="text-red-600 text-center">Es un ending!</div>
      )}
    </div>
  );
}

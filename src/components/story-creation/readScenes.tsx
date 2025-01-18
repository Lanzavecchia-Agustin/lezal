import db from "../../../db.json"
import { Scene } from "../../../roomsStore";
import SceneCard from "./sceneCard";

const escenas = db.scenes.reverse()
export default function ReadScenes() {
  return (
    <div className="flex flex-wrap justify-around gap-3">
        {escenas.map((scene: Scene)=>(
            <SceneCard scene={scene}/>
        ))}
    </div>
  );
}

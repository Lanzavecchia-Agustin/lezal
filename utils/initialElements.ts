// initialElements.ts

import { Scene } from "../types/scene"; 
import type { Node, Edge } from "reactflow";

/**
 * Transforma tu array de `scenes` (con success/failure/partial) 
 * en `initialNodes` y `initialEdges`, muy parecido al ejemplo.
 */
export function buildInitialElements(scenes: Scene[]) {
  const position = { x: 0, y: 0 };
  const edgeType = "smoothstep";  // o "default", etc.

  // 1) Creamos "initialNodes" (un nodo por escena)
  const initialNodes: Node[] = scenes.map((scene, idx) => {
    // Por simplicidad, data.label = scene.id
    //  o podrías meter la info que desees
    return {
      id: scene.id,
      data: { label: scene.id },
      position, // 0,0 => luego dagre ajusta
      // si quisieras un nodo "input" para la 1ra, etc.
      // type: scene.isEnding ? "output" : "default",
      type: "default" 
    };
  });

  // 2) Creamos "initialEdges" leyendo las opciones de cada escena
  const initialEdges: Edge[] = [];

  for (const scene of scenes) {
    if (!scene.options) continue;

    for (const opt of scene.options) {
      // nextSceneId => success/failure/partial
      if (!opt.nextSceneId) continue;

      const baseId = `E-${scene.id}-${opt.id}`; 
      // para evitar colisiones, pues each "option" produce
      // hasta 3 edges
      const edgeConf = {
        type: edgeType,
        animated: true
      };

      // success
      if (opt.nextSceneId.success) {
        initialEdges.push({
          id: `${baseId}-success`,
          source: scene.id,
          target: opt.nextSceneId.success,
          label: "success",
          ...edgeConf
        });
      }
      // failure
      if (opt.nextSceneId.failure) {
        initialEdges.push({
          id: `${baseId}-failure`,
          source: scene.id,
          target: opt.nextSceneId.failure,
          label: "failure",
          ...edgeConf
        });
      }
      // partial
      if (opt.nextSceneId.partial) {
        initialEdges.push({
          id: `${baseId}-partial`,
          source: scene.id,
          target: opt.nextSceneId.partial,
          label: "partial",
          ...edgeConf
        });
      }
    }
  }

  return { initialNodes, initialEdges };
}

import type { Scene } from "../../roomsStore";
import { Link } from "../../types/scene";

export function buildGraph(scenes: Scene[]): Map<string, Link[]> {
  const graph = new Map<string, Link[]>();

  // Inicializa cada scene.id con array vacío
  for (const scene of scenes) {
    graph.set(scene.id, []);
  }

  // Llena el grafo según las opciones
  for (const scene of scenes) {
    if (!scene.options) continue;

    for (const opt of scene.options) {
      const nextIds = opt.nextSceneId;
      if (!nextIds) continue;

      if (nextIds.success) {
        graph.get(scene.id)?.push({
          from: scene.id,
          to: nextIds.success,
          type: 'success',
        });
      }
      if (nextIds.failure) {
        graph.get(scene.id)?.push({
          from: scene.id,
          to: nextIds.failure,
          type: 'failure',
        });
      }
      if (nextIds.partial) {
        graph.get(scene.id)?.push({
          from: scene.id,
          to: nextIds.partial,
          type: 'partial',
        });
      }
    }
  }

  return graph;
}

export function getLineColor(type: 'success' | 'failure' | 'partial'): string {
  switch (type) {
    case 'success':
      return '#4CAF50';
    case 'failure':
      return '#F44336';
    case 'partial':
      return '#FF9800';
  }
}

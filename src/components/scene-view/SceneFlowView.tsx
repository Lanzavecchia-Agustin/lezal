"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { getLayoutedNodesEdges } from "../../../utils/getLayoutedNodesEdges";
import { buildGraph, getLineColor } from "@/lib/sceneUtils"; 
import { SceneFlowNode } from "./SceneFlowNode";
import type { Scene } from "../../../roomsStore";
import { useRouter } from "next/navigation";

const nodeTypes = {
  sceneCustom: SceneFlowNode,
};

interface SceneFlowViewProps {
  scenes: Scene[];
}

export default function SceneFlowView({ scenes: initialScenes }: SceneFlowViewProps) {
  const router = useRouter();
  // Usamos un estado local para gestionar las escenas
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);

  // Función para eliminar una escena
  async function deleteScene(sceneId: string) {
    try {
      // 1. Obtener todas las escenas
      const res = await fetch("http://localhost:3001/scenes");
      if (!res.ok) {
        throw new Error("Error al obtener las escenas");
      }
      const allScenes: Scene[] = await res.json();

      // 2. Actualizar cada escena que tenga referencias a la escena que se eliminará
      for (const scene of allScenes) {
        let updated = false;
        const updatedOptions = scene.options.map((option) => {
          const newNextSceneId = { ...option.nextSceneId };
          if (newNextSceneId.success === sceneId) {
            newNextSceneId.success = "";
            updated = true;
          }
          if (newNextSceneId.failure === sceneId) {
            newNextSceneId.failure = "";
            updated = true;
          }
          if (newNextSceneId.partial === sceneId) {
            newNextSceneId.partial = "";
            updated = true;
          }
          return { ...option, nextSceneId: newNextSceneId };
        });
        if (updated) {
          await fetch(`http://localhost:3001/scenes/${scene.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...scene, options: updatedOptions }),
          });
        }
      }

      // 3. Eliminar la escena
      const deleteRes = await fetch(`http://localhost:3001/scenes/${sceneId}`, {
        method: "DELETE",
      });
      if (!deleteRes.ok) {
        throw new Error("Error al eliminar la escena");
      }

      alert("Escena eliminada correctamente.");

      // Actualizamos el estado para quitar la escena eliminada
      setScenes((prevScenes) => prevScenes.filter((s) => s.id !== sceneId));

      // Opcionalmente, puedes refrescar la página:
      // router.refresh();
    } catch (error) {
      console.error("Error en la eliminación de la escena:", error);
      alert("Ocurrió un error al eliminar la escena.");
    }
  }

  // Construir el grafo a partir de las escenas actualizadas
  const graph = useMemo(() => buildGraph(scenes), [scenes]);

  const { nodesBase, edgesBase } = useMemo(() => {
    const nodes: Node<{ scene: Scene; deleteScene: (id: string) => Promise<void> }>[] = scenes.map((scene) => ({
      id: scene.id,
      data: { scene, deleteScene }, // Pasamos la función deleteScene a cada nodo
      type: "sceneCustom",
      position: { x: 0, y: 0 },
    }));

    const edges: Edge[] = [];
    graph.forEach((links, fromId) => {
      links.forEach((link, i) => {
        edges.push({
          id: `${link.from}-${link.to}-${i}`,
          source: link.from,
          target: link.to,
          label: link.type,
          markerEnd: "arrow",
          style: { stroke: getLineColor(link.type) },
          labelStyle: { fill: getLineColor(link.type) },
          animated: link.type === "partial",
        });
      });
    });

    return { nodesBase: nodes, edgesBase: edges };
  }, [scenes, graph]);

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    return getLayoutedNodesEdges(nodesBase, edgesBase, 320, 220, "TB");
  }, [nodesBase, edgesBase]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Este efecto actualiza los nodos y edges cuando cambian los valores calculados
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

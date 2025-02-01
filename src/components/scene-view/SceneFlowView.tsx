// components/flow/SceneFlowView.tsx
"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";

import { getLayoutedNodesEdges } from "../../../utils/getLayoutedNodesEdges";
import { buildGraph, getLineColor } from "@/lib/sceneUtils"; 
import { SceneFlowNode } from "./SceneFlowNode";
import type { Scene } from "../../../roomsStore";

// Definimos un "custom node" para renderizar tu SceneCard
const nodeTypes = {
  sceneCustom: SceneFlowNode,
};

interface NodeData {
  scene: Scene;
}

interface SceneFlowViewProps {
  scenes: Scene[];
}

export default function SceneFlowView({ scenes }: SceneFlowViewProps) {
  // 1. Construir tu grafo (success/failure/partial) a partir de las escenas
  const graph = useMemo(() => buildGraph(scenes), [scenes]);

  // 2. Generar nodos (sin coords) y edges
  const { nodesBase, edgesBase } = useMemo(() => {
    const nodes: Node<NodeData>[] = scenes.map((scene) => ({
      id: scene.id,
      data: { scene },
      type: "sceneCustom",
      position: { x: 0, y: 0 } // se lo asigna dagre
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
          animated: link.type === "partial"
        });
      });
    });

    return { nodesBase: nodes, edgesBase: edges };
  }, [scenes, graph]);

  // 3. Llamar a getLayoutedNodesEdges -> dagre
  //    (320x220 tamaño de la tarjeta, layout 'TB' = top-bottom)
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    return getLayoutedNodesEdges(
      nodesBase,
      edgesBase,
      320,
      220,
      "TB"
    );
  }, [nodesBase, edgesBase]);

  // 4. Manejamos estado con React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

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
        <Background  gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// components/flow/getLayoutedNodesEdges.ts
import dagre from "dagre";
import type { Edge, Node } from "reactflow";

/**
 * Aplica dagre para un layout estilo árbol top-bottom.
 * - ranksep: distancia vertical entre niveles
 * - nodesep: distancia horizontal entre nodos de un mismo nivel
 * - edgesep: espacio mínimo entre aristas
 */
export function getLayoutedNodesEdges(
  nodes: Node[],
  edges: Edge[],
  nodeWidth = 320,
  nodeHeight = 220,
  direction: "TB" | "LR" = "TB"
): { layoutedNodes: Node[]; layoutedEdges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Paramétricas que puedes subir/bajar para mayor/menor separación.
  dagreGraph.setGraph({
    rankdir: direction,   // "TB" (top->bottom) produce un árbol vertical
    ranksep: 300,         // distancia vertical entre "niveles"
    nodesep: 200,         // distancia horizontal mínima entre nodos del mismo nivel
    edgesep: 50,          // espacio mínimo entre aristas
    marginx: 50,          // margen horizontal global
    marginy: 50           // margen vertical global
  });

  // 1. Asignamos cada nodo a dagre con su ancho y alto
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 2. Asignamos cada edge a dagre (source -> target)
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 3. Ejecutar layout
  dagre.layout(dagreGraph);

  // 4. Ajustamos la position (x, y) en cada nodo según el resultado de dagre
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPos.x - nodeWidth / 2,
      y: nodeWithPos.y - nodeHeight / 2
    };
    return node;
  });

  // Normalmente no modificamos edges, React Flow las dibuja
  return { layoutedNodes, layoutedEdges: edges };
}

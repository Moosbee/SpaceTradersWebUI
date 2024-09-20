import type { Node } from "@xyflow/react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// import "@xyflow/react/dist/base.css";
import { useCallback } from "react";
import { useAppSelector } from "../../../hooks";
import { selectDarkMode } from "../../../spaceTraderAPI/redux/configSlice";
import CustomeNode from "./nodes/CustomeNode";

const initialNodes: Node[] = [
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  {
    id: "node-1",
    type: "CustomeNode",
    position: { x: 0, y: 0 },
    data: { label: 123 },
  },
];
const initialEdges = [{ id: "e1-2", source: "2", target: "node-1" }];

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { CustomeNode: CustomeNode };

function AutomationEditor() {
  const isDarkMode = useAppSelector(selectDarkMode);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      colorMode={isDarkMode ? "dark" : "light"}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default AutomationEditor;

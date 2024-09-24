import type { Edge, Node } from "@xyflow/react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// import "@xyflow/react/dist/base.css";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import { useCallback, useRef } from "react";
import { useAppSelector } from "../../../hooks";
import { selectDarkMode } from "../../../spaceTraderAPI/redux/configSlice";
import ActionNode from "./nodes/ActionNode";
import AcceptContractActionNode from "./nodes/ActionNodes/AcceptContractActionNode";
import CreateChartActionNode from "./nodes/ActionNodes/CreateChartActionNode";
import CreateSurveyActionNode from "./nodes/ActionNodes/CreateSurveyActionNode";
import DeliverCargoToContractActionNode from "./nodes/ActionNodes/DeliverCargoToContractActionNode";
import DockShipActionNode from "./nodes/ActionNodes/DockShipActionNode";
import ExtractResourcesActionNode from "./nodes/ActionNodes/ExtractResourcesActionNode";
import ExtractResourcesWithSurveyActionNode from "./nodes/ActionNodes/ExtractResourcesWithSurveyActionNode";
import FulfillContractActionNode from "./nodes/ActionNodes/FulfillContractActionNode";
import InstallMountActionNode from "./nodes/ActionNodes/InstallMountActionNode";
import JettisonCargoActionNode from "./nodes/ActionNodes/JettisonCargoActionNode";
import JumpShipActionNode from "./nodes/ActionNodes/JumpShipActionNode";
import NavigateShipActionNode from "./nodes/ActionNodes/NavigateShipActionNode";
import NegotiateContractActionNode from "./nodes/ActionNodes/NegotiateContractActionNode";
import OrbitShipActionNode from "./nodes/ActionNodes/OrbitShipActionNode";
import PatchShipNavActionNode from "./nodes/ActionNodes/PatchShipNavActionNode";
import PurchaseCargoActionNode from "./nodes/ActionNodes/PurchaseCargoActionNode";
import PurchaseShipActionNode from "./nodes/ActionNodes/PurchaseShipActionNode";
import RefuelShipActionNode from "./nodes/ActionNodes/RefuelShipActionNode";
import RegisterNewAgentActionNode from "./nodes/ActionNodes/RegisterNewAgentActionNode";
import RemoveMountActionNode from "./nodes/ActionNodes/RemoveMountActionNode";
import RepairShipActionNode from "./nodes/ActionNodes/RepairShipActionNode";
import ScanShipsActionNode from "./nodes/ActionNodes/ScanShipsActionNode";
import ScanSystemsActionNode from "./nodes/ActionNodes/ScanSystemsActionNode";
import ScanWaypointsActionNode from "./nodes/ActionNodes/ScanWaypointsActionNode";
import ScrapShipActionNode from "./nodes/ActionNodes/ScrapShipActionNode";
import SellCargoActionNode from "./nodes/ActionNodes/SellCargoActionNode";
import SiphonResourcesActionNode from "./nodes/ActionNodes/SiphonResourcesActionNode";
import SupplyConstructionSiteActionNode from "./nodes/ActionNodes/SupplyConstructionSiteActionNode";
import TransferCargoActionNode from "./nodes/ActionNodes/TransferCargoActionNode";
import WarpShipActionNode from "./nodes/ActionNodes/WarpShipActionNode";
import EventNode from "./nodes/EventNode";
import IFNode from "./nodes/IFNode";
import SwitchNode from "./nodes/SwitchNode";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "EventNode",
    position: { x: 0, y: 0 },
    data: { label: 123 },
  },
];
const initialEdges: Edge[] = [];

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = {
  ActionNode: ActionNode,
  EventNode: EventNode,
  IFNode: IFNode,
  SwitchNode: SwitchNode,

  AcceptContractActionNode: AcceptContractActionNode,
  CreateChartActionNode: CreateChartActionNode,
  CreateSurveyActionNode: CreateSurveyActionNode,
  DeliverCargoToContractActionNode: DeliverCargoToContractActionNode,
  DockShipActionNode: DockShipActionNode,
  ExtractResourcesActionNode: ExtractResourcesActionNode,
  ExtractResourcesWithSurveyActionNode: ExtractResourcesWithSurveyActionNode,
  FulfillContractActionNode: FulfillContractActionNode,
  InstallMountActionNode: InstallMountActionNode,
  JettisonCargoActionNode: JettisonCargoActionNode,
  JumpShipActionNode: JumpShipActionNode,
  NavigateShipActionNode: NavigateShipActionNode,
  NegotiateContractActionNode: NegotiateContractActionNode,
  OrbitShipActionNode: OrbitShipActionNode,
  PatchShipNavActionNode: PatchShipNavActionNode,
  PurchaseCargoActionNode: PurchaseCargoActionNode,
  PurchaseShipActionNode: PurchaseShipActionNode,
  RefuelShipActionNode: RefuelShipActionNode,
  RegisterNewAgentActionNode: RegisterNewAgentActionNode,
  RemoveMountActionNode: RemoveMountActionNode,
  RepairShipActionNode: RepairShipActionNode,
  ScanShipsActionNode: ScanShipsActionNode,
  ScanSystemsActionNode: ScanSystemsActionNode,
  ScanWaypointsActionNode: ScanWaypointsActionNode,
  ScrapShipActionNode: ScrapShipActionNode,
  SellCargoActionNode: SellCargoActionNode,
  SiphonResourcesActionNode: SiphonResourcesActionNode,
  SupplyConstructionSiteActionNode: SupplyConstructionSiteActionNode,
  TransferCargoActionNode: TransferCargoActionNode,
  WarpShipActionNode: WarpShipActionNode,
};

function AutomationEditor() {
  const isDarkMode = useAppSelector(selectDarkMode);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const addPos = useRef(0);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = useCallback(
    (nodeType: string) => {
      addPos.current += 1;
      setNodes((nds) => [
        ...nds,
        {
          id: Math.random().toString(),
          type: nodeType,
          position: { x: 10 * addPos.current, y: 10 * addPos.current },
          data: {},
        },
      ]);
    },
    [setNodes],
  );

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "ActionNode",
      children: [
        {
          key: "AcceptContractActionNode",
          label: "AcceptContractActionNode",
          onClick: () => {
            addNode("AcceptContractActionNode");
          },
        },
        {
          key: "CreateChartActionNode",
          label: "CreateChartActionNode",
          onClick: () => {
            addNode("CreateChartActionNode");
          },
        },
        {
          key: "CreateSurveyActionNode",
          label: "CreateSurveyActionNode",
          onClick: () => {
            addNode("CreateSurveyActionNode");
          },
        },
        {
          key: "DeliverCargoToContractActionNode",
          label: "DeliverCargoToContractActionNode",
          onClick: () => {
            addNode("DeliverCargoToContractActionNode");
          },
        },
        {
          key: "DockShipActionNode",
          label: "DockShipActionNode",
          onClick: () => {
            addNode("DockShipActionNode");
          },
        },
        {
          key: "ExtractResourcesActionNode",
          label: "ExtractResourcesActionNode",
          onClick: () => {
            addNode("ExtractResourcesActionNode");
          },
        },
        {
          key: "ExtractResourcesWithSurveyActionNode",
          label: "ExtractResourcesWithSurveyActionNode",
          onClick: () => {
            addNode("ExtractResourcesWithSurveyActionNode");
          },
        },
        {
          key: "FulfillContractActionNode",
          label: "FulfillContractActionNode",
          onClick: () => {
            addNode("FulfillContractActionNode");
          },
        },
        {
          key: "InstallMountActionNode",
          label: "InstallMountActionNode",
          onClick: () => {
            addNode("InstallMountActionNode");
          },
        },
        {
          key: "JettisonCargoActionNode",
          label: "JettisonCargoActionNode",
          onClick: () => {
            addNode("JettisonCargoActionNode");
          },
        },
        {
          key: "JumpShipActionNode",
          label: "JumpShipActionNode",
          onClick: () => {
            addNode("JumpShipActionNode");
          },
        },
        {
          key: "NavigateShipActionNode",
          label: "NavigateShipActionNode",
          onClick: () => {
            addNode("NavigateShipActionNode");
          },
        },
        {
          key: "NegotiateContractActionNode",
          label: "NegotiateContractActionNode",
        },
        {
          key: "OrbitShipActionNode",
          label: "OrbitShipActionNode",
          onClick: () => {
            addNode("OrbitShipActionNode");
          },
        },
        {
          key: "PatchShipNavActionNode",
          label: "PatchShipNavActionNode",
          onClick: () => {
            addNode("PatchShipNavActionNode");
          },
        },
        {
          key: "PurchaseCargoActionNode",
          label: "PurchaseCargoActionNode",
          onClick: () => {
            addNode("PurchaseCargoActionNode");
          },
        },
        {
          key: "PurchaseShipActionNode",
          label: "PurchaseShipActionNode",
          onClick: () => {
            addNode("PurchaseShipActionNode");
          },
        },
        {
          key: "RefuelShipActionNode",
          label: "RefuelShipActionNode",
          onClick: () => {
            addNode("RefuelShipActionNode");
          },
        },
        {
          key: "RegisterNewAgentActionNode",
          label: "RegisterNewAgentActionNode",
        },
        {
          key: "RemoveMountActionNode",
          label: "RemoveMountActionNode",
          onClick: () => {
            addNode("RemoveMountActionNode");
          },
        },
        {
          key: "RepairShipActionNode",
          label: "RepairShipActionNode",
          onClick: () => {
            addNode("RepairShipActionNode");
          },
        },
        {
          key: "ScanShipsActionNode",
          label: "ScanShipsActionNode",
          onClick: () => {
            addNode("ScanShipsActionNode");
          },
        },
        {
          key: "ScanSystemsActionNode",
          label: "ScanSystemsActionNode",
          onClick: () => {
            addNode("ScanSystemsActionNode");
          },
        },
        {
          key: "ScanWaypointsActionNode",
          label: "ScanWaypointsActionNode",
          onClick: () => {
            addNode("ScanWaypointsActionNode");
          },
        },
        {
          key: "ScrapShipActionNode",
          label: "ScrapShipActionNode",
          onClick: () => {
            addNode("ScrapShipActionNode");
          },
        },
        {
          key: "SellCargoActionNode",
          label: "SellCargoActionNode",
          onClick: () => {
            addNode("SellCargoActionNode");
          },
        },
        {
          key: "SiphonResourcesActionNode",
          label: "SiphonResourcesActionNode",
          onClick: () => {
            addNode("SiphonResourcesActionNode");
          },
        },
        {
          key: "SupplyConstructionSiteActionNode",
          label: "SupplyConstructionSiteActionNode",
          onClick: () => {
            addNode("SupplyConstructionSiteActionNode");
          },
        },
        {
          key: "TransferCargoActionNode",
          label: "TransferCargoActionNode",
          onClick: () => {
            addNode("TransferCargoActionNode");
          },
        },
        {
          key: "WarpShipActionNode",
          label: "WarpShipActionNode",
          onClick: () => {
            addNode("WarpShipActionNode");
          },
        },
      ],
    },
    {
      key: "2",
      label: "EventNode",
      onClick: () => {
        addNode("EventNode");
      },
    },
    {
      key: "3",
      label: "IFNode",
      onClick: () => {
        addNode("IFNode");
      },
    },
    {
      key: "4",
      label: "SwitchNode",
      onClick: () => {
        addNode("SwitchNode");
      },
    },
  ];

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
      <Panel position="top-left">
        <Dropdown menu={{ items }} trigger={["click"]}>
          <Button>Add Node</Button>
        </Dropdown>
      </Panel>
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default AutomationEditor;

import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";
function RefuelShipActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`RefuelShipActionNode`} size="small">
      <p>RefuelShipActionNode</p>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </Card>
  );
}

export default RefuelShipActionNode;

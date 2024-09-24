import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";
function AcceptContractActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`AcceptContractActionNode`} size="small">
      <p>AcceptContractActionNode</p>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </Card>
  );
}

export default AcceptContractActionNode;

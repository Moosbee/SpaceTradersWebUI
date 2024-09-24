import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "antd";

function SwitchNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title="SwitchNode" size="small">
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      SwitchNode
    </Card>
  );
}

export default SwitchNode;

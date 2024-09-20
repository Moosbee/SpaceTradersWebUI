import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "antd";

function CustomeNode({
  data,
  isConnectable,
}: NodeProps<Node<{ label: number }>>) {
  return (
    <Card title={`CustomeNode ${data.label}`} size="small">
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      CustomeNode {data.label}
    </Card>
  );
}

export default CustomeNode;

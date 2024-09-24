import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "antd";

function IFNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title="IFNode" size="small">
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      IFNode
    </Card>
  );
}

export default IFNode;

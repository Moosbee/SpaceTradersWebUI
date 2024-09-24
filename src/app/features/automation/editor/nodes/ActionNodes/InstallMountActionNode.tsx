import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";
function InstallMountActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`InstallMountActionNode`} size="small">
      <p>InstallMountActionNode</p>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </Card>
  );
}

export default InstallMountActionNode;

import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";
function ExtractResourcesWithSurveyActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`ExtractResourcesWithSurveyActionNode`} size="small">
      <p>ExtractResourcesWithSurveyActionNode</p>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </Card>
  );
}

export default ExtractResourcesWithSurveyActionNode;

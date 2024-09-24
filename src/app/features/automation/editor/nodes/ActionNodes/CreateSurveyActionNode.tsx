import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";
function CreateSurveyActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`CreateSurveyActionNode`} size="small">
      <p>CreateSurveyActionNode</p>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </Card>
  );
}

export default CreateSurveyActionNode;

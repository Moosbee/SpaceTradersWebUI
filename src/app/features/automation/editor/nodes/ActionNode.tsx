import type { Node, NodeProps } from "@xyflow/react";
import { Card } from "antd";

function ActionNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return <Card title={`ActionNode`} size="small"></Card>;
}

export default ActionNode;

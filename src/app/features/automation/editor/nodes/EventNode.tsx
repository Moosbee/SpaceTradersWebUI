import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Card, Select } from "antd";

function EventNode({
  data,
  isConnectable,
}: NodeProps<Node<Record<string, unknown>>>) {
  return (
    <Card title={`EventNode`} size="small">
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <Select
        className="nodrag"
        options={[
          { value: "CooldownEnd", label: "Cooldown Stopped" },
          { value: "ShipTravelEnd", label: "Ship Arrived" },
        ]}
        style={{ width: 160 }}
      />
    </Card>
  );
}

export default EventNode;

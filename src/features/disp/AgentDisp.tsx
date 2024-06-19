import type { DescriptionsProps } from "antd"
import { Card, Descriptions } from "antd"
import type { Agent } from "../../utils/api"

function AgentDisp({ agent }: { agent: Agent }) {
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Symbol",
      children: <p>{agent.symbol}</p>,
    },
  ]

  if (agent.accountId) {
    items.push({
      key: "2",
      label: "Account Id",
      children: <p>{agent.accountId}</p>,
    })
  }
  items.push(
    ...[
      {
        key: "3",
        label: "Credits",
        children: <p>{agent.credits}</p>,
      },
      {
        key: "4",
        label: "Ship count",
        children: <p>{agent.shipCount}</p>,
      },
      {
        key: "5",
        label: "Headquarters",
        children: <p>{agent.headquarters}</p>,
      },
      {
        key: "6",
        label: "Starting Faction",
        children: <p>{agent.startingFaction}</p>,
      },
    ],
  )

  return (
    <div>
      <Card style={{ width: "fit-content" }}>
        <Descriptions
          title="Agent Info"
          bordered
          items={items}
          layout="vertical"
        />
      </Card>
    </div>
  )
}

export default AgentDisp

import type { DescriptionsProps } from "antd";
import { Card, Descriptions } from "antd";
import type { Agent, PublicAgent } from "../../spaceTraderAPI/api";
import MoneyDisplay from "../MonyDisplay";

function AgentDisp({ agent }: { agent: Agent | PublicAgent }) {
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Symbol",
      children: <p>{agent.symbol}</p>,
    },
  ];

  if ("accountId" in agent) {
    items.push({
      key: "2",
      label: "Account Id",
      children: <p>{agent.accountId}</p>,
    });
  }
  items.push(
    ...[
      {
        key: "3",
        label: "Credits",
        children: (
          <p>
            <MoneyDisplay amount={agent.credits} />
          </p>
        ),
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
  );

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
  );
}

export default AgentDisp;

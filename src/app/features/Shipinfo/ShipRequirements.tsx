import { Card, Flex, Table } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";

export function ShipRequirements({ ship }: { ship: Ship }) {
  const requirements = [
    ...[
      { symbol: ship.engine.symbol, ...ship.engine.requirements },
      { symbol: ship.reactor.symbol, ...ship.reactor.requirements },
      { symbol: ship.frame.symbol, ...ship.frame.requirements },
    ],
    ...ship.mounts.map((mount) => {
      return { symbol: mount.symbol, ...mount.requirements };
    }),
    ...ship.modules.map((module) => {
      return { symbol: module.symbol, ...module.requirements };
    }),
  ];

  return (
    <Card title="Ship Requirements">
      <Flex gap={8}>
        <Table
          // bordered
          pagination={false}
          size="small"
          columns={[
            { title: "Symbol", dataIndex: "symbol" },
            { title: "Power", dataIndex: "power" },
            { title: "Crew", dataIndex: "crew" },
            { title: "Slots", dataIndex: "slots" },
          ]}
          dataSource={requirements}
        />
        <Table
          // bordered
          pagination={false}
          size="small"
          columns={[
            { title: "Category", dataIndex: "category" },
            { title: "Total", dataIndex: "total" },
          ]}
          dataSource={[
            {
              category: "Crew",
              total: requirements
                .map((r) => r.crew || 0)
                .reduce((a, b) => a + b, 0),
            },
            {
              category: "Power",
              total: requirements
                .map((r) => r.power || 0)
                .reduce((a, b) => a + b, 0),
            },
            {
              category: "Module Slots",
              total: requirements
                .map((r) => r.slots || 0)
                .reduce((a, b) => a + b, 0),
            },
            {
              category: "Mount Slots",
              total: ship.mounts.length,
            },
          ]}
        />
        <Table
          // bordered
          pagination={false}
          size="small"
          columns={[
            { title: "Category", dataIndex: "category" },
            { title: "Total", dataIndex: "total" },
          ]}
          dataSource={[
            {
              category: "Crew",
              total: ship.modules
                .filter((m) => m.symbol === "MODULE_CREW_QUARTERS_I")
                .map((m) => m.capacity || 0)
                .reduce((a, b) => a + b, 0),
            },
            {
              category: "Power",
              total: ship.reactor.powerOutput,
            },
            {
              category: "Module Slots",
              total: ship.frame.moduleSlots,
            },
            {
              category: "Mount Slots",
              total: ship.frame.mountingPoints,
            },
          ]}
        />
      </Flex>
    </Card>
  );
}

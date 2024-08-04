import type { DescriptionsProps } from "antd";
import { Descriptions } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";

function ShipEngineInfo({ ship }: { ship: Ship }) {
  const itemsEngine: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.engine.symbol}</span>,
      span: 2,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.engine.description}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.engine.name}</span>,
    },
    {
      key: "speed",
      label: "Speed",
      children: <span>{ship.engine.speed}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.engine.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.engine.integrity}/1</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.engine.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.engine.requirements.crew}
              <br />
            </>
          )}
          {ship.engine.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.engine.requirements.power}
              <br />
            </>
          )}
          {ship.engine.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.engine.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <Descriptions
      title="Engine Info"
      bordered
      items={itemsEngine}
      layout="vertical"
    ></Descriptions>
  );
}

export default ShipEngineInfo;

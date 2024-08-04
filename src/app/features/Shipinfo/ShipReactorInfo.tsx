import type { DescriptionsProps } from "antd";
import { Descriptions } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";

function ShipReactorInfo({ ship }: { ship: Ship }) {
  const itemsReactor: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.reactor.symbol}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.reactor.name}</span>,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.reactor.description}</span>,
    },
    {
      key: "powerOutput",
      label: "Power Output",
      children: <span>{ship.reactor.powerOutput}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.reactor.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.reactor.integrity}/1</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.reactor.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.reactor.requirements.crew}
              <br />
            </>
          )}
          {ship.reactor.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.reactor.requirements.power}
              <br />
            </>
          )}
          {ship.reactor.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.reactor.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <Descriptions
      title="Reactor Info"
      bordered
      items={itemsReactor}
      layout="vertical"
    ></Descriptions>
  );
}

export default ShipReactorInfo;

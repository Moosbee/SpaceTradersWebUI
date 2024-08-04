import { Descriptions, type DescriptionsProps } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";

function ShipFrameInfo({ ship }: { ship: Ship }) {
  const itemsFrame: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.frame.symbol}</span>,
      span: 2,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.frame.description}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.frame.name}</span>,
    },
    {
      key: "fuelCapacity",
      label: "Fuel Capacity",
      children: <span>{ship.frame.fuelCapacity}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.frame.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.frame.integrity}/1</span>,
    },
    {
      key: "moduleSlots",
      label: "Module Slots",
      children: <span>{ship.frame.moduleSlots}</span>,
    },
    {
      key: "mountingPoints",
      label: "Mounting Points",
      children: <span>{ship.frame.mountingPoints}</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.frame.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.frame.requirements.crew}
              <br />
            </>
          )}
          {ship.frame.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.frame.requirements.power}
              <br />
            </>
          )}
          {ship.frame.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.frame.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <Descriptions
      title="Frame Info"
      bordered
      items={itemsFrame}
      layout="vertical"
    ></Descriptions>
  );
}

export default ShipFrameInfo;
